'use client';

const STATE_CONFIG = {
  IDLE: { label: 'STANDBY', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)', dot: '#94a3b8' },
  ATTACKING: { label: 'CONCURRENCY FUZZING', color: 'var(--accent-rose)', bg: 'var(--accent-rose-soft)', dot: 'var(--accent-rose)' },
  RECON: { label: 'INVARIANT FILTER RECON', color: 'var(--accent-amber)', bg: 'var(--accent-amber-soft)', dot: 'var(--accent-amber)' },
  PATCHING: { label: 'DEEPSEEK-R1 SYNTHESIS', color: 'var(--accent-purple)', bg: 'var(--accent-purple-soft)', dot: 'var(--accent-purple)' },
  VERIFYING: { label: '2-STAGE CERTIFICATION', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-soft)', dot: 'var(--accent-cyan)' },
  RESOLVED: { label: 'ZERO-RACE CERTIFIED', color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-soft)', dot: 'var(--accent-emerald)' },
};

export default function AuthorityBanner({ state = 'IDLE', targetService = 'FastAPI Canary Cluster (:8000)' }) {
  const current = STATE_CONFIG[state] || STATE_CONFIG.IDLE;

  return (
    <div className="authority-banner">
      <div className="banner-glow" />
      
      <div className="banner-content">
        {/* Left Column: Architectural Boundary */}
        <div className="banner-left">
          <div className="kicker-row">
            <span className="kicker">CANARY RESILIENCE BOUNDARY</span>
            <span className="boundary-divider">•</span>
            <span className="boundary-rule">AI fuzzes & heals. Deterministic code certifies.</span>
          </div>

          <h1 className="banner-title">
            Target Service: <span className="highlight-text">{targetService}</span>
          </h1>

          <p className="banner-desc">
            Adversarial swarm executes concurrent <code className="code-pill">asyncio.gather</code> race-condition bursts.
            When an invariant fails, Nebius DeepSeek-R1 synthesizes verified AST mutex patches under 5 seconds.
          </p>
        </div>

        {/* Right Column: Real-time Operational State */}
        <div className="banner-right">
          <div className="state-card">
            <div className="state-card-header">
              <span className="state-micro-label">PIPELINE PHASE</span>
              <span className="engine-ping font-mono">Engine :8001</span>
            </div>

            <div
              className="state-pill"
              style={{
                background: current.bg,
                borderColor: current.color,
                color: current.color,
              }}
            >
              <span
                className="state-dot"
                style={{
                  background: current.dot,
                  boxShadow: `0 0 10px ${current.dot}`,
                }}
              />
              <span className="font-mono state-text">{current.label}</span>
            </div>

            <div className="state-foot font-mono">
              <span>CANARY ISOLATION:</span>
              <strong className="text-emerald">ENFORCED</strong>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .authority-banner {
          position: relative;
          background: linear-gradient(135deg, rgba(14, 21, 36, 0.95) 0%, rgba(20, 30, 50, 0.8) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          overflow: hidden;
          box-shadow: var(--shadow-card);
          backdrop-filter: blur(16px);
        }

        .banner-glow {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 240px;
          height: 180px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .banner-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          z-index: 2;
        }

        .banner-left {
          flex: 1 1 540px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .kicker-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .boundary-divider {
          color: var(--text-faint);
          font-size: 12px;
        }

        .boundary-rule {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .banner-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .highlight-text {
          color: var(--accent-cyan);
          text-shadow: 0 0 20px rgba(56, 189, 248, 0.25);
        }

        .banner-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 680px;
        }

        .code-pill {
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          color: var(--accent-cyan);
          font-size: 12px;
          border: 1px solid var(--border-subtle);
        }

        .banner-right {
          flex: 0 0 auto;
        }

        .state-card {
          background: rgba(9, 14, 26, 0.85);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 240px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        }

        .state-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .state-micro-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.12em;
        }

        .engine-ping {
          font-size: 11px;
          color: var(--accent-cyan);
        }

        .state-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          border: 1px solid;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .state-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .state-foot {
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          padding-top: 8px;
        }

        .text-emerald {
          color: var(--accent-emerald);
        }

        @media (max-width: 900px) {
          .banner-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .state-card {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
