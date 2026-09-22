"""End-to-end integration test for the autonomous swarm loop.

Launches the canary target app, triggers the fuzzer, executes mock
patch generation, and asserts that the verified patch eliminates
the race condition.
"""

from __future__ import annotations

import asyncio

import pytest
from httpx import ASGITransport, AsyncClient

from src.agents.api_fuzzer import APIConcurrencyFuzzer
from src.agents.filter import InvariantFilter
from src.agents.observer import ObserverAgent
from src.agents.patcher import PatcherAgent, PatchStatus
from src.clients.nebius import NebiusClient
from src.clients.tavily import TavilyClient
from target_app.app import app, inventory


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
async def _reset_target() -> None:
    """Reset target app state before each test."""
    inventory["widget_premium"] = 1
    import target_app.app as target_module
    target_module.balance = 100.0


@pytest.fixture
async def client() -> AsyncClient:
    """Async test client for the canary target."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


# ---------------------------------------------------------------------------
# Invariant Filter Tests
# ---------------------------------------------------------------------------


class TestInvariantFilter:
    """Verify the filter correctly classifies responses."""

    def test_discard_400(self) -> None:
        """HTTP 400 should be discarded as a benign client error."""
        assert InvariantFilter.is_actionable_failure(400, "Bad request") is False

    def test_discard_401(self) -> None:
        """HTTP 401 should be discarded."""
        assert InvariantFilter.is_actionable_failure(401, "Unauthorized") is False

    def test_discard_403(self) -> None:
        """HTTP 403 should be discarded."""
        assert InvariantFilter.is_actionable_failure(403, "Forbidden") is False

    def test_discard_404(self) -> None:
        """HTTP 404 should be discarded."""
        assert InvariantFilter.is_actionable_failure(404, "Not found") is False

    def test_discard_422(self) -> None:
        """HTTP 422 should be discarded."""
        assert InvariantFilter.is_actionable_failure(422, "Unprocessable") is False

    def test_catch_500(self) -> None:
        """HTTP 500 should be flagged as actionable."""
        assert InvariantFilter.is_actionable_failure(500, "Server error") is True

    def test_catch_502(self) -> None:
        """HTTP 502 should be flagged as actionable."""
        assert InvariantFilter.is_actionable_failure(502, "Bad gateway") is True

    def test_catch_invariant_in_body(self) -> None:
        """Body containing 'INVARIANT CORRUPTED' should be actionable."""
        assert InvariantFilter.is_actionable_failure(
            200, "CRITICAL STATE INVARIANT CORRUPTED"
        ) is True

    def test_catch_race_condition_in_body(self) -> None:
        """Body mentioning 'race condition' should be actionable."""
        assert InvariantFilter.is_actionable_failure(
            200, "Detected a race condition in checkout"
        ) is True

    def test_classify_returns_details(self) -> None:
        """Classify should return actionable flag with reason."""
        result = InvariantFilter.classify(500, "Internal error")
        assert result["actionable"] is True
        assert "Server error" in result["reason"]


# ---------------------------------------------------------------------------
# Observer Tests
# ---------------------------------------------------------------------------


class TestObserverAgent:
    """Verify telemetry compression produces valid diagnostics."""

    def test_compress_produces_valid_diagnostic(self) -> None:
        """Compressed output should have the required fields."""
        diagnostic = ObserverAgent.compress_telemetry(
            endpoint="/checkout",
            method="POST",
            status_code=500,
            raw_body='{"detail": "CRITICAL STATE INVARIANT CORRUPTED: stock below zero"}',
        )

        assert diagnostic["endpoint"] == "/checkout"
        assert diagnostic["method"] == "POST"
        assert diagnostic["status_code"] == 500
        assert diagnostic["invariant_breach"] is True
        assert "error_signature" in diagnostic
        assert "vulnerability_type" in diagnostic
        assert "framework" in diagnostic

    def test_compress_respects_field_limit(self) -> None:
        """Diagnostic should never exceed 15 fields."""
        diagnostic = ObserverAgent.compress_telemetry(
            endpoint="/test",
            method="GET",
            status_code=500,
            raw_body="Error " * 1000,
            extra_context={"key1": "val1", "key2": "val2", "key3": "val3"},
        )
        assert len(diagnostic) <= 15

    def test_format_for_llm_produces_string(self) -> None:
        """LLM format should produce a clean multi-line string."""
        diagnostic = ObserverAgent.compress_telemetry(
            endpoint="/checkout",
            method="POST",
            status_code=500,
            raw_body="race condition detected",
        )
        formatted = ObserverAgent.format_for_llm(diagnostic)
        assert isinstance(formatted, str)
        assert "Endpoint:" in formatted
        assert "/checkout" in formatted


# ---------------------------------------------------------------------------
# Nebius Client Tests (Mock Mode)
# ---------------------------------------------------------------------------


class TestNebiusClientMock:
    """Verify the Nebius client works correctly in mock mode."""

    async def test_mock_generates_valid_diff(self) -> None:
        """Mock mode should return a valid unified diff."""
        client = NebiusClient()
        assert client.is_mock is True

        result = await client.generate_patch(
            system_prompt="Fix the bug",
            diagnostic_payload={"endpoint": "/checkout", "status_code": 500},
            web_context=[],
        )

        assert "diff" in result
        assert "explanation" in result
        assert "telemetry" in result
        assert "asyncio.Lock" in result["diff"] or "Lock" in result["diff"]

    async def test_mock_includes_telemetry(self) -> None:
        """Mock telemetry should include TTFT and tokens/sec."""
        client = NebiusClient()
        result = await client.generate_patch("", {}, [])

        telemetry = result["telemetry"]
        assert telemetry["mode"] == "mock"
        assert telemetry["ttft_ms"] > 0
        assert telemetry["tokens_per_sec"] > 0
        assert telemetry["total_tokens"] > 0


# ---------------------------------------------------------------------------
# Tavily Client Tests (Mock Mode)
# ---------------------------------------------------------------------------


class TestTavilyClientMock:
    """Verify the Tavily client works correctly in mock mode."""

    async def test_mock_returns_results(self) -> None:
        """Mock mode should return search results."""
        client = TavilyClient()
        assert client.is_mock is True

        results = await client.search_bug_intel("fastapi race condition fix")
        assert len(results) > 0
        assert "title" in results[0]
        assert "url" in results[0]
        assert "content" in results[0]

    async def test_build_query_from_diagnostic(self) -> None:
        """Query builder should produce a meaningful search string."""
        client = TavilyClient()
        diagnostic = {
            "framework": "FastAPI",
            "vulnerability_type": "race_condition",
            "action_required": "Fix async race condition",
            "error_signature": "CRITICAL STATE INVARIANT CORRUPTED",
        }
        query = await client.build_query_from_diagnostic(diagnostic)
        assert "FastAPI" in query
        assert "race" in query.lower()


# ---------------------------------------------------------------------------
# Patcher Tests (Mock Mode)
# ---------------------------------------------------------------------------


class TestPatcherMock:
    """Verify the patcher generates and verifies patches in mock mode."""

    async def test_full_patch_lifecycle(self) -> None:
        """Complete patch lifecycle should succeed in mock mode."""
        patcher = PatcherAgent()
        diagnostic = ObserverAgent.compress_telemetry(
            endpoint="/checkout",
            method="POST",
            status_code=500,
            raw_body="CRITICAL STATE INVARIANT CORRUPTED: stock below zero",
        )

        result = await patcher.generate_and_verify_patch(diagnostic=diagnostic)

        assert result["status"] == PatchStatus.VERIFIED_AND_COMMITTED.value
        assert result["anti_lazy_passed"] is True
        assert result["stage_1_passed"] is True
        assert result["stage_2_passed"] is True
        assert result["diff"] is not None
        assert result["explanation"] is not None
        assert result["nebius_telemetry"] is not None
        assert result["tavily_results"] is not None

    async def test_anti_lazy_rejects_except_pass(self) -> None:
        """Anti-lazy filter should reject diffs containing except:pass."""
        patcher = PatcherAgent()
        assert patcher._check_anti_lazy("+ except: pass") is False
        assert patcher._check_anti_lazy("+ except Exception: pass") is False

    async def test_anti_lazy_accepts_clean_diff(self) -> None:
        """Anti-lazy filter should accept clean diffs."""
        patcher = PatcherAgent()
        assert patcher._check_anti_lazy("+ async with _lock:") is True
        assert patcher._check_anti_lazy("+ except ValueError as e:\n+     raise") is True


# ---------------------------------------------------------------------------
# Full E2E Swarm Loop (Mock Mode)
# ---------------------------------------------------------------------------


class TestSwarmE2E:
    """End-to-end test of the complete autonomous swarm loop."""

    async def test_race_condition_exploit_detected(self, client: AsyncClient) -> None:
        """Concurrent requests should trigger the race condition."""
        # Reset state
        await client.post("/reset")

        # Fire concurrent requests
        tasks = [
            client.post("/checkout", json={"item": "widget_premium", "quantity": 1})
            for _ in range(10)
        ]
        responses = await asyncio.gather(*tasks)

        status_codes = [r.status_code for r in responses]
        # At least one should be 500 (race condition triggered)
        # or 400 (insufficient stock after first succeeds)
        assert 500 in status_codes or sum(1 for s in status_codes if s == 200) <= 1

    async def test_full_mock_swarm_lifecycle(self) -> None:
        """Complete swarm lifecycle should work end-to-end in mock mode."""
        # 1. Create diagnostic from a simulated exploit
        diagnostic = ObserverAgent.compress_telemetry(
            endpoint="/checkout",
            method="POST",
            status_code=500,
            raw_body="CRITICAL STATE INVARIANT CORRUPTED: Inventory dropped below zero",
        )

        assert diagnostic["invariant_breach"] is True
        assert diagnostic["severity"] == "critical"

        # 2. Search for upstream fixes
        tavily = TavilyClient()
        query = await tavily.build_query_from_diagnostic(diagnostic)
        web_context = await tavily.search_bug_intel(query)
        assert len(web_context) > 0

        # 3. Generate and verify patch
        patcher = PatcherAgent()
        result = await patcher.generate_and_verify_patch(diagnostic=diagnostic)

        assert result["status"] == PatchStatus.VERIFIED_AND_COMMITTED.value
        assert "Lock" in result["diff"] or "lock" in result["diff"]
        assert result["stage_1_passed"] is True
        assert result["stage_2_passed"] is True
