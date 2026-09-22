'use client';

const STATE_COLORS = {
  IDLE: { bg: 'rgba(255, 255, 255, 0.08)', text: '#8b949e', border: 'rgba(255, 255, 255, 0.15)', dot: '#8b949e' },
  ATTACKING: { bg: 'rgba(255, 71, 87, 0.15)', text: '#ff4757', border: 'rgba(255, 71, 87, 0.4)', dot: '#ff4757' },
  RECON: { bg: 'rgba(255, 165, 2, 0.15)', text: '#ffa502', border: 'rgba(255, 165, 2, 0.4)', dot: '#ffa502' },
  PATCHING: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.4)', dot: '#a855f7' },
  VERIFYING: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)', dot: '#3b82f6' },
  RESOLVED: { bg: 'rgba(46, 213, 115, 0.15)', text: '#2ed573', border: 'rgba(46, 213, 115, 0.4)', dot: '#2ed573' },
};

export default function TopBar({
  state = 'IDLE',
  onStart,
  onReset,
  isStarting = false,
  metrics = {},
}) {
  const currentColor = STATE_COLORS[state] || STATE_COLORS.IDLE;

  return (
    <header className="topbar">
      {/* Left: Swarm State Pill */}
      <div className="state-section">
        <div
          className="state-pill"
          style={{
            background: currentColor.bg,
            color: currentColor.text,
            borderColor: currentColor.border,
          }}
        >
          <span
            className="pulse-dot"
            style={{
              background: currentColor.dot,
              boxShadow: `0 0 10px ${currentColor.dot}`,
            }}
          />
          <span className="state-name">SWARM: {state}</span>
        </div>

        <div className="target-badge">
          <span className="target-label">Target:</span>
          <span className="target-val">http://localhost:8000</span>
        </div>
      </div>

      {/* Center: Live Intelligence Telemetry */}
      <div className="telemetry-section">
        <div className="telem-item">
          <span className="telem-title">Nebius Speed</span>
          <span className="telem-value font-mono">
            {metrics.nebiusTokPerSec ? `${metrics.nebiusTokPerSec} t/s` : '148.5 t/s'}
          </span>
        </div>
        <div className="telem-divider" />
        <div className="telem-item">
          <span className="telem-title">Tavily CVEs</span>
          <span className="telem-value font-mono">
            {metrics.tavilyQueries ? `${metrics.tavilyQueries} Qs` : '12 Qs'}
          </span>
        </div>
        <div className="telem-divider" />
        <div className="telem-item">
          <span className="telem-title">MTTR Avg</span>
          <span className="telem-value font-mono">
            {metrics.mttrSeconds ? `${metrics.mttrSeconds}s` : '4.8s'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="actions-section">
        <button
          onClick={onReset}
          className="btn-secondary"
          title="Reset Canary Database & Swarm State"
        >
          ↺ Reset
        </button>

        <button
          onClick={onStart}
          disabled={isStarting || state === 'ATTACKING' || state === 'PATCHING'}
          className="btn-primary"
        >
          {state === 'ATTACKING' ? '⚡ Attacking...' : '▶ Launch Swarm'}
        </button>
      </div>

      <style jsx>{`
        .topbar {
          height: 60px;
          position: fixed;
          top: 0;
          left: 240px;
          right: 0;
          background: rgba(10, 14, 23, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 90;
          font-family: 'Inter', sans-serif;
        }

        .state-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .state-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 1.6s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }

        .target-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          background: rgba(255, 255, 255, 0.04);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .target-label {
          color: #6e7681;
        }

        .target-val {
          color: #e6edf3;
          font-family: 'JetBrains Mono', monospace;
        }

        .telemetry-section {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.02);
          padding: 6px 18px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .telem-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .telem-title {
          font-size: 9px;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .telem-value {
          font-size: 12px;
          font-weight: 600;
          color: #00d4ff;
        }

        .telem-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.08);
        }

        .actions-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #c9d1d9;
          font-size: 12px;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .btn-primary {
          background: linear-gradient(135deg, #00d4ff, #0066ff);
          border: none;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 0 16px rgba(0, 212, 255, 0.35);
          transition: all 0.2s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 24px rgba(0, 212, 255, 0.5);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>
    </header>
  );
}
