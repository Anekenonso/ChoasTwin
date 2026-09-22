'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: '⚡' },
  { label: 'Live Attacks', href: '/dashboard/attacks', icon: '💥' },
  { label: 'Patches & Recon', href: '/dashboard/patches', icon: '🛠️' },
  { label: 'Verification', href: '/dashboard/verify', icon: '🛡️' },
  { label: 'Resolved Incidents', href: '/dashboard/resolved', icon: '📋' },
  { label: 'Swarm Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function Sidebar({ connectionStatus = 'connected' }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">⚡</div>
        <div className="brand-text">
          <span className="brand-title">CHAOSTWIN</span>
          <span className="brand-badge">NEBIUS × NVIDIA</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="sidebar-footer">
        <div className="status-box">
          <div className="status-indicator">
            <span
              className={`status-dot ${
                connectionStatus === 'connected' ? 'dot-live' : 'dot-sim'
              }`}
            />
            <span className="status-label">
              {connectionStatus === 'connected' ? 'Engine Live (8001)' : 'Engine Standby'}
            </span>
          </div>
          <div className="model-chip">
            <span className="chip-label">LLM:</span>
            <span className="chip-value">DeepSeek-R1</span>
          </div>
        </div>

        <Link href="/" className="logout-btn">
          <span>Sign Out</span>
          <span>→</span>
        </Link>
      </div>

      <style jsx>{`
        .sidebar {
          width: 240px;
          min-width: 240px;
          height: 100vh;
          background: #090d16;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
          font-family: 'Inter', sans-serif;
        }

        .sidebar-brand {
          padding: 20px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00d4ff, #0066ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 16px rgba(0, 212, 255, 0.35);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #ffffff;
        }

        .brand-badge {
          font-size: 9px;
          font-weight: 600;
          color: #00d4ff;
          letter-spacing: 0.8px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          color: #8b949e;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .sidebar-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-link.active {
          color: #00d4ff;
          background: rgba(0, 212, 255, 0.1);
          border-left: 3px solid #00d4ff;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 16px;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-live {
          background: #2ed573;
          box-shadow: 0 0 8px #2ed573;
        }

        .dot-sim {
          background: #ffa502;
          box-shadow: 0 0 8px #ffa502;
        }

        .status-label {
          font-size: 11px;
          color: #c9d1d9;
          font-weight: 500;
        }

        .model-chip {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
        }

        .chip-label {
          color: #6e7681;
        }

        .chip-value {
          color: #00d4ff;
          font-weight: 600;
        }

        .logout-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          font-size: 12px;
          color: #8b949e;
          text-decoration: none;
          border-radius: 6px;
          transition: 0.15s ease;
        }

        .logout-btn:hover {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.08);
        }
      `}</style>
    </aside>
  );
}
