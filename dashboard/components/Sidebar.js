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
        <div className="brand-mark">
          <span className="brand-bolt">⚡</span>
        </div>
        <div className="brand-text">
          <span className="brand-title">CHAOSTWIN</span>
          <span className="brand-sub font-mono">AUTONOMOUS SWARM</span>
        </div>
      </div>

      {/* Nav Section Label */}
      <div className="nav-label-row">
        <span className="nav-kicker">CONTROL CENTER</span>
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
              {isActive && <span className="active-dot" />}
            </Link>
          );
        })}
      </nav>

      {/* System Health / Footer */}
      <div className="sidebar-footer">
        <div className="status-box">
          <div className="status-row">
            <span
              className={`status-dot ${
                connectionStatus === 'connected' ? 'dot-live' : 'dot-sim'
              }`}
            />
            <span className="status-title font-mono">
              {connectionStatus === 'connected' ? 'ORCHESTRATOR LIVE' : 'ORCHESTRATOR STANDBY'}
            </span>
          </div>

          <div className="specs-list font-mono">
            <div className="spec-item">
              <span className="spec-label">PORT:</span>
              <span className="spec-val text-cyan">:8001 / :8000</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">MODEL:</span>
              <span className="spec-val text-purple">DeepSeek-R1</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">FUZZER:</span>
              <span className="spec-val text-emerald">25 Concurrency</span>
            </div>
          </div>
        </div>

        <Link href="/" className="exit-link">
          <span>Exit to Portal</span>
          <span className="font-mono">→</span>
        </Link>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          min-width: var(--sidebar-width);
          height: 100vh;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
          box-shadow: 2px 0 16px rgba(0, 0, 0, 0.35);
        }

        .sidebar-brand {
          height: var(--header-height);
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(8, 12, 20, 0.4);
        }

        .brand-mark {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .brand-bolt {
          font-size: 16px;
          filter: drop-shadow(0 0 4px #ffffff);
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
          line-height: 1.1;
        }

        .brand-sub {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-cyan);
          margin-top: 3px;
        }

        .nav-label-row {
          padding: 20px 20px 8px;
        }

        .nav-kicker {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--text-muted);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
          flex: 1;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 12.5px;
          font-weight: 600;
          transition: all var(--transition-fast);
          position: relative;
        }

        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
        }

        .sidebar-link.active {
          background: rgba(56, 189, 248, 0.08);
          color: var(--accent-cyan);
          border: 1px solid rgba(56, 189, 248, 0.2);
        }

        .nav-icon {
          font-size: 14px;
          width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          flex: 1;
        }

        .active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-cyan);
          box-shadow: 0 0 8px var(--accent-cyan);
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(8, 12, 20, 0.5);
        }

        .status-box {
          background: rgba(14, 21, 36, 0.9);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .dot-live {
          background: var(--accent-emerald);
          box-shadow: 0 0 8px var(--accent-emerald);
        }

        .dot-sim {
          background: var(--accent-amber);
          box-shadow: 0 0 8px var(--accent-amber);
        }

        .status-title {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .specs-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 10px;
          padding-top: 6px;
          border-top: 1px solid var(--border-subtle);
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
        }

        .spec-label {
          color: var(--text-muted);
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-purple { color: var(--accent-purple); }
        .text-emerald { color: var(--accent-emerald); }

        .exit-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 11.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .exit-link:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
        }
      `}</style>
    </aside>
  );
}
