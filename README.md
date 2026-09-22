# 🌀 ChaosTwin

**Autonomous Adversarial QA Swarm & Self-Healing Engine**

> Instead of passive unit tests, ChaosTwin actively probes APIs, exploits concurrency race conditions, queries live web intelligence via Tavily, and synthesises verified patches using NVIDIA Nemotron on Nebius Token Factory.

[![Nebius](https://img.shields.io/badge/Inference-Nebius%20Token%20Factory-blue)](https://nebius.com)
[![NVIDIA](https://img.shields.io/badge/Model-Nemotron%203%20Super-green)](https://nvidia.com)
[![Tavily](https://img.shields.io/badge/Search-Tavily%20API-purple)](https://tavily.com)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js Dashboard (:3000)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Overview  │ │  Attack  │ │ Patching │ │  Reports  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ WebSocket
┌──────────────────────▼──────────────────────────────────┐
│              Orchestrator Engine (:8001)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Fuzzer  │ │ Observer │ │ Patcher  │ │  Filter   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────────────┐ ┌─────────────────────────────┐   │
│  │  Nebius Client   │ │     Tavily Client           │   │
│  │  (Nemotron LLM)  │ │  (Web Intelligence)         │   │
│  └──────────────────┘ └─────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP Burst
┌──────────────────────▼──────────────────────────────────┐
│              Canary Target App (:8000)                    │
│          FastAPI + Intentional Race Condition             │
└─────────────────────────────────────────────────────────┘
```

## 🚀 How Judges Can Test ChaosTwin

### Option 1: Docker Compose (Recommended)

```bash
# Clone and start all three services
git clone <repo-url>
cd chaostwin
docker compose up --build

# Open the dashboard
open http://localhost:3000
```

### Option 2: Local Development

```bash
# Install Python dependencies
pip install -e ".[dev]"

# Terminal 1: Start the canary target
python -m target_app.app

# Terminal 2: Start the engine (mock mode)
python -m src.orchestrator --mock true

# Terminal 3: Start the dashboard
cd dashboard && npm run dev

# Open http://localhost:3000
```

### Option 3: CLI-Only (No Dashboard)

```bash
# Run the full swarm in mock mode
python -m src.orchestrator --target canary --mock true
```

## 🧪 Running Tests

```bash
# Install test dependencies
pip install -e ".[dev]"

# Run all tests
pytest -v

# Run only target app tests
pytest target_app/test_target.py -v

# Run E2E swarm tests
pytest tests/test_swarm_e2e.py -v
```

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEBIUS_API_KEY` | Nebius Token Factory API key | `mock-key` |
| `NEBIUS_MODEL` | Model identifier | `nvidia/nemotron-3-super-120b-a12b` |
| `TAVILY_API_KEY` | Tavily Search API key | (empty = mock) |
| `TARGET_URL` | Target application URL | `http://localhost:8000` |
| `MOCK_MODE` | Use deterministic mocks | `true` |

### Live Mode vs Mock Mode

- **Mock Mode** (`MOCK_MODE=true`): Everything runs offline with deterministic responses. No API keys needed. Perfect for judging and demos.
- **Live Mode** (`MOCK_MODE=false`): Calls real Nebius Nemotron for patch generation and Tavily for web intelligence. Requires valid API keys.

## 🔄 Swarm Lifecycle

```
BOOT → ATTACK → FILTER → COMPRESS → RECON → PATCH → VERIFY → RESOLVE
                                                        │
                                                Stage 1: Re-run exploit
                                                Stage 2: Regression tests
                                                        │
                                              Both pass? → COMMITTED
                                              Either fail? → RETRY
```

1. **Boot**: Initialise canary target and swarm agents
2. **Attack**: Fire 25 concurrent requests to exploit race condition
3. **Filter**: Discard benign 4xx, catch 5xx + invariant violations
4. **Compress**: Observer reduces raw traces to ≤15-field diagnostic
5. **Recon**: Tavily searches GitHub/StackOverflow for upstream fixes
6. **Patch**: Nemotron generates a unified diff (anti-lazy filtered)
7. **Verify**: Two-stage sandbox — exploit re-run + pytest regression
8. **Resolve**: Patch committed, system integrity restored

## 🛡️ Key Safeguards

- **Invariant Filter**: Only server errors (5xx) and state corruptions trigger incidents
- **Observer Compression**: Raw traces compressed 99%+ before reaching LLMs
- **Anti-Lazy Patcher**: Auto-rejects `try/except: pass` suppression patterns
- **Two-Stage Verification**: Exploit must not reproduce AND tests must pass
- **Bounded UI Exploration**: 8-step max for Playwright interactions
- **Dual-Mode Clients**: Everything works offline with mock fallbacks

## 📊 Sponsor Alignment

| Sponsor | Integration |
|---------|-------------|
| **Nebius** | Token Factory API for all LLM inference. TTFT and tokens/sec tracked in dashboard. |
| **NVIDIA** | Nemotron-3-super-120b-a12b model for patch synthesis. |
| **Tavily** | Search API for real-world bug reconnaissance from GitHub and StackOverflow. |

## 📁 Project Structure

```
chaostwin/
├── target_app/          # Vulnerable FastAPI canary app
├── src/
│   ├── config.py        # Pydantic Settings
│   ├── orchestrator.py  # State machine + WebSocket API
│   ├── agents/
│   │   ├── base.py      # Abstract agent
│   │   ├── filter.py    # Invariant filter
│   │   ├── observer.py  # Telemetry compression
│   │   ├── api_fuzzer.py    # Concurrency burst attacker
│   │   ├── ui_attacker.py   # Playwright bounded explorer
│   │   └── patcher.py      # Self-healing + verification
│   └── clients/
│       ├── nebius.py    # Nebius Token Factory (Nemotron)
│       └── tavily.py    # Tavily Search API
├── dashboard/           # Next.js web dashboard
├── tests/               # Integration tests
├── docker-compose.yml   # 1-click deployment
└── pyproject.toml       # Python packaging
```

---

*Built for the Nebius × NVIDIA Global AI Hackathon — Coding & Agentic Engineering Track*
