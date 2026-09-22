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
      <div className="page-header">
        <div>
          <span className="page-tag font-mono">ADVERSARIAL ATTACK SWARM</span>
          <h1 className="page-title">Live Attack Vectors & Concurrency Fuzzing</h1>
          <p className="page-sub">
            Monitoring concurrent API bursts (<code className="font-mono">asyncio.gather</code>) and Playwright UI chaos actions.
          </p>
        </div>

        <div className="filter-stats-badge">
          <span className="filter-icon">🔍</span>
          <div>
            <div className="filter-title">Invariant Filter Status</div>
            <div className="filter-val font-mono">
              840 benign 4xx dropped • 18 critical 5xx forwarded
            </div>
          </div>
        </div>
      </div>

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
            <span className="badge badge-error font-mono">25 Workers</span>
          </div>
          <p className="card-desc">
            Burst strategy triggers check-then-act window in target <code className="font-mono">reserve_stock</code> endpoint.
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
            Accessibility locator navigation (<code className="font-mono">get_by_role</code>) simulating erratic user interactions.
          </p>

          <div className="steps-list">
            {uiAttackSteps.map((st) => (
              <div key={st.step} className="step-row">
                <span className="step-num font-mono">#{st.step}</span>
                <div className="step-content">
                  <div className="step-action font-mono">
                    <strong className="text-cyan">{st.action}</strong> → {st.locator}
                  </div>
                  <div className="step-res">{st.result}</div>
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

        .filter-stats-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(46, 213, 115, 0.08);
          border: 1px solid rgba(46, 213, 115, 0.25);
          padding: 10px 16px;
          border-radius: 10px;
        }

        .filter-icon {
          font-size: 20px;
        }

        .filter-title {
          font-size: 11px;
          color: #2ed573;
          font-weight: 700;
        }

        .filter-val {
          font-size: 11px;
          color: #e6edf3;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .inspect-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1000px) {
          .inspect-grid {
            grid-template-columns: 1fr;
          }
        }

        .inspect-card {
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

        .code-box {
          background: #06090e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 14px;
          font-size: 11px;
          color: #7ee787;
          line-height: 1.5;
          overflow-x: auto;
          margin: 0;
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
          background: rgba(0, 0, 0, 0.25);
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .step-num {
          font-size: 11px;
          color: #8b949e;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-action {
          font-size: 11px;
          color: #ffffff;
        }

        .step-res {
          font-size: 10px;
          color: #8b949e;
        }

        .text-cyan {
          color: #00d4ff;
        }
      `}</style>
    </div>
  );
}
