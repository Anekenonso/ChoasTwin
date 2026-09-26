'use client';

import { useState } from 'react';
import { useSwarm } from '../../../components/SwarmContext';
import VerificationPanel from '../../../components/VerificationPanel';
import KPICard from '../../../components/KPICard';

export default function VerifyPage() {
  const swarm = useSwarm();
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState('Just now');

  const triggerVerification = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLastRunTime('Just now');
    }, 1200);
  };

  return (
    <div className="verify-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="header-kicker font-mono">SANDBOXED QUALITY GATE</div>
          <h1 className="page-title">Two-Stage Verification & Anti-Regression</h1>
          <p className="page-sub">
            Validating patches in a sandboxed target instance before committing changes to production branches.
          </p>
        </div>

        <button
          onClick={triggerVerification}
          disabled={isRunning}
          className="btn-rerun font-mono"
        >
          {isRunning ? '⏳ Running Suite...' : '▶ Re-Run Verification Suite'}
        </button>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KPICard
          title="Stage 1: Unit Tests"
          value="3 / 3 PASS"
          subtitle="test_target.py suite"
          trend="0 Regressions"
          trendType="positive"
          icon="🧪"
          accent="green"
        />
        <KPICard
          title="Stage 2: Re-Fuzz"
          value="0 Anomalies"
          subtitle="25-burst stress test"
          trend="100% Resistant"
          trendType="positive"
          icon="🛡️"
          accent="cyan"
        />
        <KPICard
          title="Verification Latency"
          value="420ms"
          subtitle="Full dual-stage run"
          trend="Sub-Second Gate"
          trendType="positive"
          icon="⚡"
          accent="purple"
        />
        <KPICard
          title="Audit Status"
          value="APPROVED"
          subtitle={`Verified: ${lastRunTime}`}
          trend="Deployable"
          trendType="positive"
          icon="✅"
          accent="green"
        />
      </div>

      {/* Main Two-Stage Panel */}
      <VerificationPanel verification={swarm.verification} />

      {/* Deep-Dive Test Artifacts */}
      <div className="details-grid">
        <div className="detail-card">
          <div className="card-top">
            <h3 className="card-title">Stage 1 Test Log (pytest execution)</h3>
            <span className="badge badge-emerald font-mono">0.42s execution</span>
          </div>
          <pre className="terminal-box font-mono">
{`============================= test session starts =============================
platform linux -- Python 3.11.8, pytest-8.1.1
rootdir: /app/target_app
collected 3 items

target_app/test_target.py::test_health_check PASSED                    [ 33%]
target_app/test_target.py::test_single_reservation PASSED              [ 66%]
target_app/test_target.py::test_insufficient_stock_rejection PASSED    [100%]

============================== 3 passed in 0.42s ==============================
Regression status: CLEAN. Mutex does not alter standard functional flows.`}
          </pre>
        </div>

        <div className="detail-card">
          <div className="card-top">
            <h3 className="card-title">Stage 2 Re-Fuzz Telemetry (Adversarial Proof)</h3>
            <span className="badge badge-cyan font-mono">25-Coroutines Verified</span>
          </div>
          <pre className="terminal-box font-mono">
{`[APIConcurrencyFuzzer] Re-attacking patched FastAPI canary...
Dispatching 25 concurrent requests: /api/v1/inventory/reserve (quantity=1)
Results:
- 10 Accepted (200 OK) -> Stock reduced from 10 to 0
- 15 Rejected (409 Conflict) -> "Insufficient stock"
- 0 Invariant Breaches (stock never dropped < 0)
Final Stock: 0 (PASSED: assert stock >= 0)
Adversarial Resistance: 100%`}
          </pre>
        </div>
      </div>

      <style jsx>{`
        .verify-container {
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
          color: var(--accent-emerald);
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

        .btn-rerun {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #ffffff;
          padding: 10px 18px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-rerun:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .btn-rerun:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1000px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-card {
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
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .terminal-box {
          background: #05080e;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 14px;
          font-size: 11px;
          color: #a7f3d0;
          line-height: 1.55;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
