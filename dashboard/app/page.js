'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@chaostwin.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="login-container">
      {/* Left Column: Visual Branding & Swarm Graphic */}
      <div className="visual-panel">
        <div className="branding-top">
          <div className="logo-badge">⚡</div>
          <div className="brand-name">
            <span className="brand-primary">CHAOSTWIN</span>
            <span className="brand-sub">AUTONOMOUS ADVERSARIAL SWARM</span>
          </div>
        </div>

        <div className="visual-hero">
          <div className="neural-graphic">
            <div className="graphic-ring ring-1" />
            <div className="graphic-ring ring-2" />
            <div className="graphic-ring ring-3" />
            <div className="graphic-core">
              <span className="core-icon">⚡</span>
              <span className="core-text font-mono">SWARM ENGINE</span>
            </div>
          </div>

          <div className="hero-text">
            <h2>Self-Healing Autonomous QA for Next-Gen Distributed Systems</h2>
            <p>
              Harness concurrent fuzzer swarms, real-time invariant telemetry, and
              Nebius DeepSeek-R1 self-healing patches to eliminate race conditions before production.
            </p>
          </div>

          <div className="hackathon-badge">
            <span>Powered by</span>
            <strong className="text-cyan">Nebius AI Studio</strong>
            <span>&</span>
            <strong className="text-green">NVIDIA Token Factory</strong>
          </div>
        </div>

        <div className="visual-footer">
          <span>v1.0.0-hackathon</span>
          <span>•</span>
          <span>Zero Configuration Canary</span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="form-panel">
        <div className="form-card">
          <div className="form-header">
            <h3>Enterprise Sign In</h3>
            <p>Access your adversarial swarm control center</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#" className="forgot-link">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-signin">
              {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
            </button>
          </form>

          <div className="divider">
            <span>OR INSTANT PREVIEW</span>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="btn-demo"
          >
            ⚡ Enter Swarm Dashboard as Judge / Guest
          </button>

          <div className="social-row">
            <button className="social-btn">
              <span>GitHub SSO</span>
            </button>
            <button className="social-btn">
              <span>Google SSO</span>
            </button>
          </div>

          <p className="terms-note">
            By accessing the swarm you agree to sandboxed adversarial stress testing policies.
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          background: #070a10;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
        }

        /* Left Visual Panel */
        .visual-panel {
          flex: 1.1;
          background: radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.08) 0%, transparent 60%),
                      radial-gradient(circle at 80% 80%, rgba(0, 102, 255, 0.06) 0%, transparent 60%),
                      #0a0e17;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .branding-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-badge {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: linear-gradient(135deg, #00d4ff, #0066ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        }

        .brand-name {
          display: flex;
          flex-direction: column;
        }

        .brand-primary {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .brand-sub {
          font-size: 10px;
          color: #00d4ff;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .visual-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 540px;
          margin: 0 auto;
          gap: 28px;
        }

        .neural-graphic {
          width: 220px;
          height: 220px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .graphic-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(0, 212, 255, 0.25);
        }

        .ring-1 {
          width: 100%;
          height: 100%;
          animation: spin 30s linear infinite;
        }

        .ring-2 {
          width: 75%;
          height: 75%;
          border: 1px solid rgba(0, 102, 255, 0.3);
          animation: spin 20s linear infinite reverse;
        }

        .ring-3 {
          width: 50%;
          height: 50%;
          border: 1px dashed rgba(46, 213, 115, 0.3);
        }

        .graphic-core {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, rgba(0, 102, 255, 0.1) 100%);
          border: 1px solid rgba(0, 212, 255, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
        }

        .core-icon {
          font-size: 24px;
        }

        .core-text {
          font-size: 7px;
          color: #00d4ff;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-text h2 {
          font-size: 24px;
          font-weight: 700;
          line-height: 1.35;
          color: #ffffff;
        }

        .hero-text p {
          font-size: 14px;
          color: #8b949e;
          line-height: 1.6;
          margin-top: 10px;
        }

        .hackathon-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 12px;
          color: #c9d1d9;
        }

        .text-cyan { color: #00d4ff; }
        .text-green { color: #2ed573; }

        .visual-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: #484f58;
        }

        /* Right Form Panel */
        .form-panel {
          flex: 0.9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #080c14;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 36px 32px;
          backdrop-filter: blur(20px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .form-header p {
          font-size: 13px;
          color: #8b949e;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 12px;
          font-weight: 500;
          color: #c9d1d9;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 11px;
          color: #00d4ff;
          text-decoration: none;
        }

        .input-group input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 14px;
          color: #ffffff;
          font-size: 13px;
          transition: all 0.15s ease;
        }

        .input-group input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 12px rgba(0, 212, 255, 0.25);
          background: rgba(255, 255, 255, 0.07);
        }

        .btn-signin {
          background: linear-gradient(135deg, #00d4ff, #0066ff);
          border: none;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 6px;
          box-shadow: 0 0 18px rgba(0, 212, 255, 0.35);
          transition: all 0.2s ease;
        }

        .btn-signin:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 26px rgba(0, 212, 255, 0.5);
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #484f58;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.8px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .divider span {
          padding: 0 10px;
        }

        .btn-demo {
          background: rgba(0, 212, 255, 0.08);
          border: 1px solid rgba(0, 212, 255, 0.3);
          color: #00d4ff;
          font-size: 12px;
          font-weight: 600;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-demo:hover {
          background: rgba(0, 212, 255, 0.16);
          border-color: #00d4ff;
        }

        .social-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .social-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #c9d1d9;
          font-size: 12px;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .social-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
        }

        .terms-note {
          font-size: 11px;
          color: #6e7681;
          text-align: center;
          line-height: 1.4;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
