"""Invariant Filter — the swarm's noise-cancellation layer.

Separates actionable failures (server errors, state corruptions) from
benign client errors (4xx validation responses) to prevent the swarm
from wasting cycles on non-bugs.

Design:
  - HTTP 400, 401, 403, 404, 422 → DISCARD (handled client errors)
  - HTTP >= 500 OR body contains invariant/corruption keywords → ACTIONABLE
"""

from __future__ import annotations

import re


# Pre-compiled patterns for invariant breach detection in response bodies.
_INVARIANT_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"INVARIANT\s+CORRUPTED", re.IGNORECASE),
    re.compile(r"race\s+condition", re.IGNORECASE),
    re.compile(r"dropped\s+below\s+zero", re.IGNORECASE),
    re.compile(r"state\s+corruption", re.IGNORECASE),
    re.compile(r"critical\s+state", re.IGNORECASE),
    re.compile(r"concurrency\s+error", re.IGNORECASE),
    re.compile(r"data\s+integrity", re.IGNORECASE),
]

# Status codes that represent benign, handled client errors.
_BENIGN_STATUS_CODES: frozenset[int] = frozenset({400, 401, 403, 404, 422})


class InvariantFilter:
    """Stateless filter that classifies HTTP responses as actionable or benign.

    This is the first checkpoint after every request the swarm fires.
    Only responses that pass this filter proceed to the Observer for
    telemetry compression and onward to the Patcher.
    """

    @staticmethod
    def is_actionable_failure(status_code: int, response_body: str) -> bool:
        """Determine whether a response indicates a real, exploitable bug.

        Args:
            status_code: HTTP status code from the target response.
            response_body: Raw response body text.

        Returns:
            True if the response indicates a server error or invariant
            violation that the swarm should act on.  False for benign
            client-side validation errors.
        """
        # --- Rule 1: Benign client errors are always discarded ---
        if status_code in _BENIGN_STATUS_CODES:
            return False

        # --- Rule 2: Any 5xx is automatically actionable ---
        if status_code >= 500:
            return True

        # --- Rule 3: Body-based invariant breach detection ---
        # Even if the status code is 2xx, a body mentioning invariant
        # corruption is a sign of a deeper issue (e.g. silent failures).
        for pattern in _INVARIANT_PATTERNS:
            if pattern.search(response_body):
                return True

        return False

    @staticmethod
    def classify(status_code: int, response_body: str) -> dict[str, bool | str]:
        """Classify a response with detailed reasoning.

        Returns a dictionary with the classification result and the
        reason for the decision — useful for dashboard telemetry.
        """
        if status_code in _BENIGN_STATUS_CODES:
            return {
                "actionable": False,
                "reason": f"Benign client error (HTTP {status_code})",
                "category": "client_error",
            }

        if status_code >= 500:
            return {
                "actionable": True,
                "reason": f"Server error (HTTP {status_code})",
                "category": "server_error",
            }

        for pattern in _INVARIANT_PATTERNS:
            match = pattern.search(response_body)
            if match:
                return {
                    "actionable": True,
                    "reason": f"Invariant breach detected: '{match.group()}'",
                    "category": "invariant_violation",
                }

        return {
            "actionable": False,
            "reason": f"No actionable signal (HTTP {status_code})",
            "category": "normal",
        }
