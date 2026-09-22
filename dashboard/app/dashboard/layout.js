'use client';

import { SwarmProvider, useSwarm } from '../../components/SwarmContext';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

function DashboardContent({ children }) {
  const swarm = useSwarm();

  return (
    <div className="dashboard-shell">
      <Sidebar connectionStatus={swarm.connectionStatus} />
      <TopBar
        state={swarm.state}
        onStart={swarm.startSwarm}
        onReset={swarm.resetSwarm}
        metrics={swarm.metrics}
      />
      <main className="dashboard-main">
        {children}
      </main>

      <style jsx>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: #0a0e17;
        }

        .dashboard-main {
          flex: 1;
          margin-left: 240px;
          margin-top: 60px;
          padding: 28px 32px 48px;
          max-width: 1600px;
          width: calc(100% - 240px);
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <SwarmProvider>
      <DashboardContent>{children}</DashboardContent>
    </SwarmProvider>
  );
}
