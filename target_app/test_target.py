"""Baseline regression tests for the canary target application.

These tests verify the *intended* behaviour of the target app — successful
checkout for valid requests, proper 400 rejection for invalid input, and
correct health/reset endpoints.  They intentionally do NOT test the race
condition (that's the swarm's job).
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from target_app.app import app, balance, inventory


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
async def _reset_state() -> None:
    """Reset global state before every test to ensure isolation."""
    inventory["widget_premium"] = 1
    # We need to modify the module-level balance variable
    import target_app.app as target_module

    target_module.balance = 100.0


@pytest.fixture
async def client() -> AsyncClient:
    """Create an async test client bound to the FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


# ---------------------------------------------------------------------------
# Health & Reset
# ---------------------------------------------------------------------------


class TestHealthEndpoint:
    """Tests for GET /health."""

    async def test_health_returns_current_state(self, client: AsyncClient) -> None:
        """Health check should return inventory and balance."""
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert "inventory" in data
        assert "balance" in data

    async def test_health_shows_correct_inventory(self, client: AsyncClient) -> None:
        """Inventory should reflect the widget_premium stock."""
        resp = await client.get("/health")
        data = resp.json()
        assert data["inventory"]["widget_premium"] == 1


class TestResetEndpoint:
    """Tests for POST /reset."""

    async def test_reset_restores_initial_state(self, client: AsyncClient) -> None:
        """Reset should restore inventory to 1 and balance to 100."""
        # Deplete stock first
        await client.post("/checkout", json={"item": "widget_premium", "quantity": 1})

        resp = await client.post("/reset")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "reset_complete"
        assert data["inventory"]["widget_premium"] == 1
        assert data["balance"] == 100.0


# ---------------------------------------------------------------------------
# Checkout — Valid Requests
# ---------------------------------------------------------------------------


class TestValidCheckout:
    """Tests for POST /checkout with valid input."""

    async def test_successful_single_checkout(self, client: AsyncClient) -> None:
        """A single valid checkout should succeed and deduct stock."""
        resp = await client.post(
            "/checkout",
            json={"item": "widget_premium", "quantity": 1},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["item"] == "widget_premium"
        assert data["quantity"] == 1
        assert data["remaining_stock"] == 0
        assert data["total_charged"] == 29.99

    async def test_checkout_deducts_balance(self, client: AsyncClient) -> None:
        """Balance should decrease by the item price after checkout."""
        resp = await client.post(
            "/checkout",
            json={"item": "widget_premium", "quantity": 1},
        )
        data = resp.json()
        assert data["balance_after"] == pytest.approx(100.0 - 29.99)


# ---------------------------------------------------------------------------
# Checkout — Invalid Requests (should return 400, NOT trigger bugs)
# ---------------------------------------------------------------------------


class TestInvalidCheckout:
    """Tests for POST /checkout with invalid input — must return 400."""

    async def test_unknown_item_returns_400(self, client: AsyncClient) -> None:
        """Requesting a non-existent item should return 400."""
        resp = await client.post(
            "/checkout",
            json={"item": "nonexistent_widget", "quantity": 1},
        )
        assert resp.status_code == 400
        assert "Unknown item" in resp.json()["detail"]

    async def test_zero_quantity_returns_422(self, client: AsyncClient) -> None:
        """Quantity of zero should be rejected by Pydantic validation (422)."""
        resp = await client.post(
            "/checkout",
            json={"item": "widget_premium", "quantity": 0},
        )
        assert resp.status_code == 422

    async def test_negative_quantity_returns_422(self, client: AsyncClient) -> None:
        """Negative quantity should be rejected by Pydantic validation (422)."""
        resp = await client.post(
            "/checkout",
            json={"item": "widget_premium", "quantity": -5},
        )
        assert resp.status_code == 422

    async def test_insufficient_stock_returns_400(self, client: AsyncClient) -> None:
        """Requesting more than available stock should return 400."""
        resp = await client.post(
            "/checkout",
            json={"item": "widget_premium", "quantity": 999},
        )
        assert resp.status_code == 400
        assert "Insufficient stock" in resp.json()["detail"]

    async def test_missing_item_field_returns_422(self, client: AsyncClient) -> None:
        """Missing required 'item' field should return 422."""
        resp = await client.post("/checkout", json={"quantity": 1})
        assert resp.status_code == 422

    async def test_missing_quantity_field_returns_422(self, client: AsyncClient) -> None:
        """Missing required 'quantity' field should return 422."""
        resp = await client.post("/checkout", json={"item": "widget_premium"})
        assert resp.status_code == 422
