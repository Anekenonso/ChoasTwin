'use client';

export default function AttackChart({ currentAttack }) {
  const attack = currentAttack || {
    burstId: 'burst_025',
    target: '/api/v1/inventory/reserve',
    concurrency: 25,
    statusCodes: { '200': 18, '500': 7 },
    anomalies: 7,
    latencyAvgMs: 84.2,
  };

  // Generate 25 deterministic simulated worker slots for visual burst display
  const workers = Array.from({ length: 25 }, (_, i) => {
    // 7 out of 25 failed with 500 race conditions
    const isError = i % 3 === 0 && i < 21;
    const latency = 62 + ((i * 37) % 53);
    return {
      id: i + 1,
      status: isError ? 500 : 200,
      latency,
      type: isError ? 'RACE_ANOMALY' : 'RESERVED',
    };
  });

  return (
    <div className="attack-chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-kicker font-mono">ADVERSARIAL CONCURRENCY WATERFALL</div>
          <h3 className="chart-title">25-Burst Fuzzing Waterfall</h3>
          <p className="chart-subtitle">
            Target: <span className="font-mono text-cyan">{attack.target}</span> (25 concurrent coroutines via <code className="font-mono">asyncio.gather</code>)
          </p>
        </div>
        <div className="chart-stats">
          <span className="badge badge-rose font-mono">{attack.anomalies || 7} Invariant Breaches</span>
          <span className="badge badge-emerald font-mono">18 Accepted</span>
          <span className="badge badge-cyan font-mono">{attack.latencyAvgMs || 84.2}ms Avg</span>
        </div>
      </div>

      {/* Waterfall Grid */}
      <div className="waterfall-container">
        <div className="waterfall-labels font-mono">
          <span>Worker #</span>
          <span>Latency & Invariant Status</span>
        </div>
        <div className="workers-list">
          {workers.map((w) => {
            const is500 = w.status === 500;
            const barWidth = Math.min(100, Math.max(15, (w.latency / 120) * 100));

            return (
              <div key={w.id} className="worker-row">
                <span className="worker-id font-mono">W{String(w.id).padStart(2, '0')}</span>
                <div className="worker-track">
                  <div
                    className={`worker-bar ${is500 ? 'bar-error' : 'bar-success'}`}
                    style={{ width: `${barWidth}%` }}
                  >
                    <span className="worker-latency font-mono">{w.latency}ms</span>
                  </div>
                </div>
                <span className={`worker-status font-mono ${is500 ? 'text-rose' : 'text-emerald'}`}>
                  {w.status} {is500 ? '🚨 OVERFLOW' : '✔ OK'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .attack-chart-card {
          background: linear-gradient(180deg, rgba(14, 21, 36, 0.9) 0%, rgba(10, 16, 28, 0.95) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: var(--shadow-card);
          backdrop-filter: blur(16px);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .chart-kicker {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-rose);
          letter-spacing: 0.12em;
          margin-bottom: 4px;
        }

        .chart-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .chart-subtitle {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-rose { color: var(--accent-rose); }
        .text-emerald { color: var(--accent-emerald); }

        .chart-stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .waterfall-container {
          background: #05080e;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .waterfall-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          color: var(--text-muted);
          font-weight: 700;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .workers-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 230px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .worker-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .worker-id {
          font-size: 10.5px;
          color: var(--text-muted);
          width: 32px;
          font-weight: 600;
        }

        .worker-track {
          flex: 1;
          height: 18px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-xs);
          overflow: hidden;
        }

        .worker-bar {
          height: 100%;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          padding-left: 8px;
          transition: width 0.3s ease;
        }

        .bar-success {
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.7));
          border-right: 2px solid var(--accent-emerald);
        }

        .bar-error {
          background: linear-gradient(90deg, rgba(244, 63, 94, 0.3), rgba(244, 63, 94, 0.8));
          border-right: 2px solid var(--accent-rose);
        }

        .worker-latency {
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
        }

        .worker-status {
          font-size: 10.5px;
          font-weight: 700;
          width: 95px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
