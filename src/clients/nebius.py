"""Nebius Token Factory Client — NVIDIA Nemotron inference wrapper.

Dual-mode client:
  - **Live mode**: Calls Nebius Token Factory API with model
    `nvidia/nemotron-3-super-120b-a12b` via the OpenAI SDK.  Measures
    Time-to-First-Token (TTFT) and tokens/sec throughput.
  - **Mock mode**: Returns a pre-computed valid unified diff that fixes
    the canary app's race condition using `asyncio.Lock()`.  Activates
    when `MOCK_MODE=true` or `NEBIUS_API_KEY` is missing/placeholder.
"""

from __future__ import annotations

import asyncio
import json
import time
from typing import Any

from src.config import get_settings

# ---------------------------------------------------------------------------
# Mock Responses
# ---------------------------------------------------------------------------

_MOCK_DIFF = '''\
--- a/target_app/app.py
+++ b/target_app/app.py
@@ -1,6 +1,7 @@
 from __future__ import annotations
 
 import asyncio
+from asyncio import Lock
 from typing import Any
 
 from fastapi import FastAPI, HTTPException
@@ -18,6 +19,9 @@
 inventory: dict[str, int] = {"widget_premium": 1}
 balance: float = 100.0
 
+# Mutex lock to prevent concurrent checkout race conditions.
+_checkout_lock = Lock()
+
 ITEM_PRICES: dict[str, float] = {"widget_premium": 29.99}
 
 
@@ -70,30 +74,31 @@
     global balance
 
-    # --- Input validation (returns 400, NOT a real bug) ---
-    if request.item not in inventory:
-        raise HTTPException(
-            status_code=400,
-            detail=f"Unknown item: '{request.item}'. Available: {list(inventory.keys())}",
-        )
-
-    if request.quantity <= 0:
-        raise HTTPException(
-            status_code=400,
-            detail=f"Quantity must be positive, got {request.quantity}.",
-        )
-
-    price = ITEM_PRICES.get(request.item, 0.0)
-    total_cost = price * request.quantity
-
-    # --- STEP 1: Check stock (TOCTOU — Time-of-Check) ---
-    current_stock = inventory[request.item]
-
-    if current_stock < request.quantity:
-        raise HTTPException(
-            status_code=400,
-            detail=f"Insufficient stock for '{request.item}': "
-            f"requested {request.quantity}, available {current_stock}.",
-        )
-
-    # --- STEP 2: Simulate I/O delay (the race window) ---
-    await asyncio.sleep(0.05)
-
-    # --- STEP 3: Deduct stock (TOCTOU — Time-of-Use) ---
-    inventory[request.item] -= request.quantity
-    balance -= total_cost
+    # --- Input validation (outside lock — no shared state access) ---
+    if request.item not in inventory:
+        raise HTTPException(
+            status_code=400,
+            detail=f"Unknown item: '{request.item}'. Available: {list(inventory.keys())}",
+        )
+
+    if request.quantity <= 0:
+        raise HTTPException(
+            status_code=400,
+            detail=f"Quantity must be positive, got {request.quantity}.",
+        )
+
+    price = ITEM_PRICES.get(request.item, 0.0)
+    total_cost = price * request.quantity
+
+    # --- Atomic checkout under lock — eliminates the race condition ---
+    async with _checkout_lock:
+        current_stock = inventory[request.item]
+
+        if current_stock < request.quantity:
+            raise HTTPException(
+                status_code=400,
+                detail=f"Insufficient stock for '{request.item}': "
+                f"requested {request.quantity}, available {current_stock}.",
+            )
+
+        await asyncio.sleep(0.05)
+
+        inventory[request.item] -= request.quantity
+        balance -= total_cost
'''

_MOCK_EXPLANATION = (
    "The race condition occurs because the checkout endpoint reads inventory, "
    "sleeps (simulating I/O), then decrements — without any synchronization. "
    "Concurrent requests all read inventory=1, pass the check, then all "
    "decrement, driving stock negative. The fix wraps the critical section "
    "(check + sleep + deduct) inside an asyncio.Lock(), ensuring only one "
    "checkout executes at a time. Validation stays outside the lock since "
    "it doesn't access shared state."
)


