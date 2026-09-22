'use client';

export default function AttackChart({ currentAttack, recentAttacks = [] }) {
  const attack = currentAttack || {
    burstId: 'burst_025',
    target: '/api/v1/inventory/reserve',
    concurrency: 25,
    statusCodes: { '200': 18, '500': 7 },
    anomalies: 7,
    latencyAvgMs: 84.2,
  };

  // Generate 25 simulated worker slots for visual burst display
  const workers = Array.from({ length: 25 }, (_, i) => {
    // 7 out of 25 failed with 500 race conditions
    const isError = i % 3 === 0 && i < 21;
    const latency = Math.floor(65 + Math.random() * 50);
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
          <h3 className="chart-title">Concurrent Fuzzing Waterfall — 25-Burst Burst</h3>
          <p className="chart-subtitle">
            Endpoint: <span className="font-mono text-cyan">{attack.target}</span> (25 concurrent workers via <code className="font-mono">asyncio.gather</code>)
          </p>
        </div>
        <div className="chart-stats">
          <span className="badge badge-error font-mono">{attack.anomalies || 7} Invariant Breaches</span>
          <span className="badge badge-success font-mono">18 Accepted</span>
          <span className="badge badge-cyan font-mono">{attack.latencyAvgMs || 84.2}ms Avg</span>
        </div>
      </div>

      {/* Waterfall Grid */}
      <div className="waterfall-container">
        <div className="waterfall-labels">
          <span>Worker #</span>
          <span>Latency & Status Code</span>
        </div>
        <div className="workers-list">
          {workers.map((w) => {
            const is500 = w.status === 500;
            const widthPercent = Math.min(100, Math.max(20, (w.latency / 120) * 100));
            return (
              <div key={w.id} className="worker-row">
                <span className="worker-id font-mono">#{String(w.id).padStart(2, '0')}</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${is500 ? 'bar-error' : 'bar-success'}`}
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="bar-label font-mono">
                      {w.latency}ms — {w.status} {w.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .attack-chart-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
        }

        .chart-title {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .chart-subtitle {
          font-size: 12px;
          color: #8b949e;
        }

        .text-cyan {
          color: #00d4ff;
        }

        .chart-stats {
          display: flex;
          gap: 8px;
        }

        .waterfall-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 12px 14px;
        }

        .waterfall-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #6e7681;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .workers-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .worker-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .worker-id {
          font-size: 10px;
          color: #8b949e;
          width: 24px;
        }

        .bar-track {
          flex: 1;
          height: 18px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding: 0 8px;
          transition: width 0.3s ease;
        }

        .bar-success {
          background: linear-gradient(90deg, rgba(46, 213, 115, 0.3), rgba(46, 213, 115, 0.6));
          border-left: 2px solid #2ed573;
        }

        .bar-error {
          background: linear-gradient(90deg, rgba(255, 71, 87, 0.4), rgba(255, 71, 87, 0.8));
          border-left: 2px solid #ff4757;
          box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
        }

        .bar-label {
          font-size: 9px;
          font-weight: 600;
          color: #ffffff;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
