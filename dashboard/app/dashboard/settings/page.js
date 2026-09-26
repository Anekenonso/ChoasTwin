'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [targetUrl, setTargetUrl] = useState('http://localhost:8000');
  const [engineUrl, setEngineUrl] = useState('http://localhost:8001');
  const [nebiusModel, setNebiusModel] = useState('deepseek-ai/DeepSeek-R1');
  const [burstSize, setBurstSize] = useState(25);
  const [strictAntiLazy, setStrictAntiLazy] = useState(true);
  const [mockFallback, setMockFallback] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="header-kicker font-mono">SWARM ENGINE CONFIGURATION</div>
          <h1 className="page-title">ChaosTwin System Settings</h1>
          <p className="page-sub">
            Configure target endpoints, Nebius AI models, Tavily intelligence, and swarm fuzzing parameters.
          </p>
        </div>

        <button onClick={handleSave} className="btn-save font-mono">
          {saved ? '✔ Settings Saved' : '💾 Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSave} className="settings-grid">
        {/* Target & Infrastructure */}
        <div className="setting-card">
          <h3 className="card-title">Target & Engine Endpoints</h3>
          <p className="card-desc">Network addresses for canary target service and swarm orchestrator.</p>

          <div className="form-group">
            <label className="font-mono">Target Application Base URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="font-mono input-field"
            />
            <span className="field-hint font-mono">Default canary target runs at port 8000</span>
          </div>

          <div className="form-group">
            <label className="font-mono">Swarm Engine Orchestrator URL</label>
            <input
              type="text"
              value={engineUrl}
              onChange={(e) => setEngineUrl(e.target.value)}
              className="font-mono input-field"
            />
            <span className="field-hint font-mono">FastAPI WebSocket and REST server at port 8001</span>
          </div>
        </div>

        {/* Nebius AI Studio */}
        <div className="setting-card">
          <h3 className="card-title">Nebius AI Studio & NVIDIA Inference</h3>
          <p className="card-desc">Token factory model parameters for patch generation.</p>

          <div className="form-group">
            <label className="font-mono">Primary Reasoning Model</label>
            <select
              value={nebiusModel}
              onChange={(e) => setNebiusModel(e.target.value)}
              className="font-mono select-input"
            >
              <option value="deepseek-ai/DeepSeek-R1">deepseek-ai/DeepSeek-R1 (High Reasoning)</option>
              <option value="meta-llama/Llama-3.3-70B-Instruct">meta-llama/Llama-3.3-70B-Instruct (Fast)</option>
              <option value="Qwen/Qwen2.5-Coder-32B-Instruct">Qwen/Qwen2.5-Coder-32B-Instruct</option>
            </select>
            <span className="field-hint font-mono">Served via Nebius Studio with token/s tracking</span>
          </div>

          <div className="form-group">
            <label className="font-mono">Nebius API Key</label>
            <input
              type="password"
              value="••••••••••••••••••••••••••••••"
              disabled
              className="font-mono input-field input-disabled"
            />
            <span className="field-hint font-mono">Configured via .env (NEBIUS_API_KEY)</span>
          </div>
        </div>

        {/* Fuzzing Swarm Parameters */}
        <div className="setting-card">
          <h3 className="card-title">Attack Swarm Tuning</h3>
          <p className="card-desc">Control concurrent worker volume and chaos attack parameters.</p>

          <div className="form-group">
            <div className="label-with-val">
              <label className="font-mono">Burst Concurrency Size</label>
              <span className="slider-val font-mono">{burstSize} Coroutines</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={burstSize}
              onChange={(e) => setBurstSize(Number(e.target.value))}
              className="slider-input"
            />
            <span className="field-hint font-mono">Parallel async requests fired in single event loop tick</span>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="antiLazy"
              checked={strictAntiLazy}
              onChange={(e) => setStrictAntiLazy(e.target.checked)}
            />
            <label htmlFor="antiLazy" className="checkbox-label">
              <strong>Strict Anti-Lazy AST Validation</strong>
              <span>Reject patches containing empty pass, bare except, or placeholder comments.</span>
            </label>
          </div>
        </div>

        {/* Demo & Fallbacks */}
        <div className="setting-card">
          <h3 className="card-title">Canary Simulation & Fallbacks</h3>
          <p className="card-desc">Safety nets for offline evaluation and offline demo presentations.</p>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="mockFallback"
              checked={mockFallback}
              onChange={(e) => setMockFallback(e.target.checked)}
            />
            <label htmlFor="mockFallback" className="checkbox-label">
              <strong>Enable High-Fidelity Simulation Fallback</strong>
              <span>Use realistic race condition heuristics if Nebius or Canary is temporarily offline.</span>
            </label>
          </div>
        </div>
      </form>

      <style jsx>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .page-header {
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

        .page-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .page-sub {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .btn-save {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #ffffff;
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-save:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 24px;
        }

        .setting-card {
          background: linear-gradient(180deg, rgba(14, 21, 36, 0.9) 0%, rgba(10, 16, 28, 0.95) 100%);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: var(--shadow-card);
        }

        .card-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .card-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: -12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .input-field {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 9px 12px;
          color: var(--text-primary);
          font-size: 12.5px;
          outline: none;
        }

        .input-field:focus {
          border-color: var(--border-glow-cyan);
        }

        .input-disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: rgba(0, 0, 0, 0.3);
        }

        .select-input {
          background: #090e1a;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 9px 12px;
          color: var(--text-primary);
          font-size: 12.5px;
          outline: none;
        }

        .field-hint {
          font-size: 10.5px;
          color: var(--text-muted);
        }

        .label-with-val {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slider-val {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--accent-cyan);
        }

        .slider-input {
          accent-color: var(--accent-cyan);
          cursor: pointer;
        }

        .checkbox-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px;
          background: rgba(8, 12, 20, 0.4);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .checkbox-row input {
          margin-top: 3px;
          accent-color: var(--accent-cyan);
        }

        .checkbox-label {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 12px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .checkbox-label span {
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
