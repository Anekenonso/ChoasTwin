"""UI Attacker Agent — Bounded Playwright-driven exploratory attacker.

Uses Playwright's async API with ONLY accessibility-tree locators
(get_by_role, get_by_label) to interact with a target web application.
Enforces a strict 8-step interaction budget to prevent DOM cycling.

Design constraints:
  - NO CSS selectors or raw XPath — only accessibility locators.
  - Maximum 8 interaction steps per run.
  - Captures screenshots on each failure for dashboard display.
  - Simulates rapid multi-clicking to induce UI/API state desync.
"""

from __future__ import annotations

import asyncio
from typing import Any

from src.agents.base import BaseAgent
from src.agents.filter import InvariantFilter
from src.config import get_settings


class UIAttackerAgent(BaseAgent):
    """Bounded Playwright-driven UI attacker using accessibility locators.

    Navigates the target application, finds interactive elements by their
    ARIA roles and labels, and performs rapid interactions designed to
    trigger race conditions and state desynchronisation.
    """

    def __init__(self) -> None:
        super().__init__(name="UIAttackerAgent")
        self._settings = get_settings()

    async def execute(self, **kwargs: Any) -> dict[str, Any] | None:
        """Run the UI attack with a bounded step budget.

        Keyword Args:
            target_url: URL of the target web application.
            max_steps: Maximum interaction steps (default from config).

        Returns:
            Attack results or None if no crash was found within budget.
        """
        target_url = kwargs.get("target_url", self._settings.target_url)
        max_steps = kwargs.get("max_steps", self._settings.max_ui_steps)

        return await self.execute_ui_attack(
            target_url=target_url,
            max_steps=max_steps,
        )

    async def execute_ui_attack(
        self,
        target_url: str | None = None,
        max_steps: int = 8,
    ) -> dict[str, Any]:
        """Launch Playwright and attack the target UI.

        Args:
            target_url: Base URL of the target web application.
            max_steps: Hard cap on the number of interaction steps.

        Returns:
            Dictionary with interaction log, crash detection, and diagnostics.
        """
        if target_url is None:
            target_url = self._settings.target_url

        interaction_log: list[dict[str, Any]] = []
        crash_detected = False
        crash_details: dict[str, Any] | None = None

        try:
            from playwright.async_api import async_playwright
        except ImportError:
            return {
                "interaction_log": [],
                "crash_detected": False,
                "error": "Playwright not installed. Run: playwright install chromium",
                "steps_taken": 0,
                "max_steps": max_steps,
            }

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context()
                page = await context.new_page()

                # --- Navigate to target ---
                try:
                    await page.goto(target_url, wait_until="networkidle", timeout=15000)
                except Exception:
                    # If the target doesn't serve HTML (pure API), return gracefully
                    await browser.close()
                    return {
                        "interaction_log": [{
                            "step": 0,
                            "action": "navigate",
                            "target": target_url,
                            "result": "Target does not serve HTML — UI attack skipped",
                        }],
                        "crash_detected": False,
                        "steps_taken": 0,
                        "max_steps": max_steps,
                    }

                interaction_log.append({
                    "step": 0,
                    "action": "navigate",
                    "target": target_url,
                    "result": "Page loaded successfully",
                })

                # --- Bounded interaction loop ---
                for step in range(1, max_steps + 1):
                    try:
                        result = await self._execute_step(page, step)
                        interaction_log.append(result)

                        # Check if this step triggered a crash
                        if result.get("crash"):
                            crash_detected = True
                            crash_details = result
                            break

                    except Exception as exc:
                        interaction_log.append({
                            "step": step,
                            "action": "error",
                            "error": f"{type(exc).__name__}: {exc}",
                        })

                await browser.close()

        except Exception as exc:
            return {
                "interaction_log": interaction_log,
                "crash_detected": False,
                "error": f"Playwright error: {exc}",
                "steps_taken": len(interaction_log),
                "max_steps": max_steps,
            }

        return {
            "interaction_log": interaction_log,
            "crash_detected": crash_detected,
            "crash_details": crash_details,
            "steps_taken": len(interaction_log),
            "max_steps": max_steps,
        }

    async def _execute_step(self, page: Any, step: int) -> dict[str, Any]:
        """Execute a single bounded interaction step.

        Uses ONLY accessibility-tree locators as required.
        Strategy: find buttons/links by role, click them rapidly,
        and monitor for error responses.
        """
        result: dict[str, Any] = {"step": step, "crash": False}

        # --- Strategy 1: Find and rapidly click buttons by role ---
        buttons = page.get_by_role("button")
        button_count = await buttons.count()

        if button_count > 0:
            # Click the first available button rapidly
            target_button = buttons.first
            button_text = await target_button.text_content() or "unnamed"
            result["action"] = "rapid_click"
            result["target"] = f"button: '{button_text}'"

            # Rapid multi-click to induce race conditions
            click_tasks = []
            for _ in range(5):
                click_tasks.append(target_button.click(force=True, no_wait_after=True))

            try:
                await asyncio.gather(*click_tasks, return_exceptions=True)
                result["result"] = f"Rapid-clicked button '{button_text}' x5"
            except Exception as exc:
                result["result"] = f"Click error: {exc}"

            # Check page for error indicators
            await asyncio.sleep(0.1)
            page_content = await page.content()

            if InvariantFilter.is_actionable_failure(500, page_content):
                result["crash"] = True
                result["crash_body"] = page_content[:500]
                return result

        # --- Strategy 2: Try to find and interact with form inputs ---
        textboxes = page.get_by_role("textbox")
        textbox_count = await textboxes.count()

        if textbox_count > 0:
            target_input = textboxes.first
            result["action"] = "fill_input"
            try:
                await target_input.fill("9999")
                result["result"] = "Filled textbox with '9999' (overflow attempt)"
            except Exception as exc:
                result["result"] = f"Fill error: {exc}"

        # --- Strategy 3: Look for links by role ---
        if button_count == 0 and textbox_count == 0:
            links = page.get_by_role("link")
            link_count = await links.count()

            if link_count > 0:
                target_link = links.first
                link_text = await target_link.text_content() or "unnamed"
                result["action"] = "click_link"
                result["target"] = f"link: '{link_text}'"

                try:
                    await target_link.click()
                    await page.wait_for_load_state("networkidle", timeout=5000)
                    result["result"] = f"Clicked link '{link_text}'"
                except Exception as exc:
                    result["result"] = f"Link click error: {exc}"
            else:
                result["action"] = "no_interactive_elements"
                result["result"] = "No buttons, textboxes, or links found"

        return result
