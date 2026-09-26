'use client';

import { useSwarm } from '../../components/SwarmContext';
import AuthorityBanner from '../../components/AuthorityBanner';
import KPICard from '../../components/KPICard';
import AttackChart from '../../components/AttackChart';
import DiffViewer from '../../components/DiffViewer';
import VerificationPanel from '../../components/VerificationPanel';
import IncidentTable from '../../components/IncidentTable';

export default function DashboardOverview() {
  const swarm = useSwarm();

  return (
    <div className="overview-container">
      {/* Top Banner: Authority Boundary Banner (ExceptionLineage-inspired) */}
      <AuthorityBanner state={swarm.state} />

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <KPICard
          title="Attacks Executed"
          value={swarm.metrics?.totalAttacks || 142}
          subtitle="Concurrent fuzz bursts"
          trend="+18%"
          trendType="neutral"
          icon="⚡"
          accent="cyan"
        />
        <KPICard
          title="Invariant Breaches"
          value={swarm.metrics?.breachCount || 18}
          subtitle="Stock dropped < 0"
          trend="Critical"
          trendType="negative"
          icon="🚨"
          accent="red"
        />
        <KPICard
          title="Mean Time To Repair"
          value={`${swarm.metrics?.mttrSeconds || 4.8}s`}
          subtitle="Attack-to-patch cycle"
          trend="-65% vs human"
          trendType="positive"
          icon="⏱️"
          accent="green"
        />
        <KPICard
          title="Nebius Throughput"
          value={`${swarm.metrics?.nebiusTokPerSec || 148.5} t/s`}
          subtitle="DeepSeek-R1 Token Factory"
          trend="NVIDIA H100"
          trendType="positive"
          icon="🚀"
          accent="purple"
        />
      </div>

      {/* Main Grid: Left (Attacks & Diff) + Right (Verification & Live Trace) */}
      <div className="main-content-grid">
        <div className="content-left">
          {/* Live Attack Waterfall */}
          <AttackChart
            currentAttack={swarm.currentAttack}
            recentAttacks={swarm.recentAttacks}
          />

          {/* Active Patch & Diff Viewer */}
          <DiffViewer patch={swarm.latestPatch} />
        </div>

        <div className="content-right">
          {/* Verification Panel */}
          <VerificationPanel verification={swarm.verification} />

          {/* Chronological Swarm Activity Trace (Inspired by ExceptionLineage InvestigationActivityTrace) */}
          <div className="event-stream-card">
            <div className="stream-header">
              <div>
                <div className="stream-kicker font-mono">CHRONOLOGICAL AUDIT TRACE</div>
                <h3 className="stream-title">Swarm Event Telemetry Stream</h3>
                <p className="stream-sub">Real-time WebSocket feed from engine:8001</p>
              </div>
              <span className="badge badge-cyan font-mono">LIVE FEED</span>
            </div>

            <div className="stream-timeline">
              {swarm.events?.length > 0 ? (
                swarm.events.map((ev, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-node">
                      <span className="node-dot" />
                      {i < swarm.events.length - 1 && <span className="node-line" />}
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className="timeline-phase font-mono">[{ev.state}]</span>
                        <span className="timeline-time font-mono">{ev.timestamp}</span>
                      </div>
                      <div className="timeline-msg">{ev.message}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="stream-empty font-mono">
                  <span>Waiting for swarm trigger... (Click Launch Swarm)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Width: Incident & Anomaly Table */}
      <div className="incidents-section">
        <IncidentTable incidents={swarm.incidents} />
      </div>

      <style jsx>{`
        .overview-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        .main-content-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
        }

        .content-left, .content-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Activity Trace Card */
        .event-stream-card {
          background: linear-gradient(180deg, rgba(14, 21, 36, 0.9) 0%, rgba(10, 16, 28, 0.95) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: var(--shadow-card);
          backdrop-filter: blur(16px);
        }

        .stream-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 14px;
        }

        .stream-kicker {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.12em;
          margin-bottom: 4px;
        }

        .stream-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stream-sub {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .stream-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .timeline-item {
          display: flex;
          gap: 14px;
          position: relative;
        }

        .timeline-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 14px;
          flex-shrink: 0;
        }

        .node-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-cyan);
          box-shadow: 0 0 8px var(--accent-cyan);
          margin-top: 4px;
        }

        .node-line {
          width: 1px;
          flex: 1;
          background: var(--border-default);
          margin-top: 4px;
        }

        .timeline-content {
          background: rgba(8, 12, 20, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .timeline-meta {
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
        }

        .timeline-phase {
          color: var(--accent-purple);
          font-weight: 700;
        }

        .timeline-time {
          color: var(--text-muted);
        }

        .timeline-msg {
          font-size: 12px;
          color: var(--text-primary);
          line-height: 1.45;
        }

        .stream-empty {
          padding: 32px 0;
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
        }

        @media (max-width: 1200px) {
          .main-content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
