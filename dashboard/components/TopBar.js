'use client';

const STATE_CONFIG = {
  IDLE: { label: 'IDLE', bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-secondary)', border: 'var(--border-subtle)', dot: '#94a3b8' },
  ATTACKING: { label: 'ATTACKING', bg: 'var(--accent-rose-soft)', text: 'var(--accent-rose)', border: 'rgba(244, 63, 94, 0.3)', dot: 'var(--accent-rose)' },
  RECON: { label: 'RECON', bg: 'var(--accent-amber-soft)', text: 'var(--accent-amber)', border: 'rgba(245, 158, 11, 0.3)', dot: 'var(--accent-amber)' },
  PATCHING: { label: 'PATCHING', bg: 'var(--accent-purple-soft)', text: 'var(--accent-purple)', border: 'rgba(168, 85, 247, 0.3)', dot: 'var(--accent-purple)' },
  VERIFYING: { label: 'VERIFYING', bg: 'var(--accent-cyan-soft)', text: 'var(--accent-cyan)', border: 'rgba(56, 189, 248, 0.3)', dot: 'var(--accent-cyan)' },
  RESOLVED: { label: 'RESOLVED', bg: 'var(--accent-emerald-soft)', text: 'var(--accent-emerald)', border: 'rgba(16, 185, 129, 0.3)', dot: 'var(--accent-emerald)' },
};

export default function TopBar({
  state = 'IDLE',
  onStart,
  onReset,
  isStarting = false,
  metrics = {},
}) {
  const current = STATE_CONFIG[state] || STATE_CONFIG.IDLE;

  return (
    <header className="topbar">
      {/* Left: Swarm State Pill & Target */}
      <div className="state-section">
        <div
          className="state-pill"
          style={{
            background: current.bg,
            color: current.text,
            borderColor: current.border,
          }}
        >
          <span
            className="pulse-dot"
            style={{
              background: current.dot,
              boxShadow: `0 0 8px ${current.dot}`,
            }}
          />
          <span className="state-name font-mono">SWARM: {current.label}</span>
        </div>

        <div className="target-badge">
          <span className="target-label">Target Canary:</span>
          <span className="target-val font-mono">http://localhost:8000</span>
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
          <span className="telem-value font-mono text-emerald">
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
          <span>↺</span>
          <span>Reset Canary</span>
        </button>

        <button
          onClick={onStart}
          disabled={isStarting || state === 'ATTACKING' || state === 'PATCHING'}
          className="btn-primary"
        >
          {state === 'ATTACKING' ? (
            <>
              <span className="spin">⚡</span>
              <span>Attacking...</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>Launch Swarm</span>
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .topbar {
          height: var(--header-height);
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          background: var(--bg-header);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 90;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .state-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .state-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          border-radius: var(--radius-full);
          border: 1px solid;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .target-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 11.5px;
        }

        .target-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .target-val {
          color: var(--accent-cyan);
          font-weight: 600;
        }

        .telemetry-section {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(14, 21, 36, 0.7);
          border: 1px solid var(--border-subtle);
          padding: 5px 16px;
          border-radius: var(--radius-full);
        }

        .telem-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .telem-title {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .telem-value {
          font-size: 11.5px;
          color: var(--text-primary);
          font-weight: 700;
        }

        .text-emerald {
          color: var(--accent-emerald);
        }

        .telem-divider {
          width: 1px;
          height: 12px;
          background: var(--border-default);
        }

        .actions-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          padding: 7px 14px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #ffffff;
          padding: 7px 16px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
          transition: all var(--transition-fast);
        }

        .btn-primary:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .spin {
          animation: spin 1s infinite linear;
          display: inline-block;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1100px) {
          .telemetry-section {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
