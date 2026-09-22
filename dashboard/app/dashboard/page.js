'use client';

import { useSwarm } from '../../components/SwarmContext';
import KPICard from '../../components/KPICard';
import AttackChart from '../../components/AttackChart';
import DiffViewer from '../../components/DiffViewer';
import VerificationPanel from '../../components/VerificationPanel';
import IncidentTable from '../../components/IncidentTable';

export default function DashboardOverview() {
  const swarm = useSwarm();

  return (
    <div className="overview-container">
      {/* Top Banner: Swarm State & Mission Status */}
      <div className="state-banner">
        <div className="banner-left">
          <div className="banner-tag">
            <span className="live-pulse" />
            <span className="font-mono">LIVE SWARM ORCHESTRATION</span>
          </div>
          <h1 className="banner-heading">
            Target Service: <span className="text-cyan">FastAPI Canary Cluster</span>
          </h1>
          <p className="banner-sub">
            Autonomous adversarial agents actively probing for concurrency race conditions and self-healing with Nebius AI Studio.
          </p>
        </div>

        <div className="banner-right">
          <div className="state-indicator-box">
            <span className="state-label">Current Pipeline Phase</span>
            <span className="state-active-pill font-mono">{swarm.state}</span>
          </div>
        </div>
      </div>

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

      {/* Main Grid: Left (Attacks & Diff) + Right (Verification & Live Log) */}
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

          {/* Swarm Live Event Stream */}
          <div className="event-stream-card">
            <div className="stream-header">
              <div>
                <h3 className="stream-title">Swarm Event Telemetry Stream</h3>
                <p className="stream-sub">Real-time WebSocket feed from engine:8001</p>
              </div>
              <span className="badge badge-cyan font-mono">LIVE</span>
            </div>

            <div className="stream-list">
              {swarm.events?.map((ev, i) => (
                <div key={i} className="stream-item">
                  <div className="stream-meta">
                    <span className="stream-time font-mono">{ev.timestamp}</span>
                    <span className="stream-phase font-mono">[{ev.state}]</span>
                  </div>
                  <div className="stream-msg">{ev.message}</div>
                </div>
              ))}
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
          gap: 24px;
        }

        .state-banner {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(13, 17, 23, 0.6) 100%);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 14px;
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(16px);
          flex-wrap: wrap;
          gap: 16px;
        }

        .banner-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: #00d4ff;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .live-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00d4ff;
          box-shadow: 0 0 10px #00d4ff;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        .banner-heading {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .text-cyan {
          color: #00d4ff;
        }

        .banner-sub {
          font-size: 13px;
          color: #8b949e;
          max-width: 600px;
          line-height: 1.5;
        }

        .state-indicator-box {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 20px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .state-label {
          font-size: 10px;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .state-active-pill {
          font-size: 16px;
          font-weight: 800;
          color: #00d4ff;
          letter-spacing: 1px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .main-content-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .main-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .content-left {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .content-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .event-stream-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .stream-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stream-title {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .stream-sub {
          font-size: 11px;
          color: #8b949e;
        }

        .stream-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
        }

        .stream-item {
          background: rgba(0, 0, 0, 0.25);
          border-left: 2px solid #00d4ff;
          padding: 8px 12px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .stream-meta {
          display: flex;
          gap: 8px;
          font-size: 10px;
        }

        .stream-time {
          color: #6e7681;
        }

        .stream-phase {
          color: #00d4ff;
          font-weight: 600;
        }

        .stream-msg {
          font-size: 11px;
          color: #e6edf3;
        }

        .incidents-section {
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
