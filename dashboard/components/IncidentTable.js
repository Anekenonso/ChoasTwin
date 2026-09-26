'use client';

import { useState, useMemo } from 'react';

export default function IncidentTable({ incidents = [] }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const defaultIncidents = [
    {
      id: 'INC-2026-089',
      severity: 'CRITICAL',
      title: 'Async TOCTOU Concurrency Underflow',
      endpoint: 'POST /api/v1/inventory/reserve',
      error: 'InvariantViolation: Stock dropped to -6 under 25 concurrent workers',
      detectedAt: '2026-09-26 21:42:10',
      status: 'SELF_HEALING',
      trace: `Traceback (most recent call last):
  File "target_app/app.py", line 47, in reserve_stock
    item['stock'] -= req.quantity
AssertionError: Stock count dropped below zero (-6)
Concurrency Window: 54ms | 25 coroutines`,
      rootCause: 'Unprotected check-and-decrement across async sleep boundary',
      invariantRule: 'stock >= 0 (INVARIANT_STRICT)',
      patchAstStatus: 'SYNTHESIS_PASS (asyncio.Lock inserted)',
    },
    {
      id: 'INC-2026-088',
      severity: 'HIGH',
      title: 'Double Discount Application Glitch',
      endpoint: 'POST /api/v1/cart/apply-coupon',
      error: 'InvariantViolation: Multiple concurrent requests bypass one-time constraint',
      detectedAt: '2026-09-26 21:38:02',
      status: 'RESOLVED',
      trace: `Traceback (most recent call last):
  File "target_app/app.py", line 82, in apply_coupon
    cart['discount_applied'] = True
AssertionError: Coupon applied multiple times simultaneously`,
      rootCause: 'Shared cart state without transactional isolation',
      invariantRule: 'single_coupon_per_session == True',
      patchAstStatus: 'CERTIFIED (mutex applied, regression suite clean)',
    },
    {
      id: 'INC-2026-087',
      severity: 'MEDIUM',
      title: 'Checkout Balance Desynchronization',
      endpoint: 'POST /api/v1/billing/charge',
      error: 'StateDrift: Ledger balance differs from stripe intent receipt',
      detectedAt: '2026-09-26 21:24:19',
      status: 'RESOLVED',
      trace: `Warning: Ledger state mismatch detected in canary audit.`,
      rootCause: 'Eventual consistency race in local mock ledger',
      invariantRule: 'ledger_total == receipts_sum',
      patchAstStatus: 'CERTIFIED (idempotency key enforced)',
    }
  ];

  const list = incidents.length > 0 ? incidents : defaultIncidents;

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchSeverity = filterSeverity === 'ALL' || item.severity === filterSeverity;
      const matchSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [list, filterSeverity, searchQuery]);

  return (
    <div className="incident-table-card">
      {/* Table Header & Filter Bar */}
      <div className="table-header">
        <div>
          <div className="header-kicker font-mono">AUDIT-GRADE ANOMALY LOG</div>
          <h3 className="table-title">Detected Incidents & Invariant Breaches</h3>
          <p className="table-subtitle">Captured by Swarm Observer and filtered for actionable race conditions</p>
        </div>

        <div className="header-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Filter endpoint or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input font-mono"
            />
          </div>

          <div className="filter-pills">
            {['ALL', 'CRITICAL', 'HIGH', 'RESOLVED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterSeverity(filter)}
                className={`filter-btn font-mono ${filterSeverity === filter ? 'active' : ''}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Responsive Wrapper */}
      <div className="table-responsive">
        <table className="incident-table">
          <thead>
            <tr>
              <th>INCIDENT ID</th>
              <th>SEVERITY</th>
              <th>ENDPOINT</th>
              <th>VIOLATION / ANOMALY</th>
              <th>TIMESTAMP</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inc) => (
              <tr key={inc.id} className="table-row">
                <td className="font-mono text-cyan font-bold">{inc.id}</td>
                <td>
                  <span
                    className={`severity-badge font-mono ${
                      inc.severity === 'CRITICAL'
                        ? 'sev-crit'
                        : inc.severity === 'HIGH'
                        ? 'sev-high'
                        : 'sev-med'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </td>
                <td className="font-mono text-endpoint">{inc.endpoint}</td>
                <td className="text-anomaly">{inc.error}</td>
                <td className="font-mono text-timestamp">{inc.detectedAt}</td>
                <td>
                  <span
                    className={`status-chip font-mono ${
                      inc.status === 'RESOLVED' ? 'chip-resolved' : 'chip-healing'
                    }`}
                  >
                    <span className="chip-dot" />
                    {inc.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="inspect-btn font-mono"
                  >
                    Inspect Trace →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Inspection Drawer / Modal (Inspired by ExceptionLineage EvidenceDrawer) */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-kicker font-mono">TRACE EVIDENCE & HEURISTICS</div>
                <h2 className="drawer-title font-mono">{selectedIncident.id}</h2>
                <span className="drawer-endpoint font-mono">{selectedIncident.endpoint}</span>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="close-btn">
                ✕
              </button>
            </div>

            <div className="drawer-body">
              {/* Severity & Invariant Scope */}
              <div className="drawer-section">
                <div className="section-title">EVIDENCE SUMMARY</div>
                <div className="grid-summary">
                  <div className="summary-box">
                    <span className="sum-label font-mono">Severity</span>
                    <span className="sum-val font-mono text-rose">{selectedIncident.severity}</span>
                  </div>
                  <div className="summary-box">
                    <span className="sum-label font-mono">Invariant Rule</span>
                    <span className="sum-val font-mono">{selectedIncident.invariantRule}</span>
                  </div>
                  <div className="summary-box">
                    <span className="sum-label font-mono">AST Status</span>
                    <span className="sum-val font-mono text-emerald">{selectedIncident.patchAstStatus}</span>
                  </div>
                </div>
              </div>

              {/* Root Cause Heuristic */}
              <div className="drawer-section">
                <div className="section-title">ROOT CAUSE HEURISTIC</div>
                <div className="heuristic-box font-mono">
                  {selectedIncident.rootCause || selectedIncident.error}
                </div>
              </div>

              {/* Raw Traceback Viewer */}
              <div className="drawer-section">
                <div className="section-header-flex">
                  <span className="section-title">STACK TRACE EVIDENCE</span>
                  <span className="badge badge-rose font-mono">ASYNC CAPTURE</span>
                </div>
                <pre className="trace-box font-mono">{selectedIncident.trace}</pre>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                onClick={() => setSelectedIncident(null)}
                className="btn-done font-mono"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .incident-table-card {
          background: linear-gradient(180deg, rgba(14, 21, 36, 0.9) 0%, rgba(10, 16, 28, 0.95) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: var(--shadow-card);
          backdrop-filter: blur(16px);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .header-kicker {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.12em;
          margin-bottom: 4px;
        }

        .table-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .table-subtitle {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
        }

        .search-icon {
          font-size: 12px;
          opacity: 0.6;
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 11.5px;
          width: 170px;
        }

        .filter-pills {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          padding: 3px;
          border-radius: var(--radius-sm);
        }

        .filter-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 10.5px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-btn:hover {
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: rgba(56, 189, 248, 0.12);
          color: var(--accent-cyan);
        }

        .table-responsive {
          overflow-x: auto;
        }

        .incident-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }

        .incident-table th {
          text-align: left;
          padding: 10px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-default);
          background: rgba(8, 12, 20, 0.3);
        }

        .table-row {
          border-bottom: 1px solid var(--border-subtle);
          transition: background var(--transition-fast);
        }

        .table-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .table-row td {
          padding: 13px 14px;
          vertical-align: middle;
        }

        .text-endpoint {
          color: var(--text-secondary);
          font-size: 11.5px;
        }

        .text-anomaly {
          color: var(--text-primary);
          font-size: 12px;
          max-width: 320px;
        }

        .text-timestamp {
          color: var(--text-muted);
          font-size: 11px;
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-rose { color: var(--accent-rose); }
        .text-emerald { color: var(--accent-emerald); }

        .severity-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: var(--radius-xs);
        }

        .sev-crit {
          background: var(--accent-rose-soft);
          color: var(--accent-rose);
          border: 1px solid rgba(244, 63, 94, 0.3);
        }

        .sev-high {
          background: var(--accent-amber-soft);
          color: var(--accent-amber);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .sev-med {
          background: var(--accent-cyan-soft);
          color: var(--accent-cyan);
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: var(--radius-full);
        }

        .chip-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .chip-resolved {
          background: var(--accent-emerald-soft);
          color: var(--accent-emerald);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .chip-healing {
          background: var(--accent-purple-soft);
          color: var(--accent-purple);
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .inspect-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          padding: 5px 10px;
          border-radius: var(--radius-xs);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .inspect-btn:hover {
          background: rgba(56, 189, 248, 0.1);
          color: var(--accent-cyan);
          border-color: rgba(56, 189, 248, 0.3);
        }

        /* Slide-over Drawer */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.2s ease;
        }

        .drawer-panel {
          width: 540px;
          max-width: 90vw;
          height: 100vh;
          background: var(--bg-surface);
          border-left: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
          animation: slideIn 0.25s var(--ease-spring);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

        .drawer-header {
          padding: 24px;
          border-bottom: 1px solid var(--border-default);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: rgba(8, 12, 20, 0.5);
        }

        .drawer-kicker {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.12em;
        }

        .drawer-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .drawer-endpoint {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          cursor: pointer;
        }

        .drawer-body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .drawer-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-title {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .section-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .grid-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .summary-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sum-label {
          font-size: 10px;
          color: var(--text-muted);
        }

        .sum-val {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .heuristic-box {
          background: rgba(56, 189, 248, 0.06);
          border: 1px solid rgba(56, 189, 248, 0.2);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--accent-cyan);
          line-height: 1.5;
        }

        .trace-box {
          background: #05080e;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 14px;
          font-size: 11px;
          color: #e2e8f0;
          overflow-x: auto;
          line-height: 1.6;
        }

        .drawer-footer {
          padding: 18px 24px;
          border-top: 1px solid var(--border-default);
          display: flex;
          justify-content: flex-end;
          background: rgba(8, 12, 20, 0.5);
        }

        .btn-done {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-default);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
