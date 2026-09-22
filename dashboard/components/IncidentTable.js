'use client';

import { useState } from 'react';

export default function IncidentTable({ incidents = [] }) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const defaultIncidents = [
    {
      id: 'INC-2026-089',
      severity: 'CRITICAL',
      title: 'Race Condition in Inventory Reserve',
      endpoint: 'POST /api/v1/inventory/reserve',
      error: 'InvariantViolation: Stock dropped to -6 under 25 concurrent workers',
      detectedAt: '2026-09-22 12:54:10',
      status: 'SELF_HEALING',
      trace: `Traceback (most recent call last):
  File "target_app/app.py", line 47, in reserve_stock
    item['stock'] -= req.quantity
AssertionError: Stock count dropped below zero (-6)`
    },
    {
      id: 'INC-2026-088',
      severity: 'HIGH',
      title: 'Double Discount Application Glitch',
      endpoint: 'POST /api/v1/cart/apply-coupon',
      error: 'InvariantViolation: Multiple concurrent requests bypass one-time constraint',
      detectedAt: '2026-09-22 12:50:02',
      status: 'RESOLVED',
      trace: `Cart validation bypassed during async await window`
    }
  ];

  const list = incidents.length > 0 ? incidents : defaultIncidents;

  return (
    <div className="incident-table-card">
      <div className="table-header">
        <div>
          <h3 className="table-title">Detected Incidents & Invariant Breaches</h3>
          <p className="table-subtitle">Captured by Swarm Observer & Invariant Filter</p>
        </div>
        <span className="badge badge-error font-mono">{list.length} Tracked</span>
      </div>

      <div className="table-responsive">
        <table className="incident-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Severity</th>
              <th>Endpoint</th>
              <th>Anomaly / Violation</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((inc) => (
              <tr key={inc.id}>
                <td className="font-mono text-cyan font-bold">{inc.id}</td>
                <td>
                  <span
                    className={`severity-badge ${
                      inc.severity === 'CRITICAL' ? 'sev-crit' : 'sev-high'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </td>
                <td className="font-mono">{inc.endpoint}</td>
                <td className="text-secondary">{inc.error}</td>
                <td className="font-mono text-muted text-xs">{inc.detectedAt}</td>
                <td>
                  <span
                    className={`status-chip ${
                      inc.status === 'RESOLVED' ? 'chip-resolved' : 'chip-healing'
                    }`}
                  >
                    {inc.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="inspect-btn"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal / Drawer for Inspection */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h4 className="modal-title font-mono text-cyan">
                  {selectedIncident.id} — {selectedIncident.title}
                </h4>
                <div className="modal-subtitle">{selectedIncident.endpoint}</div>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedIncident(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="meta-grid">
                <div>
                  <span className="meta-label">Severity</span>
                  <div className="meta-val text-red font-bold">{selectedIncident.severity}</div>
                </div>
                <div>
                  <span className="meta-label">Status</span>
                  <div className="meta-val text-green font-bold">{selectedIncident.status}</div>
                </div>
                <div>
                  <span className="meta-label">Captured At</span>
                  <div className="meta-val font-mono">{selectedIncident.detectedAt}</div>
                </div>
              </div>

              <div className="trace-section">
                <span className="meta-label">Raw Telemetry & Stack Trace</span>
                <pre className="trace-box font-mono">{selectedIncident.trace}</pre>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-close"
                onClick={() => setSelectedIncident(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .incident-table-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-title {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .table-subtitle {
          font-size: 12px;
          color: #8b949e;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .incident-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          text-align: left;
        }

        .incident-table th {
          padding: 10px 12px;
          color: #8b949e;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .incident-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #e6edf3;
        }

        .text-cyan { color: #00d4ff; }
        .text-red { color: #ff4757; }
        .text-green { color: #2ed573; }
        .text-secondary { color: #8b949e; }
        .text-muted { color: #6e7681; }
        .text-xs { font-size: 11px; }

        .severity-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .sev-crit {
          background: rgba(255, 71, 87, 0.2);
          color: #ff4757;
          border: 1px solid rgba(255, 71, 87, 0.4);
        }

        .sev-high {
          background: rgba(255, 165, 2, 0.2);
          color: #ffa502;
          border: 1px solid rgba(255, 165, 2, 0.4);
        }

        .status-chip {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 9999px;
        }

        .chip-resolved {
          background: rgba(46, 213, 115, 0.15);
          color: #2ed573;
          border: 1px solid rgba(46, 213, 115, 0.3);
        }

        .chip-healing {
          background: rgba(0, 212, 255, 0.15);
          color: #00d4ff;
          border: 1px solid rgba(0, 212, 255, 0.3);
          animation: pulse 1.6s infinite;
        }

        .inspect-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #c9d1d9;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .inspect-btn:hover {
          background: rgba(0, 212, 255, 0.15);
          color: #00d4ff;
          border-color: #00d4ff;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-box {
          background: #0d1117;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 14px;
        }

        .modal-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .modal-subtitle {
          font-size: 12px;
          color: #8b949e;
        }

        .close-btn {
          background: none;
          border: none;
          color: #8b949e;
          font-size: 18px;
          cursor: pointer;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          padding: 12px;
          border-radius: 8px;
        }

        .meta-label {
          font-size: 10px;
          color: #6e7681;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }

        .meta-val {
          font-size: 12px;
        }

        .trace-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .trace-box {
          background: #06090e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px;
          font-size: 11px;
          color: #ff7b72;
          overflow-x: auto;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .btn-close {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
