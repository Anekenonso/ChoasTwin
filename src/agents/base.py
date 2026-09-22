"""Abstract base class for all ChaosTwin agents.

Every agent in the swarm (fuzzer, attacker, observer, patcher) inherits
from this base to ensure a consistent interface and lifecycle.
"""

from __future__ import annotations

import abc
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class AgentStatus(str, Enum):
    """Lifecycle status of a swarm agent."""

    IDLE = "IDLE"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    ERROR = "ERROR"


@dataclass
class AgentResult:
    """Standardised result container returned by every agent execution."""

    agent_name: str
    status: AgentStatus
    data: dict[str, Any] = field(default_factory=dict)
    error: str | None = None
    duration_ms: float = 0.0

    @property
    def is_success(self) -> bool:
        """Check if the agent completed successfully."""
        return self.status == AgentStatus.SUCCESS

    def to_dict(self) -> dict[str, Any]:
        """Serialise to a plain dictionary for WebSocket transmission."""
        return {
            "agent": self.agent_name,
            "status": self.status.value,
            "data": self.data,
            "error": self.error,
            "duration_ms": round(self.duration_ms, 2),
        }


class BaseAgent(abc.ABC):
    """Abstract base for all ChaosTwin swarm agents.

    Subclasses must implement `execute()`.  The base class provides
    timing, status tracking, and error wrapping.
    """

    def __init__(self, name: str) -> None:
        self.name = name
        self.status = AgentStatus.IDLE

    async def run(self, **kwargs: Any) -> AgentResult:
        """Execute the agent with automatic timing and error handling.

        This is the public entry point — it wraps `execute()` with
        timing and exception safety.
        """
        self.status = AgentStatus.RUNNING
        start = time.perf_counter()

        try:
            result_data = await self.execute(**kwargs)
            elapsed = (time.perf_counter() - start) * 1000
            self.status = AgentStatus.SUCCESS
            return AgentResult(
                agent_name=self.name,
                status=AgentStatus.SUCCESS,
                data=result_data or {},
                duration_ms=elapsed,
            )
        except Exception as exc:
            elapsed = (time.perf_counter() - start) * 1000
            self.status = AgentStatus.ERROR
            return AgentResult(
                agent_name=self.name,
                status=AgentStatus.ERROR,
                error=f"{type(exc).__name__}: {exc}",
                duration_ms=elapsed,
            )

    @abc.abstractmethod
    async def execute(self, **kwargs: Any) -> dict[str, Any] | None:
        """Core agent logic — implemented by each subclass.

        Returns:
            A dictionary of result data, or None if nothing to report.
        """
        ...
