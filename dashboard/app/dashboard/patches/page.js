'use client';

import { useSwarm } from '../../../components/SwarmContext';
import DiffViewer from '../../../components/DiffViewer';
import KPICard from '../../../components/KPICard';

export default function PatchesPage() {
  const swarm = useSwarm();

  const tavilyResults = [
    {
      title: 'Fixing Async TOCTOU Race Conditions in Python FastAPI & asyncio',
      url: 'https://docs.python.org/3/library/asyncio-sync.html#asyncio.Lock',
      snippet: 'Use asyncio.Lock around state mutation blocks to guarantee mutual exclusion during concurrent await calls in web request handlers.',
      relevance: '98%',
    },
    {
      title: 'FastAPI Concurrency Guide: In-Memory Datastores & Invariant Locks',
      url: 'https://fastapi.tiangolo.com/advanced/concurrency/',
      snippet: 'When modifying shared global in-memory state, un-mutexed read-modify-write patterns create critical inventory underflow vulnerabilities.',
      relevance: '95%',
    },
    {
      title: 'CWE-367: Time-of-Check Time-of-Use (TOCTOU) Race Condition Pattern',
      url: 'https://cwe.mitre.org/data/definitions/367.html',
      snippet: 'The software checks the state of a resource before using that resource, but the resource state can change between check and use.',
      relevance: '91%',
    }
  ];

  const observerTelemetry = {
    incident_id: 'INC-2026-089',
    endpoint: '/api/v1/inventory/reserve',
    method: 'POST',
    status_code: 500,
    burst_size: 25,
    concurrency_window_ms: 54,
    failing_assertion: 'assert stock >= 0',
    stock_observed: -6,
    stock_initial: 10,
    active_coroutine_count: 25,
    source_file: 'target_app/app.py',
    failing_line: 47,
    stack_trace_depth: 3,
    root_cause_heuristic: 'ASYNC_TOCTOU_RACE',
    compression_ratio: '92.4% (8.4KB raw → 0.6KB LLM envelope)',
  };

  return (
    <div className="patches-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="header-kicker font-mono">RECON & SELF-HEALING ENGINE</div>
          <h1 className="page-title">Recon Intelligence & Autonomous Patches</h1>
          <p className="page-sub">
            Observer telemetry compression, Tavily CVE intelligence, and Nebius DeepSeek-R1 anti-lazy code generation.
          </p>
        </div>

        <div className="model-chip-large">
          <span className="chip-badge font-mono">AI CORE</span>
          <div className="chip-info font-mono">
            <span className="text-white font-bold">deepseek-ai/DeepSeek-R1</span>
            <span className="text-purple">Nebius Token Factory @ 148.5 tok/s</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <KPICard
          title="Telemetry Compression"
          value="92.4%"
          subtitle="≤15 fields LLM envelope"
          trend="Context Optimized"
          trendType="positive"
          icon="📦"
          accent="cyan"
        />
        <KPICard
          title="Tavily Recon Hits"
          value="3 Sources"
          subtitle="Real-time CVE guidance"
          trend="High Precision"
          trendType="positive"
          icon="🌐"
          accent="green"
        />
        <KPICard
          title="Anti-Lazy AST Score"
          value="100 / 100"
          subtitle="Zero empty excepts / pass"
          trend="Strict Validated"
          trendType="positive"
          icon="🛡️"
          accent="purple"
        />
        <KPICard
          title="Time to First Token"
          value="240ms"
          subtitle="Nebius H100 inference"
          trend="Realtime"
          trendType="positive"
          icon="⚡"
          accent="orange"
        />
      </div>

      {/* Active Diff Viewer */}
      <DiffViewer patch={swarm.latestPatch} />

      {/* Intelligence & Telemetry Grid */}
      <div className="intel-grid">
        {/* Tavily Knowledge Extraction */}
        <div className="intel-card">
          <div className="card-top">
            <h3 className="card-title">Tavily CVE & Remediation Intelligence</h3>
            <span className="badge badge-emerald font-mono">3 Retrieved</span>
          </div>
          <p className="card-desc">
            Autonomous web search queries synthesized from invariant trace to guide DeepSeek-R1 prompt.
          </p>

          <div className="tavily-list">
            {tavilyResults.map((res, i) => (
              <div key={i} className="tavily-item">
                <div className="tavily-top">
                  <a href={res.url} target="_blank" rel="noreferrer" className="tavily-link font-mono">
                    {res.title}
                  </a>
                  <span className="relevance-badge font-mono">{res.relevance} Match</span>
                </div>
                <p className="tavily-snippet">{res.snippet}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Observer Compressed Telemetry Envelope */}
        <div className="intel-card">
          <div className="card-top">
            <h3 className="card-title">Observer Compressed Telemetry Envelope</h3>
            <span className="badge badge-cyan font-mono">92.4% Compressed</span>
          </div>
          <p className="card-desc">
            Raw 8.4KB process logs compressed into token-efficient JSON payload fed to Nebius API.
          </p>

          <pre className="json-box font-mono">
            {JSON.stringify(observerTelemetry, null, 2)}
          </pre>
        </div>
      </div>

      <style jsx>{`
        .patches-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .header-kicker {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-purple);
          letter-spacing: 0.12em;
          margin-bottom: 4px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .page-sub {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .model-chip-large {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(14, 21, 36, 0.9);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: 10px 16px;
        }

        .chip-badge {
          background: var(--accent-purple-soft);
          color: var(--accent-purple);
          border: 1px solid rgba(168, 85, 247, 0.3);
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-xs);
        }

        .chip-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .text-white { color: #ffffff; font-size: 12px; }
        .text-purple { color: var(--accent-purple); font-size: 10.5px; }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        .intel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1000px) {
          .intel-grid {
            grid-template-columns: 1fr;
          }
        }

        .intel-card {
          background: linear-gradient(180deg, rgba(14, 21, 36, 0.9) 0%, rgba(10, 16, 28, 0.95) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: var(--shadow-card);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .tavily-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 280px;
          overflow-y: auto;
        }

        .tavily-item {
          background: rgba(8, 12, 20, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tavily-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tavily-link {
          font-size: 12px;
          font-weight: 700;
          color: var(--accent-cyan);
          text-decoration: none;
        }

        .tavily-link:hover {
          text-decoration: underline;
        }

        .relevance-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-emerald);
          background: var(--accent-emerald-soft);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }

        .tavily-snippet {
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .json-box {
          background: #05080e;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 14px;
          font-size: 11px;
          color: #38bdf8;
          line-height: 1.45;
          max-height: 280px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
