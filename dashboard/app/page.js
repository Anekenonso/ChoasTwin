'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RootLandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@chaostwin.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  const handleDirectLaunch = () => {
    router.push('/dashboard');
  };

  return (
    <div className="landing-shell">
      {/* Top Sticky Header */}
      <header className="landing-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="brand-icon">⚡</div>
            <div className="brand-text">
              <span className="brand-title">CHAOSTWIN</span>
              <span className="brand-sub font-mono">AUTONOMOUS ADVERSARIAL SWARM</span>
            </div>
          </div>

          <div className="header-actions">
            <div className="status-pill font-mono">
              <span className="pulse-indicator" style={{ background: 'var(--accent-emerald)' }} />
              <span>Canary Service Live (:8000)</span>
            </div>

            <button onClick={() => setShowAuthModal(true)} className="btn-signin-ghost font-mono">
              Sign In
            </button>

            <button onClick={handleDirectLaunch} className="btn-launch-primary font-mono">
              <span>Launch Dashboard</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Operational Portal */}
      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="kicker-tag font-mono">
            <span>RESILIENCE VERIFICATION ENGINE</span>
          </div>

          <h1 className="hero-heading">
            Eliminate API race conditions
            <span className="hero-gradient-sub">before they hit production.</span>
          </h1>

          <p className="hero-subtext">
            ChaosTwin unleashes concurrent fuzzer swarms against sandboxed canaries, captures microsecond state invariant violations, and autonomously synthesizes verified AST mutex patches using Nebius DeepSeek-R1.
          </p>

          <div className="hero-cta-row">
            <button onClick={handleDirectLaunch} className="cta-primary-btn font-mono">
              <span>⚡ Enter Swarm Dashboard as Judge / Guest</span>
              <span>→</span>
            </button>

            <button onClick={() => setShowAuthModal(true)} className="cta-secondary-btn font-mono">
              <span>🔐 Enterprise SSO Credentials</span>
            </button>
          </div>
        </section>

        {/* Operational Overview Metrics (Inspired by ExceptionLineage) */}
        <section className="metrics-banner">
          <div className="metric-box">
            <span className="metric-label font-mono">TOTAL CONCURRENCY BURSTS</span>
            <span className="metric-num font-mono text-cyan">1,420+</span>
            <span className="metric-sub">Across 25 async coroutines</span>
          </div>

          <div className="metric-divider" />

          <div className="metric-box">
            <span className="metric-label font-mono">CRITICAL RACE BREACHES</span>
            <span className="metric-num font-mono text-rose">18</span>
            <span className="metric-sub">Inventory underflows prevented</span>
          </div>

          <div className="metric-divider" />

          <div className="metric-box">
            <span className="metric-label font-mono">MEAN TIME TO REPAIR (MTTR)</span>
            <span className="metric-num font-mono text-emerald">4.8s</span>
            <span className="metric-sub">-65% vs human intervention</span>
          </div>

          <div className="metric-divider" />

          <div className="metric-box">
            <span className="metric-label font-mono">REGRESSION CERTIFICATION</span>
            <span className="metric-num font-mono text-purple">100%</span>
            <span className="metric-sub">Pytest & adversarial re-fuzz</span>
          </div>
        </section>

        {/* Authority Architecture Separation Card */}
        <section className="architecture-grid">
          <div className="arch-card">
            <div className="arch-header">
              <span className="arch-badge font-mono badge-purple">AI / LLM SYNTHESIS DOMAIN</span>
              <h3 className="arch-title">Adversarial Exploration & Synthesis</h3>
            </div>
            <ul className="arch-list font-mono">
              <li>• Concurrent fuzz bursts via <code className="code-inline">asyncio.gather</code></li>
              <li>• Invariant filter dropping benign 4xx anomalies</li>
              <li>• Tavily CVE intelligence query enrichment</li>
              <li>• Nebius DeepSeek-R1 anti-lazy AST code generation</li>
            </ul>
          </div>

          <div className="arch-card">
            <div className="arch-header">
              <span className="arch-badge font-mono badge-emerald">DETERMINISTIC CODE DOMAIN</span>
              <h3 className="arch-title">Deterministic Verification & Authority</h3>
            </div>
            <ul className="arch-list font-mono">
              <li>• Hard assertion invariant calculation (<code className="code-inline">assert stock &gt;= 0</code>)</li>
              <li>• AST structural validation (guarantees zero no-op / pass)</li>
              <li>• Pytest regression suite audit (<code className="code-inline">test_target.py</code>)</li>
              <li>• Adversarial 25-burst re-fuzz exploit resistance certification</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner font-mono">
          <span>ChaosTwin v1.0.0-hackathon</span>
          <span>•</span>
          <span>Powered by Nebius AI Studio & NVIDIA Token Factory</span>
          <span>•</span>
          <span>Zero Configuration Canary</span>
        </div>
      </footer>

      {/* Auth Modal / Enterprise Sign In */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div className="modal-brand">
                <span className="brand-icon-sm">⚡</span>
                <span className="font-mono font-bold">CHAOSTWIN ENTERPRISE</span>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="modal-close">✕</button>
            </div>

            <div className="modal-header">
              <h3>Enterprise Swarm Sign In</h3>
              <p>Access your isolated canary cluster control center</p>
            </div>

            <form onSubmit={handleLogin} className="modal-form">
              <div className="input-group">
                <label className="font-mono">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <div className="label-between">
                  <label className="font-mono">Password</label>
                  <a href="#" className="font-mono forgot-link">Forgot?</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-modal-submit font-mono">
                {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
              </button>
            </form>

            <div className="modal-divider font-mono">
              <span>OR INSTANT JUDGE PREVIEW</span>
            </div>

            <button
              onClick={() => {
                setShowAuthModal(false);
                router.push('/dashboard');
              }}
              className="btn-guest-preview font-mono"
            >
              ⚡ Enter as Judge / Guest (No Login Required)
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .landing-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-canvas);
          color: var(--text-primary);
        }

        /* Top Header */
        .landing-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(8, 12, 20, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-default);
          height: var(--header-height);
        }

        .header-inner {
          max-width: 1280px;
          margin: 0 auto;
          height: 100%;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
          font-size: 15px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #ffffff;
        }

        .brand-sub {
          font-size: 9px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.12em;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: 11px;
          color: var(--text-secondary);
        }

        .btn-signin-ghost {
          background: transparent;
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          padding: 6px 14px;
          border-radius: var(--radius-sm);
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-signin-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .btn-launch-primary {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #ffffff;
          padding: 6px 16px;
          border-radius: var(--radius-sm);
          font-size: 11.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
          transition: all var(--transition-fast);
        }

        .btn-launch-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        /* Main Content */
        .landing-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 48px;
          flex: 1;
        }

        /* Hero */
        .hero-section {
          text-align: center;
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .kicker-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: var(--accent-cyan);
          background: var(--accent-cyan-soft);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 4px 14px;
          border-radius: var(--radius-full);
        }

        .hero-heading {
          font-size: 46px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: var(--text-primary);
        }

        .hero-gradient-sub {
          display: block;
          background: linear-gradient(90deg, #38bdf8 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          margin-top: 4px;
        }

        .hero-subtext {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.65;
          max-width: 720px;
          margin-top: 4px;
        }

        .hero-cta-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .cta-primary-btn {
          background: linear-gradient(135deg, #0284c7 0%, #3b82f6 100%);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
          transition: all var(--transition-fast);
        }

        .cta-primary-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.5);
        }

        .cta-secondary-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          padding: 12px 20px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .cta-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        /* Metrics Banner */
        .metrics-banner {
          background: linear-gradient(180deg, rgba(14, 21, 36, 0.9) 0%, rgba(10, 16, 28, 0.95) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow-card);
          backdrop-filter: blur(14px);
          flex-wrap: wrap;
          gap: 20px;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .metric-num {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .metric-sub {
          font-size: 11.5px;
          color: var(--text-secondary);
        }

        .metric-divider {
          width: 1px;
          height: 48px;
          background: var(--border-default);
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-rose { color: var(--accent-rose); }
        .text-emerald { color: var(--accent-emerald); }
        .text-purple { color: var(--accent-purple); }

        /* Architecture Grid */
        .architecture-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 20px;
        }

        .arch-card {
          background: linear-gradient(180deg, rgba(14, 21, 36, 0.8) 0%, rgba(10, 16, 28, 0.85) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: var(--shadow-card);
        }

        .arch-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .arch-badge {
          align-self: flex-start;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .arch-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .arch-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .code-inline {
          background: rgba(255, 255, 255, 0.05);
          color: var(--accent-cyan);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }

        /* Footer */
        .landing-footer {
          border-top: 1px solid var(--border-subtle);
          padding: 24px;
          background: rgba(8, 12, 20, 0.6);
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          gap: 16px;
          font-size: 11px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        /* Auth Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .modal-card {
          width: 420px;
          max-width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: var(--shadow-elevated);
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-primary);
        }

        .brand-icon-sm {
          color: var(--accent-cyan);
        }

        .modal-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-header p {
          font-size: 12.5px;
          color: var(--text-secondary);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .label-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 11px;
          color: var(--accent-cyan);
          text-decoration: none;
        }

        .input-group input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
        }

        .input-group input:focus {
          border-color: var(--border-glow-cyan);
        }

        .btn-modal-submit {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #ffffff;
          padding: 10px;
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 4px;
        }

        .modal-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: var(--text-muted);
          position: relative;
        }

        .btn-guest-preview {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-default);
          color: var(--accent-cyan);
          padding: 10px;
          border-radius: var(--radius-sm);
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-guest-preview:hover {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.3);
        }

        @media (max-width: 768px) {
          .hero-heading {
            font-size: 32px;
          }
          .metric-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
