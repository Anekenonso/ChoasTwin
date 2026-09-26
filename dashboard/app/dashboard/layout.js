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
          background: var(--bg-canvas);
        }

        .dashboard-main {
          flex: 1;
          margin-left: var(--sidebar-width);
          margin-top: var(--header-height);
          padding: 32px 36px 64px;
          max-width: 1600px;
          width: calc(100% - var(--sidebar-width));
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            padding: 20px 16px;
            width: 100%;
          }
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
