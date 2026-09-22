"""ChaosTwin Orchestrator — Central async state-machine coordinator.

Runs the full autonomous swarm lifecycle:
  Boot Canary → Execute Fuzzer → Filter → Compress → Tavily Recon →
  Nemotron Diff → Stage 1 & 2 Verification → Report.

Exposes a FastAPI server with:
  - WebSocket endpoint at /ws for real-time dashboard streaming.
  - REST endpoints for triggering and monitoring swarm runs.
  - CORS enabled for the Next.js dashboard.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from enum import Enum
from typing import Any

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.agents.api_fuzzer import APIConcurrencyFuzzer
from src.agents.observer import ObserverAgent
from src.agents.patcher import PatcherAgent, PatchStatus
from src.agents.ui_attacker import UIAttackerAgent
from src.clients.nebius import NebiusClient
from src.clients.tavily import TavilyClient
from src.config import get_settings


# ---------------------------------------------------------------------------
# Swarm State Machine
# ---------------------------------------------------------------------------


class SwarmState(str, Enum):
    """Lifecycle states of the autonomous swarm."""

    IDLE = "IDLE"
    BOOTING = "BOOTING"
    ATTACKING = "ATTACKING"
    RECONNAISSANCE = "RECONNAISSANCE"
    PATCHING = "PATCHING"
    VERIFYING = "VERIFYING"
    RESOLVED = "RESOLVED"
    ERROR = "ERROR"


class SwarmEvent(BaseModel):
    """Event emitted to the dashboard via WebSocket."""

    state: str
    timestamp: str
    data: dict[str, Any] = {}
    message: str = ""


# ---------------------------------------------------------------------------
# WebSocket Connection Manager
# ---------------------------------------------------------------------------


class ConnectionManager:
    """Manages active WebSocket connections for real-time dashboard updates."""

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a disconnected WebSocket."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, event: SwarmEvent) -> None:
        """Send an event to all connected dashboards."""
        message = event.model_dump_json()
        disconnected: list[WebSocket] = []

        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)


# ---------------------------------------------------------------------------
# Orchestrator Engine
# ---------------------------------------------------------------------------


class SwarmOrchestrator:
    """Central coordinator for the autonomous swarm lifecycle."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._state = SwarmState.IDLE
        self._manager = ConnectionManager()
        self._run_history: list[dict[str, Any]] = []
        self._current_run: dict[str, Any] | None = None

    @property
    def state(self) -> SwarmState:
        """Current swarm state."""
        return self._state

    @property
    def connection_manager(self) -> ConnectionManager:
        """WebSocket connection manager."""
        return self._manager

    @property
    def run_history(self) -> list[dict[str, Any]]:
        """History of completed swarm runs."""
        return self._run_history

    @property
    def current_run(self) -> dict[str, Any] | None:
        """Currently active swarm run, if any."""
        return self._current_run

    async def _emit(self, state: SwarmState, message: str, data: dict[str, Any] | None = None) -> None:
        """Update state and broadcast to all connected dashboards."""
        self._state = state
        event = SwarmEvent(
            state=state.value,
            timestamp=datetime.now(timezone.utc).isoformat(),
            data=data or {},
            message=message,
        )
        await self._manager.broadcast(event)

        # Also update current run data
        if self._current_run is not None:
            self._current_run["events"].append(event.model_dump())
            self._current_run["state"] = state.value

    async def run_swarm(self, target_url: str | None = None) -> dict[str, Any]:
        """Execute the full autonomous swarm lifecycle.

        Args:
            target_url: Override target URL (default from config).

        Returns:
            Complete run result with all phase data and telemetry.
        """
        if target_url is None:
            target_url = self._settings.target_url

        run_start = time.perf_counter()
        run_id = f"run_{int(time.time())}"

        self._current_run = {
            "run_id": run_id,
            "target_url": target_url,
            "state": SwarmState.BOOTING.value,
            "events": [],
            "attack_result": None,
            "diagnostic": None,
            "tavily_results": None,
            "patch_result": None,
            "timing": {},
            "started_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            # ========== PHASE 1: BOOT ==========
            await self._emit(
                SwarmState.BOOTING,
                f"Initializing swarm against {target_url}",
                {
                    "target_url": target_url,
                    "mock_mode": self._settings.is_mock_mode,
                    "model": self._settings.nebius_model,
                    "burst_size": self._settings.burst_size,
                },
            )
            await asyncio.sleep(0.5)  # Brief boot delay

            # ========== PHASE 2: ATTACK ==========
            phase_start = time.perf_counter()
            await self._emit(
                SwarmState.ATTACKING,
                f"Firing {self._settings.burst_size}-burst concurrency attack",
            )

            fuzzer = APIConcurrencyFuzzer()
            attack_result = await fuzzer.execute_burst_attack(
                target_url=target_url,
                burst_size=self._settings.burst_size,
            )
            self._current_run["attack_result"] = attack_result
            self._current_run["timing"]["attack_ms"] = round(
                (time.perf_counter() - phase_start) * 1000, 2
            )

            # Emit attack results
            await self._emit(
                SwarmState.ATTACKING,
                "Attack complete" + (
                    " — EXPLOIT DETECTED!" if attack_result["exploit_detected"]
                    else " — no vulnerabilities found"
                ),
                {
                    "summary": attack_result["summary"],
                    "exploit_detected": attack_result["exploit_detected"],
                    "requests": [
                        {
                            "request_id": r.get("request_id"),
                            "status_code": r.get("status_code"),
                            "response_time_ms": r.get("response_time_ms"),
                            "actionable": r.get("actionable"),
                        }
                        for r in attack_result.get("requests", [])
                    ],
                },
            )

            if not attack_result["exploit_detected"]:
                await self._emit(SwarmState.RESOLVED, "No vulnerabilities detected — system clean")
                self._current_run["state"] = SwarmState.RESOLVED.value
                self._finalize_run(run_start)
                return self._current_run

            # ========== PHASE 3: RECONNAISSANCE ==========
            phase_start = time.perf_counter()
            diagnostic = attack_result["diagnostic"]
            self._current_run["diagnostic"] = diagnostic

            await self._emit(
                SwarmState.RECONNAISSANCE,
                "Compressing telemetry and searching for upstream fixes",
                {"diagnostic": diagnostic},
            )

            # Tavily search
            tavily = TavilyClient()
            query = await tavily.build_query_from_diagnostic(diagnostic)
            tavily_results = await tavily.search_bug_intel(query)
            self._current_run["tavily_results"] = tavily_results
            self._current_run["timing"]["recon_ms"] = round(
                (time.perf_counter() - phase_start) * 1000, 2
            )

            await self._emit(
                SwarmState.RECONNAISSANCE,
                f"Found {len(tavily_results)} upstream references",
                {
                    "query": query,
                    "results": tavily_results,
                    "diagnostic_formatted": ObserverAgent.format_for_llm(diagnostic),
                },
            )

            # ========== PHASE 4: PATCHING ==========
            phase_start = time.perf_counter()
            await self._emit(
                SwarmState.PATCHING,
                "Synthesising patch via Nemotron on Nebius Token Factory",
            )

            patcher = PatcherAgent()
            patch_result = await patcher.generate_and_verify_patch(
                diagnostic=diagnostic,
            )
            self._current_run["patch_result"] = patch_result
            self._current_run["timing"]["patch_ms"] = round(
                (time.perf_counter() - phase_start) * 1000, 2
            )

            # Emit patching progress
            await self._emit(
                SwarmState.PATCHING,
                f"Patch generated (attempt {patch_result.get('attempts', 1)})",
                {
                    "diff": patch_result.get("diff", ""),
                    "explanation": patch_result.get("explanation", ""),
                    "anti_lazy_passed": patch_result.get("anti_lazy_passed", False),
                    "nebius_telemetry": patch_result.get("nebius_telemetry", {}),
                },
            )

            # ========== PHASE 5: VERIFICATION ==========
            await self._emit(
                SwarmState.VERIFYING,
                "Running two-stage sandbox verification",
                {
                    "stage_1_passed": patch_result.get("stage_1_passed", False),
                    "stage_2_passed": patch_result.get("stage_2_passed", False),
                },
            )

            # ========== PHASE 6: RESOLUTION ==========
            if patch_result.get("status") == PatchStatus.VERIFIED_AND_COMMITTED.value:
                total_time_ms = (time.perf_counter() - run_start) * 1000
                self._current_run["timing"]["total_ms"] = round(total_time_ms, 2)

                await self._emit(
                    SwarmState.RESOLVED,
                    "Patch verified and committed — system integrity restored",
                    {
                        "patch_status": patch_result["status"],
                        "patch_file": patch_result.get("patch_file", ""),
                        "timing": self._current_run["timing"],
                        "nebius_telemetry": patch_result.get("nebius_telemetry", {}),
                        "tavily_query_count": len(tavily_results),
                    },
                )
            else:
                await self._emit(
                    SwarmState.ERROR,
                    f"Patch verification failed: {patch_result.get('error', 'Unknown')}",
                    {"patch_status": patch_result.get("status", "ERROR")},
                )

        except Exception as exc:
            await self._emit(
                SwarmState.ERROR,
                f"Swarm error: {type(exc).__name__}: {exc}",
            )

        self._finalize_run(run_start)
        return self._current_run

    def _finalize_run(self, run_start: float) -> None:
        """Finalize and archive the current run."""
        if self._current_run is not None:
            self._current_run["timing"]["total_ms"] = round(
                (time.perf_counter() - run_start) * 1000, 2
            )
            self._current_run["completed_at"] = datetime.now(timezone.utc).isoformat()
            self._run_history.append(self._current_run)


# ---------------------------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------------------------

# Global orchestrator instance
orchestrator = SwarmOrchestrator()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    yield


engine_app = FastAPI(
    title="ChaosTwin Engine",
    description="Autonomous Adversarial QA Swarm — WebSocket API for dashboard.",
    version="1.0.0",
    lifespan=lifespan,
)

engine_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to dashboard URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- REST Endpoints ---


@engine_app.get("/api/status")
async def get_status() -> dict[str, Any]:
    """Get current swarm status."""
    settings = get_settings()
    return {
        "state": orchestrator.state.value,
        "mock_mode": settings.is_mock_mode,
        "model": settings.nebius_model,
        "target_url": settings.target_url,
        "current_run": orchestrator.current_run,
    }


@engine_app.get("/api/history")
async def get_history() -> list[dict[str, Any]]:
    """Get history of all swarm runs."""
    return orchestrator.run_history


@engine_app.post("/api/swarm/start")
async def start_swarm(target_url: str | None = None) -> dict[str, str]:
    """Trigger a new swarm run."""
    if orchestrator.state not in (SwarmState.IDLE, SwarmState.RESOLVED, SwarmState.ERROR):
        return {"status": "error", "message": "Swarm is already running"}

    # Run swarm in background
    asyncio.create_task(orchestrator.run_swarm(target_url=target_url))
    return {"status": "started", "message": "Swarm run initiated"}


@engine_app.post("/api/swarm/reset")
async def reset_swarm() -> dict[str, str]:
    """Reset the swarm to IDLE state."""
    orchestrator._state = SwarmState.IDLE
    orchestrator._current_run = None
    return {"status": "reset", "message": "Swarm reset to IDLE"}


@engine_app.get("/api/config")
async def get_config() -> dict[str, Any]:
    """Get current configuration (safe subset)."""
    settings = get_settings()
    return {
        "mock_mode": settings.is_mock_mode,
        "model": settings.nebius_model,
        "burst_size": settings.burst_size,
        "max_ui_steps": settings.max_ui_steps,
        "auto_apply_patches": settings.auto_apply_patches,
        "target_url": settings.target_url,
        "nebius_connected": not settings.is_mock_mode,
        "tavily_connected": settings.tavily_available,
    }


# --- WebSocket Endpoint ---


@engine_app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """WebSocket endpoint for real-time dashboard updates."""
    await orchestrator.connection_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for commands
            data = await websocket.receive_text()
            try:
                command = json.loads(data)
                if command.get("action") == "start":
                    target_url = command.get("target_url")
                    asyncio.create_task(orchestrator.run_swarm(target_url=target_url))
                elif command.get("action") == "status":
                    await websocket.send_text(json.dumps({
                        "state": orchestrator.state.value,
                        "current_run": orchestrator.current_run,
                    }))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        orchestrator.connection_manager.disconnect(websocket)


# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------


def main() -> None:
    """CLI entry point for the ChaosTwin orchestrator."""
    parser = argparse.ArgumentParser(
        description="ChaosTwin — Autonomous Adversarial QA Swarm",
    )
    parser.add_argument(
        "--target",
        choices=["canary", "external"],
        default="canary",
        help="Target mode: 'canary' (built-in vulnerable app) or 'external'.",
    )
    parser.add_argument(
        "--mock",
        choices=["true", "false"],
        default=None,
        help="Override mock mode (default: auto-detect from API keys).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=None,
        help="Port for the engine API server.",
    )

    args = parser.parse_args()

    settings = get_settings()

    if args.mock is not None:
        import os
        os.environ["MOCK_MODE"] = args.mock

    port = args.port or settings.engine_port

    print(f"\n{'='*60}")
    print(f"  CHAOSTWIN // AUTONOMOUS ADVERSARIAL QA SWARM")
    print(f"{'='*60}")
    print(f"  Engine API:    http://localhost:{port}")
    print(f"  WebSocket:     ws://localhost:{port}/ws")
    print(f"  Mock Mode:     {settings.is_mock_mode}")
    print(f"  Model:         {settings.nebius_model}")
    print(f"  Target:        {settings.target_url}")
    print(f"{'='*60}\n")

    uvicorn.run(
        engine_app,
        host="0.0.0.0",
        port=port,
        log_level="info",
    )


if __name__ == "__main__":
    main()
