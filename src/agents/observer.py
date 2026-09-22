"""Observer Agent — Telemetry Compression Engine.

Compresses potentially megabytes of raw error traces, DOM dumps, and
log output into a strictly typed JSON diagnostic of ≤15 fields.  This
compressed payload is what gets sent to Tavily for web intelligence
and to Nemotron for patch synthesis — enforcing LLM token economy.

Design constraint: NEVER feed raw traces to an LLM. Always compress first.
"""

from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Any


# Maximum number of fields in the compressed diagnostic.
_MAX_DIAGNOSTIC_FIELDS = 15

# Maximum length for any single string value in the diagnostic.
_MAX_VALUE_LENGTH = 200

# Patterns to extract framework-specific hints from error bodies.
_FRAMEWORK_PATTERNS: dict[str, re.Pattern[str]] = {
    "FastAPI": re.compile(r"fastapi|starlette", re.IGNORECASE),
    "Django": re.compile(r"django", re.IGNORECASE),
    "Flask": re.compile(r"flask|werkzeug", re.IGNORECASE),
    "Express": re.compile(r"express|node\.?js", re.IGNORECASE),
}

# Patterns to detect specific vulnerability types.
_VULNERABILITY_PATTERNS: dict[str, re.Pattern[str]] = {
    "race_condition": re.compile(r"race|concurrent|toctou|atomicity", re.IGNORECASE),
    "invariant_violation": re.compile(r"invariant|corrupt|integrity", re.IGNORECASE),
    "null_reference": re.compile(r"nonetype|null\s*pointer|undefined", re.IGNORECASE),
    "overflow": re.compile(r"overflow|underflow|out\s*of\s*bound", re.IGNORECASE),
    "auth_bypass": re.compile(r"unauthorized|forbidden|auth", re.IGNORECASE),
    "injection": re.compile(r"injection|sql|xss|script", re.IGNORECASE),
}


