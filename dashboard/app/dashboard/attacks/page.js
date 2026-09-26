'use client';

import { useSwarm } from '../../../components/SwarmContext';
import AttackChart from '../../../components/AttackChart';
import KPICard from '../../../components/KPICard';

export default function AttacksPage() {
  const swarm = useSwarm();

  const uiAttackSteps = [
    { step: 1, action: 'navigate', locator: 'URL: /login', result: 'Loaded DOM (84ms)' },
    { step: 2, action: 'fill', locator: 'role=textbox[name="Email"]', result: 'Injected fuzz payload: admin\' OR 1=1--' },
    { step: 3, action: 'rapid_click', locator: 'role=button[name="Submit Order"]', result: 'Dispatched 5 rapid clicks in 32ms window' },
    { step: 4, action: 'intercept_network', locator: '/api/v1/inventory/reserve', result: 'Captured 500 Internal Server Error' },
    { step: 5, action: 'keyboard_tab_spam', locator: 'role=combobox[name="Shipping"]', result: 'State intact' },
    { step: 6, action: 'modal_rapid_close', locator: 'role=button[name="Close"]', result: 'Unmount clean' },
    { step: 7, action: 'double_tap', locator: 'role=button[name="Pay Now"]', result: 'Simultaneous duplicate transaction triggered' },
    { step: 8, action: 'budget_limit', locator: 'Step 8 of 8 budget reached', result: 'Telemetry compressed & dispatched to Observer' },
  ];

  return (
    <div className="attacks-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="header-kicker font-mono">ADVERSARIAL ATTACK SWARM</div>
          <h1 className="page-title">Live Attack Vectors & Concurrency Fuzzing</h1>
          <p className="page-sub">
            Monitoring concurrent API bursts (<code className="code-pill font-mono">asyncio.gather</code>) and Playwright UI chaos actions.
          </p>
        </div>

        <div className="filter-stats-badge">
          <span className="filter-icon">🔍</span>
          <div>
            <div className="filter-title font-mono">INVARIANT FILTER STATUS</div>
            <div className="filter-val font-mono">
              840 benign 4xx dropped • 18 critical 5xx forwarded
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="kpi-grid">
        <KPICard
          title="Active Fuzzer Workers"
          value="25"
          subtitle="Concurrent async tasks"
          trend="Peak Concurrency"
          trendType="neutral"
          icon="⚡"
          accent="cyan"
        />
        <KPICard
          title="Filter Pass-Through"
          value="2.1%"
          subtitle="18 of 858 anomalies"
          trend="Noise Eliminated"
          trendType="positive"
          icon="🛡️"
          accent="green"
        />
        <KPICard
          title="Average Latency"
          value="84.2ms"
          subtitle="Per concurrent worker"
          trend="Fast Canary"
          trendType="positive"
          icon="⏱️"
          accent="purple"
        />
        <KPICard
          title="UI Steps Budget"
          value="8 / 8"
          subtitle="Playwright chaos budget"
          trend="Capped"
          trendType="neutral"
          icon="🎭"
          accent="orange"
        />
      </div>

      {/* Main Attack Chart */}
      <AttackChart currentAttack={swarm.currentAttack} recentAttacks={swarm.recentAttacks} />

      {/* Split View: Payload Inspector & UI Attacker Steps */}
      <div className="inspect-grid">
        {/* API Fuzzer Payload Inspector */}
        <div className="inspect-card">
          <div className="card-top">
            <h3 className="card-title">API Fuzzer Concurrent Burst Spec</h3>
            <span className="badge badge-rose font-mono">25 Workers</span>
          </div>
          <p className="card-desc">
            Burst strategy triggers check-then-act window in target <code className="code-pill font-mono">reserve_stock</code> endpoint.
          </p>

          <pre className="code-box font-mono">
{`# Concurrency Burst Dispatcher
tasks = [
    client.post(
        "/api/v1/inventory/reserve",
        json={"item_id": "item_gpu_01", "quantity": 1}
    )
    for _ in range(25)
]
results = await asyncio.gather(*tasks, return_exceptions=True)

# Invariant Assertion Check:
final_stock = db["items"]["item_gpu_01"]["stock"]
assert final_stock >= 0, f"Invariant breached: stock = {final_stock}"`}
          </pre>
        </div>

        {/* UI Attacker 8-Step Budget Explorer */}
        <div className="inspect-card">
          <div className="card-top">
            <h3 className="card-title">UI Attacker Chaos Steps (Playwright)</h3>
            <span className="badge badge-cyan font-mono">8-Step Budget</span>
          </div>
          <p className="card-desc">
            Headless browser agent stress testing client DOM state transitions and race conditions.
          </p>

          <div className="steps-list">
            {uiAttackSteps.map((s) => (
              <div key={s.step} className="step-row">
                <span className="step-num font-mono">0{s.step}</span>
                <div className="step-content">
                  <div className="step-action font-mono">
                    <span className="text-cyan font-bold">{s.action}</span>
                    <span className="step-locator text-muted"> → {s.locator}</span>
                  </div>
                  <div className="step-res">{s.result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .attacks-container {
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
          color: var(--accent-rose);
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

        .code-pill {
          background: rgba(255, 255, 255, 0.05);
          color: var(--accent-cyan);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }

        .filter-stats-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(14, 21, 36, 0.85);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: 10px 16px;
        }

        .filter-icon {
          font-size: 18px;
        }

        .filter-title {
          font-size: 9.5px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .filter-val {
          font-size: 11.5px;
          color: var(--accent-cyan);
          font-weight: 600;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        .inspect-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1000px) {
          .inspect-grid {
            grid-template-columns: 1fr;
          }
        }

        .inspect-card {
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

        .code-box {
          background: #05080e;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 14px;
          font-size: 11px;
          color: #a7f3d0;
          line-height: 1.55;
          overflow-x: auto;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
        }

        .step-row {
          display: flex;
          gap: 12px;
          background: rgba(8, 12, 20, 0.5);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .step-num {
          font-size: 10.5px;
          color: var(--text-muted);
          font-weight: 700;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-action {
          font-size: 11.5px;
        }

        .step-locator {
          color: var(--text-secondary);
        }

        .step-res {
          font-size: 11px;
          color: var(--text-muted);
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-muted { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
