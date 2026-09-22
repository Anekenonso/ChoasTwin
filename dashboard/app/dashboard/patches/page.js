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
      <div className="page-header">
        <div>
          <span className="page-tag font-mono">RECON & SELF-HEALING ENGINE</span>
          <h1 className="page-title">Recon Intelligence & Autonomous Patches</h1>
          <p className="page-sub">
            Observer telemetry compression, Tavily CVE intelligence, and Nebius DeepSeek-R1 anti-lazy code generation.
          </p>
        </div>

        <div className="model-chip-large">
          <span className="chip-badge">AI Core</span>
          <div className="chip-info font-mono">
            <span className="text-white">deepseek-ai/DeepSeek-R1</span>
            <span className="text-purple">Nebius Token Factory @ 148.5 tok/s</span>
          </div>
        </div>
      </div>

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
          trend="Ultra Low Latency"
          trendType="positive"
          icon="⚡"
          accent="orange"
        />
      </div>

      {/* Main Patch Diff Viewer */}
      <DiffViewer patch={swarm.latestPatch} />

      {/* Split Grid: Tavily Recon & Observer Compressed Telemetry */}
      <div className="intel-grid">
        {/* Tavily Intelligence Feed */}
        <div className="intel-card">
          <div className="card-top">
            <h3 className="card-title">Tavily CVE & Remediation Intelligence</h3>
            <span className="badge badge-cyan font-mono">Real-Time Search</span>
          </div>
          <p className="card-desc">
            Autonomous queries dispatched by TavilyClient to discover remediation patterns for concurrency bugs.
          </p>

          <div className="tavily-list">
            {tavilyResults.map((item, idx) => (
              <div key={idx} className="tavily-item">
                <div className="tavily-top">
                  <a href={item.url} target="_blank" rel="noreferrer" className="tavily-link">
                    {item.title} ↗
                  </a>
                  <span className="relevance-badge font-mono">{item.relevance} match</span>
                </div>
                <p className="tavily-snippet">{item.snippet}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Observer Telemetry Envelope */}
        <div className="intel-card">
          <div className="card-top">
            <h3 className="card-title">Observer Compressed Telemetry (≤15 Fields)</h3>
            <span className="badge badge-success font-mono">Compressed</span>
          </div>
          <p className="card-desc">
            Raw logs, stack traces, and environment telemetry boiled down to a 15-field JSON payload for LLM prompt efficiency.
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
          gap: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-tag {
          font-size: 10px;
          color: #00d4ff;
          font-weight: 700;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 6px;
        }

        .page-title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .page-sub {
          font-size: 13px;
          color: #8b949e;
        }

        .model-chip-large {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          padding: 8px 16px;
          border-radius: 10px;
        }

        .chip-badge {
          background: #a855f7;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .chip-info {
          display: flex;
          flex-direction: column;
          font-size: 11px;
        }

        .text-white { color: #ffffff; font-weight: 600; }
        .text-purple { color: #c084fc; font-size: 10px; }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .intel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1000px) {
          .intel-grid {
            grid-template-columns: 1fr;
          }
        }

        .intel-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }

        .card-desc {
          font-size: 12px;
          color: #8b949e;
          margin: 0;
          line-height: 1.4;
        }

        .tavily-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 280px;
          overflow-y: auto;
        }

        .tavily-item {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 10px 14px;
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
          font-weight: 600;
          color: #00d4ff;
          text-decoration: none;
        }

        .tavily-link:hover {
          text-decoration: underline;
        }

        .relevance-badge {
          font-size: 10px;
          color: #2ed573;
          background: rgba(46, 213, 115, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tavily-snippet {
          font-size: 11px;
          color: #8b949e;
          line-height: 1.4;
          margin: 0;
        }

        .json-box {
          background: #06090e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px;
          font-size: 11px;
          color: #00d4ff;
          line-height: 1.4;
          max-height: 280px;
          overflow-y: auto;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
