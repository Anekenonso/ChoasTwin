"""ChaosTwin Canary Target Application.

A FastAPI service with a **deliberate async race condition** in the checkout
endpoint. This serves as the honeypot target for the adversarial swarm to
discover, exploit, and ultimately patch.

Bugs present (by design):
  - Shared mutable global state (`inventory`, `balance`) with no locking.
  - An `asyncio.sleep(0.05)` window between checking and decrementing
    inventory, creating a classic TOCTOU (Time-of-Check-Time-of-Use) race.
  - When concurrent requests slip through the window, inventory drops
    below zero, triggering an HTTP 500 invariant violation.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Application & Global State
# ---------------------------------------------------------------------------

app = FastAPI(
    title="ChaosTwin Canary Target",
    description="Vulnerable FastAPI service with an intentional async race condition.",
    version="1.0.0",
)

# Shared mutable global state — deliberately unsafe (no lock).
inventory: dict[str, int] = {"widget_premium": 1}
balance: float = 100.0

ITEM_PRICES: dict[str, float] = {"widget_premium": 29.99}


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------


class CheckoutRequest(BaseModel):
    """Payload for the checkout endpoint."""

    item: str = Field(..., min_length=1, description="Item identifier to purchase.")
    quantity: int = Field(..., gt=0, description="Number of units (must be > 0).")


class CheckoutResponse(BaseModel):
    """Successful checkout response."""

    status: str
    item: str
    quantity: int
    remaining_stock: int
    total_charged: float
    balance_after: float


class HealthResponse(BaseModel):
    """Health-check response exposing current state."""

    status: str
    inventory: dict[str, int]
    balance: float


class ResetResponse(BaseModel):
    """Response after resetting application state."""

    status: str
    inventory: dict[str, int]
    balance: float


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/health", response_model=HealthResponse)
async def health_check() -> dict[str, Any]:
    """Return current application state for monitoring."""
    return {
        "status": "healthy",
        "inventory": inventory,
        "balance": balance,
    }


@app.post("/reset", response_model=ResetResponse)
async def reset_state() -> dict[str, Any]:
    """Reset global state to initial values (for testing)."""
    global balance
    inventory["widget_premium"] = 1
    balance = 100.0
    return {
        "status": "reset_complete",
        "inventory": inventory,
        "balance": balance,
    }


@app.post("/checkout", response_model=CheckoutResponse)
async def checkout(request: CheckoutRequest) -> dict[str, Any]:
    """Process a checkout — contains an intentional race condition.

    The vulnerability:
      1. We read the current stock level.
      2. We sleep for 50ms (simulating I/O or payment processing).
      3. We decrement stock.

    If multiple requests arrive concurrently, they all read stock=1 in step 1,
    pass the check, and all decrement in step 3 — driving stock negative.
    When stock < 0 the invariant assertion fires an HTTP 500.
    """
    global balance

    # --- Input validation (returns 400, NOT a real bug) ---
    if request.item not in inventory:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown item: '{request.item}'. Available: {list(inventory.keys())}",
        )

    if request.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail=f"Quantity must be positive, got {request.quantity}.",
        )

    price = ITEM_PRICES.get(request.item, 0.0)
    total_cost = price * request.quantity

    # --- STEP 1: Check stock (TOCTOU — Time-of-Check) ---
    current_stock = inventory[request.item]

    if current_stock < request.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock for '{request.item}': "
            f"requested {request.quantity}, available {current_stock}.",
        )

    # --- STEP 2: Simulate I/O delay (the race window) ---
    await asyncio.sleep(0.05)

    # --- STEP 3: Deduct stock (TOCTOU — Time-of-Use) ---
    inventory[request.item] -= request.quantity
    balance -= total_cost

    # --- INVARIANT CHECK: stock must never be negative ---
    if inventory[request.item] < 0:
        raise HTTPException(
            status_code=500,
            detail=(
                "CRITICAL STATE INVARIANT CORRUPTED: "
                f"Inventory for '{request.item}' dropped below zero "
                f"(current={inventory[request.item]}). "
                "Race condition exploit detected."
            ),
        )

    return {
        "status": "success",
        "item": request.item,
        "quantity": request.quantity,
        "remaining_stock": inventory[request.item],
        "total_charged": total_cost,
        "balance_after": balance,
    }


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
