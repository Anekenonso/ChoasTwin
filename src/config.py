"""Centralized configuration management using Pydantic Settings.

Parses all environment variables with sensible defaults for local development.
Supports .env file loading and runtime overrides.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide configuration parsed from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Nebius Token Factory (NVIDIA Nemotron) ---
    nebius_api_key: str = Field(
        default="mock-key",
        description="API key for Nebius Token Factory. Set to 'mock-key' for offline mode.",
    )
    nebius_base_url: str = Field(
        default="https://api.tokenfactory.nebius.com/v1/",
        description="Base URL for the Nebius inference endpoint.",
    )
    nebius_model: str = Field(
        default="nvidia/nemotron-3-super-120b-a12b",
        description="Model identifier for Nemotron on Nebius.",
    )

    # --- Tavily Search API ---
    tavily_api_key: str = Field(
        default="",
        description="API key for Tavily search. Leave empty for mock mode.",
    )

    # --- Target Application ---
    target_url: str = Field(
        default="http://localhost:8000",
        description="Base URL of the target application to attack.",
    )

    # --- Execution Mode ---
    mock_mode: bool = Field(
        default=True,
        description="Use deterministic local mocks instead of live API calls.",
    )

    # --- Server Ports ---
    dashboard_port: int = Field(default=3000, description="Next.js dashboard port.")
    engine_port: int = Field(default=8001, description="Orchestrator WebSocket API port.")

    # --- Swarm Configuration ---
    burst_size: int = Field(default=25, ge=1, le=200, description="Concurrent requests per burst.")
    max_ui_steps: int = Field(default=8, ge=1, le=50, description="Max Playwright interaction steps.")
    auto_apply_patches: bool = Field(default=False, description="Auto-apply verified patches.")

    @field_validator("nebius_base_url")
    @classmethod
    def ensure_trailing_slash(cls, v: str) -> str:
        """Ensure the base URL ends with a trailing slash."""
        return v if v.endswith("/") else f"{v}/"

    @property
    def is_mock_mode(self) -> bool:
        """Determine if the system should run in mock mode.

        Mock mode activates when explicitly set OR when API keys are missing/placeholder.
        """
        if self.mock_mode:
            return True
        if self.nebius_api_key in ("", "mock-key", "your-nebius-api-key-here"):
            return True
        return False

    @property
    def tavily_available(self) -> bool:
        """Check if Tavily API is configured for live use."""
        return bool(self.tavily_api_key) and self.tavily_api_key not in (
            "your-tavily-api-key-here",
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton Settings instance.

    Uses lru_cache to ensure the settings are only parsed once from
    environment variables across the entire application lifecycle.
    """
    return Settings()