class ObserverAgent:
    """Compresses raw incident telemetry into LLM-friendly diagnostics.

    The Observer sits between the Invariant Filter and the Patcher,
    ensuring that only clean, compressed context reaches the AI models.
    """

    @staticmethod
    def compress_telemetry(
        endpoint: str,
        method: str,
        status_code: int,
        raw_body: str,
        *,
        extra_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Compress raw error data into a ≤15-field diagnostic payload.

        Args:
            endpoint: The URL path that was attacked (e.g. "/checkout").
            method: HTTP method used (e.g. "POST").
            status_code: HTTP response status code.
            raw_body: The full raw response body text.
            extra_context: Optional additional context (timing, request data).

        Returns:
            A dictionary with at most 15 keys, suitable for LLM consumption.
        """
        # --- Extract error signature (first meaningful line) ---
        error_signature = ObserverAgent._extract_error_signature(raw_body)

        # --- Detect framework ---
        framework = ObserverAgent._detect_framework(raw_body)

        # --- Detect vulnerability type ---
        vulnerability_type = ObserverAgent._detect_vulnerability(raw_body)

        # --- Check for invariant breach ---
        invariant_breach = bool(
            re.search(r"INVARIANT|CORRUPTED|dropped below zero", raw_body, re.IGNORECASE)
        )

        # --- Generate a stable fingerprint for deduplication ---
        fingerprint = hashlib.sha256(
            f"{endpoint}:{method}:{status_code}:{error_signature}".encode()
        ).hexdigest()[:16]

        # --- Build the compressed diagnostic ---
        diagnostic: dict[str, Any] = {
            "endpoint": endpoint,
            "method": method.upper(),
            "status_code": status_code,
            "error_signature": ObserverAgent._truncate(error_signature, _MAX_VALUE_LENGTH),
            "invariant_breach": invariant_breach,
            "vulnerability_type": vulnerability_type,
            "framework": framework,
            "severity": "critical" if status_code >= 500 else "warning",
            "action_required": ObserverAgent._suggest_action(
                vulnerability_type, invariant_breach
            ),
            "fingerprint": fingerprint,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "raw_body_length": len(raw_body),
            "compression_ratio": f"{len(raw_body)} → {ObserverAgent._estimate_output_size()} chars",
        }

        # --- Merge extra context (respecting field limit) ---
        if extra_context:
            remaining_slots = _MAX_DIAGNOSTIC_FIELDS - len(diagnostic)
            for key, value in list(extra_context.items())[:remaining_slots]:
                diagnostic[f"ctx_{key}"] = ObserverAgent._truncate(str(value), _MAX_VALUE_LENGTH)

        # --- Enforce hard cap ---
        assert len(diagnostic) <= _MAX_DIAGNOSTIC_FIELDS, (
            f"Diagnostic exceeds {_MAX_DIAGNOSTIC_FIELDS} fields: {len(diagnostic)}"
        )

        return diagnostic

    @staticmethod
    def format_for_llm(diagnostic: dict[str, Any]) -> str:
        """Format a compressed diagnostic as a clean string for LLM prompts.

        Returns a human-readable summary suitable for insertion into
        system prompts sent to Nemotron.
        """
        lines = [
            f"Incident Diagnostic (compressed):",
            f"  Endpoint:       {diagnostic.get('endpoint', 'unknown')}",
            f"  Method:         {diagnostic.get('method', 'unknown')}",
            f"  Status:         {diagnostic.get('status_code', 'unknown')}",
            f"  Error:          {diagnostic.get('error_signature', 'unknown')}",
            f"  Invariant:      {'BREACHED' if diagnostic.get('invariant_breach') else 'intact'}",
            f"  Vulnerability:  {diagnostic.get('vulnerability_type', 'unknown')}",
            f"  Framework:      {diagnostic.get('framework', 'unknown')}",
            f"  Severity:       {diagnostic.get('severity', 'unknown')}",
            f"  Action:         {diagnostic.get('action_required', 'unknown')}",
        ]
        return "\n".join(lines)

    # --- Private helpers ---

    @staticmethod
    def _extract_error_signature(raw_body: str) -> str:
        """Extract the most meaningful error line from a raw response body."""
        if not raw_body:
            return "Empty response body"

        # Look for explicit error/detail fields in JSON-like responses
        detail_match = re.search(r'"detail"\s*:\s*"([^"]+)"', raw_body)
        if detail_match:
            return detail_match.group(1)

        # Look for common error patterns
        error_match = re.search(
            r"(Error|Exception|CRITICAL|FATAL|Traceback)[^\n]*", raw_body, re.IGNORECASE
        )
        if error_match:
            return error_match.group(0).strip()

        # Fall back to first non-empty line
        for line in raw_body.splitlines():
            stripped = line.strip()
            if stripped and len(stripped) > 10:
                return stripped

        return raw_body[:_MAX_VALUE_LENGTH]

    @staticmethod
    def _detect_framework(raw_body: str) -> str:
        """Detect the target's web framework from response content."""
        for name, pattern in _FRAMEWORK_PATTERNS.items():
            if pattern.search(raw_body):
                return name
        return "unknown"

    @staticmethod
    def _detect_vulnerability(raw_body: str) -> str:
        """Classify the vulnerability type from error content."""
        for vuln_type, pattern in _VULNERABILITY_PATTERNS.items():
            if pattern.search(raw_body):
                return vuln_type
        return "unknown"

    @staticmethod
    def _suggest_action(vulnerability_type: str, invariant_breach: bool) -> str:
        """Generate a human-readable action suggestion."""
        if invariant_breach and vulnerability_type == "race_condition":
            return "Fix async race condition — add mutex/lock around shared state mutations"
        if invariant_breach:
            return "Investigate state corruption — add validation guards and atomic operations"
        if vulnerability_type == "race_condition":
            return "Add concurrency protection (asyncio.Lock or database-level locking)"
        if vulnerability_type == "auth_bypass":
            return "Review authentication middleware and access control rules"
        if vulnerability_type == "injection":
            return "Sanitize inputs and use parameterized queries"
        return "Investigate and apply appropriate fix"

    @staticmethod
    def _truncate(text: str, max_length: int) -> str:
        """Truncate a string to max_length, adding ellipsis if needed."""
        if len(text) <= max_length:
            return text
        return text[: max_length - 3] + "..."

    @staticmethod
    def _estimate_output_size() -> int:
        """Estimate the compressed output size in characters."""
        # Average diagnostic is ~400-600 chars
        return 500
