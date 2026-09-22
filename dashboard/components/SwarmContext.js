'use client';

import { createContext, useContext } from 'react';
import { useSwarmWebSocket } from './useWebSocket';

const SwarmContext = createContext(null);

export function SwarmProvider({ children }) {
  const swarm = useSwarmWebSocket();
  return <SwarmContext.Provider value={swarm}>{children}</SwarmContext.Provider>;
}

export function useSwarm() {
  const context = useContext(SwarmContext);
  if (!context) {
    throw new Error('useSwarm must be used within a SwarmProvider');
  }
  return context;
}
