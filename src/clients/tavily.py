"""Tavily Search API Client — Web Intelligence for bug reconnaissance.

Searches GitHub discussions, StackOverflow threads, and technical blogs
for upstream fixes and known solutions related to detected vulnerabilities.

Dual-mode:
  - **Live mode**: Calls `https://api.tavily.com/search` via httpx.
  - **Mock mode**: Returns canned search results for FastAPI race conditions.
"""

from __future__ import annotations

import asyncio
from typing import Any

import httpx

from src.config import get_settings

# ---------------------------------------------------------------------------
# Mock Responses
# ---------------------------------------------------------------------------

_MOCK_SEARCH_RESULTS: list[dict[str, Any]] = [
    {
        "title": "Handling Race Conditions in FastAPI with asyncio.Lock",
        "url": "https://github.com/tiangolo/fastapi/discussions/9847",
        "content": (
            "When using shared mutable state in FastAPI endpoints, you must protect "
            "critical sections with asyncio.Lock() to prevent TOCTOU race conditions. "
            "The lock ensures only one coroutine can modify the state at a time, "
            "preventing inventory corruption under concurrent load."
        ),
        "source": "GitHub",
        "relevance_score": 0.95,
    },
    {
        "title": "Python asyncio: Preventing concurrent access to shared resources",
        "url": "https://stackoverflow.com/questions/67891234/asyncio-lock-shared-state",
        "content": (
            "Use asyncio.Lock() as an async context manager around code that reads "
            "and writes shared state. This is the async equivalent of threading.Lock(). "
            "Example: async with lock: data = read(); await process(); write(data)"
        ),
        "source": "StackOverflow",
        "relevance_score": 0.88,
    },
    {
        "title": "FastAPI Concurrency: Best Practices for Stateful Endpoints",
        "url": "https://fastapi.tiangolo.com/async/#concurrency-and-shared-state",
        "content": (
            "FastAPI uses async def endpoints that run concurrently. If your endpoint "
            "accesses global state (dictionaries, counters), concurrent requests can "
            "interleave reads and writes. Solutions: use asyncio.Lock for in-memory "
            "state, or use a database with proper transaction isolation."
        ),
        "source": "FastAPI Docs",
        "relevance_score": 0.82,
    },
]


class TavilyClient:
    """Client for the Tavily Search API — provides web intelligence for bug fixes.

    Searches for upstream solutions, GitHub discussions, and StackOverflow
    answers related to the detected vulnerability type.
    """

    TAVILY_API_URL = "https://api.tavily.com/search"

    def __init__(self) -> None:
        self._settings = get_settings()
        self._is_mock = not self._settings.tavily_available

    @property
    def is_mock(self) -> bool:
        """Whether the client is running in mock mode."""
        return self._is_mock

    async def search_bug_intel(
        self,
        query: str,
        *,
        max_results: int = 5,
    ) -> list[dict[str, Any]]:
        """Search for web intelligence related to a vulnerability.

        Args:
            query: Search query describing the bug/vulnerability.
            max_results: Maximum number of results to return.

        Returns:
            List of search result dictionaries with title, url, content, source.
        """
        if self._is_mock:
            return await self._mock_search(query)

        return await self._live_search(query, max_results=max_results)

    async def build_query_from_diagnostic(self, diagnostic: dict[str, Any]) -> str:
        """Build an optimised search query from a compressed diagnostic.

        Args:
            diagnostic: Compressed diagnostic from ObserverAgent.

        Returns:
            A targeted search query string.
        """
        parts: list[str] = []

        framework = diagnostic.get("framework", "")
        if framework and framework != "unknown":
            parts.append(framework)

        vuln_type = diagnostic.get("vulnerability_type", "")
        if vuln_type and vuln_type != "unknown":
            parts.append(vuln_type.replace("_", " "))

        action = diagnostic.get("action_required", "")
        if action:
            # Extract key terms from the suggested action
            parts.append(action.split("—")[0].strip() if "—" in action else action[:60])

        error_sig = diagnostic.get("error_signature", "")
        if error_sig:
            # Take the first meaningful portion
            parts.append(error_sig[:80])

        if not parts:
            parts.append("Python web application bug fix")

        return " ".join(parts) + " fix solution"

    async def _mock_search(self, query: str) -> list[dict[str, Any]]:
        """Return canned search results with simulated latency."""
        await asyncio.sleep(0.2)

        results = []
        for result in _MOCK_SEARCH_RESULTS:
            results.append({
                **result,
                "query": query,
            })

        return results

    async def _live_search(
        self,
        query: str,
        *,
        max_results: int = 5,
    ) -> list[dict[str, Any]]:
        """Execute a live search against the Tavily API."""
        payload = {
            "api_key": self._settings.tavily_api_key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": False,
            "include_raw_content": False,
            "max_results": max_results,
            "include_domains": [
                "github.com",
                "stackoverflow.com",
                "docs.python.org",
                "fastapi.tiangolo.com",
            ],
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.TAVILY_API_URL, json=payload)
                response.raise_for_status()
                data = response.json()

            raw_results = data.get("results", [])
            return [
                {
                    "title": r.get("title", "Untitled"),
                    "url": r.get("url", ""),
                    "content": r.get("content", "")[:500],
                    "source": self._extract_source(r.get("url", "")),
                    "relevance_score": r.get("score", 0.0),
                    "query": query,
                }
                for r in raw_results[:max_results]
            ]

        except httpx.HTTPStatusError as exc:
            return [{
                "title": "Tavily API Error",
                "url": "",
                "content": f"Search failed: HTTP {exc.response.status_code}",
                "source": "error",
                "relevance_score": 0.0,
                "query": query,
            }]
        except Exception as exc:
            return [{
                "title": "Tavily Connection Error",
                "url": "",
                "content": f"Search failed: {exc}",
                "source": "error",
                "relevance_score": 0.0,
                "query": query,
            }]

    @staticmethod
    def _extract_source(url: str) -> str:
        """Extract a human-readable source name from a URL."""
        if "github.com" in url:
            return "GitHub"
        if "stackoverflow.com" in url:
            return "StackOverflow"
        if "docs.python.org" in url:
            return "Python Docs"
        if "fastapi.tiangolo.com" in url:
            return "FastAPI Docs"
        return "Web"
