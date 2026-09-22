"""API Concurrency Fuzzer — exploits race conditions via burst HTTP requests.

Fires N concurrent HTTP requests using `asyncio.gather` to exploit
TOCTOU (Time-of-Check-Time-of-Use) vulnerabilities in the target.
Each response is piped through the InvariantFilter and ObserverAgent.

Design:
  - Default burst size: 25 concurrent requests.
  - Target endpoint: POST /checkout with quantity=1.
  - Success criteria: At least one HTTP 500 invariant violation.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any

import httpx

from src.agents.base import BaseAgent
from src.agents.filter import InvariantFilter
from src.agents.observer import ObserverAgent
from src.config import get_settings


class APIConcurrencyFuzzer(BaseAgent):
    """Asynchronous burst-load fuzzer targeting API race conditions.

    Fires a configurable number of concurrent requests against a target
    endpoint, captures responses, filters through InvariantFilter, and
    compresses actionable failures via ObserverAgent.
    """

    def __init__(self) -> None:
        super().__init__(name="APIConcurrencyFuzzer")
        self._settings = get_settings()

    async def execute(self, **kwargs: Any) -> dict[str, Any] | None:
        """Run the burst attack and return results.

        Keyword Args:
            endpoint: Target endpoint path (default: "/checkout").
            burst_size: Number of concurrent requests (default from config).
            payload: Request body (default: checkout widget_premium x1).

        Returns:
            Attack results with per-request details and exploit detection flag.
        """
        endpoint = kwargs.get("endpoint", "/checkout")
        burst_size = kwargs.get("burst_size", self._settings.burst_size)
        payload = kwargs.get("payload", {"item": "widget_premium", "quantity": 1})
        target_url = kwargs.get("target_url", self._settings.target_url)

        return await self.execute_burst_attack(
            target_url=target_url,
            endpoint=endpoint,
            burst_size=burst_size,
            payload=payload,
        )

    async def execute_burst_attack(
        self,
        target_url: str | None = None,
        endpoint: str = "/checkout",
        burst_size: int = 25,
        payload: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Fire a burst of concurrent requests and analyse responses.

        Args:
            target_url: Base URL of the target (e.g. "http://localhost:8000").
            endpoint: API endpoint path to attack.
            burst_size: Number of simultaneous requests to fire.
            payload: JSON body for each request.

        Returns:
            Dictionary containing:
              - requests: list of per-request results
              - summary: aggregate statistics
              - exploit_detected: whether an actionable failure was found
              - diagnostic: compressed ObserverAgent output (if exploit found)
        """
        if target_url is None:
            target_url = self._settings.target_url
        if payload is None:
            payload = {"item": "widget_premium", "quantity": 1}

        full_url = f"{target_url.rstrip('/')}{endpoint}"

        # Reset the target state before attacking
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(f"{target_url.rstrip('/')}/reset")
        except httpx.HTTPError:
            pass  # Target may not have /reset — continue anyway

        # --- Fire concurrent requests ---
        start_time = time.perf_counter()

        async with httpx.AsyncClient(timeout=30.0) as client:
            tasks = [
                self._fire_single_request(client, full_url, payload, request_id=i)
                for i in range(1, burst_size + 1)
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        total_time_ms = (time.perf_counter() - start_time) * 1000

        # --- Process results ---
        request_results: list[dict[str, Any]] = []
        success_count = 0
        failure_count = 0
        actionable_failures: list[dict[str, Any]] = []

        for result in results:
            if isinstance(result, Exception):
                request_results.append({
                    "request_id": 0,
                    "status_code": 0,
                    "error": str(result),
                    "actionable": False,
                    "response_time_ms": 0,
                })
                failure_count += 1
                continue

            request_results.append(result)

            if result.get("status_code", 0) >= 500:
                failure_count += 1
            else:
                success_count += 1

            if result.get("actionable"):
                actionable_failures.append(result)

        # --- Build diagnostic from first actionable failure ---
        diagnostic = None
        if actionable_failures:
            first_failure = actionable_failures[0]
            diagnostic = ObserverAgent.compress_telemetry(
                endpoint=endpoint,
                method="POST",
                status_code=first_failure.get("status_code", 500),
                raw_body=first_failure.get("response_body", ""),
                extra_context={
                    "burst_size": burst_size,
                    "concurrent_failures": len(actionable_failures),
                },
            )

        return {
            "requests": request_results,
            "summary": {
                "burst_size": burst_size,
                "total_requests": len(request_results),
                "success_count": success_count,
                "failure_count": failure_count,
                "actionable_count": len(actionable_failures),
                "total_time_ms": round(total_time_ms, 2),
                "avg_response_time_ms": round(
                    sum(r.get("response_time_ms", 0) for r in request_results)
                    / max(len(request_results), 1),
                    2,
                ),
            },
            "exploit_detected": len(actionable_failures) > 0,
            "diagnostic": diagnostic,
        }

    async def _fire_single_request(
        self,
        client: httpx.AsyncClient,
        url: str,
        payload: dict[str, Any],
        request_id: int,
    ) -> dict[str, Any]:
        """Send a single HTTP request and classify the response.

        Returns a per-request result dictionary.
        """
        start = time.perf_counter()

        try:
            response = await client.post(url, json=payload)
            elapsed_ms = (time.perf_counter() - start) * 1000
            body = response.text

            actionable = InvariantFilter.is_actionable_failure(response.status_code, body)
            classification = InvariantFilter.classify(response.status_code, body)

            return {
                "request_id": request_id,
                "status_code": response.status_code,
                "response_body": body[:500],  # Truncate for safety
                "response_time_ms": round(elapsed_ms, 2),
                "actionable": actionable,
                "classification": classification,
            }

        except Exception as exc:
            elapsed_ms = (time.perf_counter() - start) * 1000
            return {
                "request_id": request_id,
                "status_code": 0,
                "error": f"{type(exc).__name__}: {exc}",
                "response_time_ms": round(elapsed_ms, 2),
                "actionable": False,
                "classification": {"actionable": False, "reason": "Connection error"},
            }
