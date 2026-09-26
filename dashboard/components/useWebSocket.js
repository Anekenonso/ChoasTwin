'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const ENGINE_HTTP_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:8001';
const ENGINE_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001/ws';

const INITIAL_STATE = {
  state: 'IDLE',
  connected: false,
  metrics: {
    totalAttacks: 142,
    breachCount: 18,
    activeIncidents: 1,
    mttrSeconds: 4.8,
    nebiusTokPerSec: 148.5,
    tavilyQueries: 12,
    filterDropped: 840,
    patchAttempts: 1,
  },
  currentAttack: {
    burstId: 'burst_025',
    target: '/api/v1/inventory/reserve',
    concurrency: 25,
    statusCodes: { '200': 18, '409': 0, '500': 7 },
    anomalies: 7,
    latencyAvgMs: 84.2,
    timestamp: new Date().toISOString(),
  },
  recentAttacks: [
    { id: 'burst_025', endpoint: '/api/v1/inventory/reserve', concurrency: 25, breaches: 7, latency: 84, time: '12:54:10', status: 'BREACH' },
    { id: 'burst_024', endpoint: '/api/v1/inventory/reserve', concurrency: 25, breaches: 6, latency: 79, time: '12:53:40', status: 'BREACH' },
    { id: 'burst_023', endpoint: '/api/v1/checkout', concurrency: 15, breaches: 0, latency: 42, time: '12:52:15', status: 'SAFE' },
    { id: 'burst_022', endpoint: '/api/v1/cart/apply-coupon', concurrency: 20, breaches: 3, latency: 110, time: '12:50:02', status: 'BREACH' },
    { id: 'burst_021', endpoint: '/api/v1/auth/login', concurrency: 10, breaches: 0, latency: 31, time: '12:48:29', status: 'SAFE' },
  ],
  incidents: [
    {
      id: 'INC-2026-089',
      severity: 'CRITICAL',
      title: 'Race Condition in Inventory Reserve',
      endpoint: 'POST /api/v1/inventory/reserve',
      error: 'InvariantViolation: Stock dropped to -6 under 25 concurrent workers',
      detectedAt: '2026-09-22 12:54:10',
      status: 'SELF_HEALING',
      trace: `Traceback (most recent call last):\n  File "target_app/app.py", line 47, in reserve_stock\n    item['stock'] -= req.quantity\nAssertionError: Stock count dropped below zero (-6)`
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
  ],
  latestPatch: {
    targetFile: 'target_app/app.py',
    explanation: 'Introduced an asyncio.Lock() mutex around the check-and-decrement sequence in reserve_stock to eliminate the time-of-check to time-of-use (TOCTOU) race condition.',
    antiLazyScore: 100,
    model: 'deepseek-ai/DeepSeek-R1 (Nebius Token-Factory)',
    ttftMs: 240,
    diff: `--- target_app/app.py (Original)
+++ target_app/app.py (Self-Healed)
@@ -12,6 +12,7 @@
 app = FastAPI(title="Canary Target")
+inventory_lock = asyncio.Lock()

@@ -42,8 +43,9 @@
 async def reserve_stock(req: ReservationRequest):
-    # Intentional race condition: no lock between read and write
-    current_stock = db["items"][req.item_id]["stock"]
-    if current_stock >= req.quantity:
-        await asyncio.sleep(0.05)  # Simulate DB latency window
-        db["items"][req.item_id]["stock"] = current_stock - req.quantity
-        return {"status": "reserved", "remaining": db["items"][req.item_id]["stock"]}
+    async with inventory_lock:
+        current_stock = db["items"][req.item_id]["stock"]
+        if current_stock < req.quantity:
+            raise HTTPException(status_code=409, detail="Insufficient stock")
+        db["items"][req.item_id]["stock"] -= req.quantity
+        return {"status": "reserved", "remaining": db["items"][req.item_id]["stock"]}`
  },
  verification: {
    stage1Pass: true,
    stage1Output: 'PASSED: target_app/test_target.py (3/3 unit & regression tests passing in 0.42s)',
    stage2Pass: true,
    stage2Output: 'PASSED: APIConcurrencyFuzzer re-test 25/25 requests verified. 0 race conditions detected. Final stock invariant maintained.',
    reFuzzResistance: 100,
  },
  events: [
    { timestamp: '12:54:10', state: 'ATTACKING', message: 'APIConcurrencyFuzzer deployed 25 concurrent requests' },
    { timestamp: '12:54:12', state: 'RECON', message: 'Observer compressed 7 anomaly traces; Tavily queried CVE-TOCTOU patterns' },
    { timestamp: '12:54:15', state: 'PATCHING', message: 'Nebius DeepSeek-R1 generated mutex lock patch (Anti-lazy validated)' },
    { timestamp: '12:54:17', state: 'VERIFYING', message: 'Two-stage verification running against canary sandbox' },
    { timestamp: '12:54:19', state: 'RESOLVED', message: 'Verification passed. Race condition eradicated in 4.8s MTTR.' },
  ]
};

export function useSwarmWebSocket() {
  const [data, setData] = useState(INITIAL_STATE);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const handleSwarmEvent = useCallback((event) => {
    setData(prev => {
      const updatedEvents = [
        {
          timestamp: new Date().toLocaleTimeString(),
          state: event.state || prev.state,
          message: event.message || JSON.stringify(event.data || {}),
        },
        ...prev.events.slice(0, 49)
      ];

      return {
        ...prev,
        state: event.state || prev.state,
        events: updatedEvents,
        ...(event.data ? event.data : {})
      };
    });
  }, []);

  const connectRef = useRef(null);

  const connect = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;

      const ws = new WebSocket(ENGINE_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        setData(prev => ({ ...prev, connected: true }));
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleSwarmEvent(payload);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        setData(prev => ({ ...prev, connected: false }));
        // Retry connection after 4 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current?.();
        }, 4000);
      };

      ws.onerror = () => {
        setConnectionStatus('error');
        ws.close();
      };
    } catch {
      setTimeout(() => {
        setConnectionStatus('disconnected');
      }, 0);
    }
  }, [handleSwarmEvent]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const startSwarm = async () => {
    try {
      const res = await fetch(`${ENGINE_HTTP_URL}/api/swarm/start`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, simulating swarm run:', e);
      // Simulate live progression if engine is offline
      simulateLocalSwarm();
      return { status: 'simulated' };
    }
  };

  const resetSwarm = async () => {
    try {
      const res = await fetch(`${ENGINE_HTTP_URL}/api/swarm/reset`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      setData(INITIAL_STATE);
      return { status: 'reset' };
    }
  };

  const simulateLocalSwarm = () => {
    const states = ['ATTACKING', 'RECON', 'PATCHING', 'VERIFYING', 'RESOLVED'];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= states.length) {
        clearInterval(interval);
        return;
      }
      const st = states[idx];
      setData(prev => ({
        ...prev,
        state: st,
        events: [
          {
            timestamp: new Date().toLocaleTimeString(),
            state: st,
            message: `Swarm phase transitioned to ${st}`,
          },
          ...prev.events
        ]
      }));
      idx++;
    }, 2000);
  };

  return {
    ...data,
    connectionStatus,
    startSwarm,
    resetSwarm,
  };
}