class NebiusClient:
    """Client for the Nebius Token Factory inference API.

    Automatically falls back to deterministic mock mode when API keys
    are missing or `MOCK_MODE=true`.
    """

    def __init__(self) -> None:
        self._settings = get_settings()
        self._is_mock = self._settings.is_mock_mode
        self._client: Any | None = None

        if not self._is_mock:
            from openai import AsyncOpenAI

            self._client = AsyncOpenAI(
                api_key=self._settings.nebius_api_key,
                base_url=self._settings.nebius_base_url,
            )

    @property
    def is_mock(self) -> bool:
        """Whether the client is running in mock mode."""
        return self._is_mock

    @property
    def model_name(self) -> str:
        """The model identifier being used."""
        return self._settings.nebius_model

    async def generate_patch(
        self,
        system_prompt: str,
        diagnostic_payload: dict[str, Any],
        web_context: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Generate a unified diff patch for the detected vulnerability.

        Args:
            system_prompt: Instructions for the LLM on how to generate the patch.
            diagnostic_payload: Compressed diagnostic from the ObserverAgent.
            web_context: Search results from TavilyClient for additional context.

        Returns:
            Dictionary with keys: 'diff', 'explanation', 'telemetry'.
        """
        if self._is_mock:
            return await self._mock_generate()

        return await self._live_generate(system_prompt, diagnostic_payload, web_context)

    async def _mock_generate(self) -> dict[str, Any]:
        """Return a pre-computed valid diff with simulated latency metrics."""
        # Simulate realistic inference latency
        await asyncio.sleep(0.3)

        return {
            "diff": _MOCK_DIFF,
            "explanation": _MOCK_EXPLANATION,
            "telemetry": {
                "mode": "mock",
                "model": self._settings.nebius_model,
                "ttft_ms": 142.0,
                "tokens_per_sec": 87.3,
                "total_tokens": 234,
                "prompt_tokens": 180,
                "completion_tokens": 54,
                "total_time_ms": 2681.0,
            },
        }

    async def _live_generate(
        self,
        system_prompt: str,
        diagnostic_payload: dict[str, Any],
        web_context: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Call the live Nebius Token Factory API and measure performance."""
        assert self._client is not None, "OpenAI client not initialized"

        # Build the user message with diagnostic + web context
        user_message = self._build_user_message(diagnostic_payload, web_context)

        # --- Measure inference performance ---
        start_time = time.perf_counter()
        first_token_time: float | None = None
        collected_content = ""
        total_completion_tokens = 0

        try:
            stream = await self._client.chat.completions.create(
                model=self._settings.nebius_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=2048,
                stream=True,
            )

            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    if first_token_time is None:
                        first_token_time = time.perf_counter()

                    content = chunk.choices[0].delta.content
                    collected_content += content
                    total_completion_tokens += 1  # Approximate

        except Exception as exc:
            raise RuntimeError(f"Nebius API call failed: {exc}") from exc

        end_time = time.perf_counter()

        # --- Calculate metrics ---
        total_time_ms = (end_time - start_time) * 1000
        ttft_ms = (
            (first_token_time - start_time) * 1000 if first_token_time else total_time_ms
        )
        generation_time = end_time - (first_token_time or start_time)
        tokens_per_sec = (
            total_completion_tokens / generation_time if generation_time > 0 else 0
        )

        # --- Parse the JSON response ---
        try:
            parsed = json.loads(collected_content)
            diff = parsed.get("diff", "")
            explanation = parsed.get("explanation", "No explanation provided.")
        except json.JSONDecodeError:
            # If not valid JSON, treat entire content as the diff
            diff = collected_content
            explanation = "Response was not valid JSON — raw content used as diff."

        return {
            "diff": diff,
            "explanation": explanation,
            "telemetry": {
                "mode": "live",
                "model": self._settings.nebius_model,
                "ttft_ms": round(ttft_ms, 1),
                "tokens_per_sec": round(tokens_per_sec, 1),
                "total_tokens": total_completion_tokens,
                "prompt_tokens": 0,  # Not available from streaming
                "completion_tokens": total_completion_tokens,
                "total_time_ms": round(total_time_ms, 1),
            },
        }

    @staticmethod
    def _build_user_message(
        diagnostic: dict[str, Any],
        web_context: list[dict[str, Any]],
    ) -> str:
        """Build the user message combining diagnostic and web context."""
        parts = [
            "## Incident Diagnostic\n",
            json.dumps(diagnostic, indent=2),
            "\n\n## Web Intelligence (upstream fixes)\n",
        ]

        if web_context:
            for i, result in enumerate(web_context[:5], 1):
                parts.append(
                    f"{i}. [{result.get('title', 'N/A')}]({result.get('url', '')})\n"
                    f"   {result.get('content', 'No snippet available.')[:200]}\n"
                )
        else:
            parts.append("No web context available.\n")

        parts.append(
            "\n## Task\n"
            "Generate an atomic unified diff (patch -p1 compatible) that fixes "
            "the vulnerability described above. Return JSON with keys: "
            "'diff' (the unified diff string) and 'explanation' (brief rationale)."
        )

        return "".join(parts)

    @staticmethod
    def get_system_prompt() -> str:
        """Return the standard system prompt for patch generation."""
        return (
            "You are an expert Python security engineer. Your task is to generate "
            "a minimal, correct unified diff that fixes the identified vulnerability. "
            "\n\n"
            "RULES:\n"
            "1. Output a valid unified diff (patch -p1 compatible) with proper --- and +++ headers.\n"
            "2. The fix must be atomic — change only what's needed, preserve all other behavior.\n"
            "3. NEVER use `try: ... except: pass` or `except Exception: pass` — these suppress bugs.\n"
            "4. Maintain all existing type annotations and docstrings.\n"
            "5. Return JSON with exactly two keys: 'diff' and 'explanation'.\n"
        )
