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
      <div className="page-header">
        <div>
          <span className="page-tag font-mono">SWARM ENGINE CONFIGURATION</span>
          <h1 className="page-title">ChaosTwin System Settings</h1>
          <p className="page-sub">
            Configure target endpoints, Nebius AI models, Tavily intelligence, and swarm fuzzing parameters.
          </p>
        </div>

        <button onClick={handleSave} className="btn-save">
          {saved ? '✔ Settings Saved' : '💾 Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSave} className="settings-grid">
        {/* Target & Infrastructure */}
        <div className="setting-card">
          <h3 className="card-title">Target & Engine Endpoints</h3>
          <p className="card-desc">Network addresses for canary target service and swarm orchestrator.</p>

          <div className="form-group">
            <label>Target Application Base URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="font-mono"
            />
            <span className="field-hint">Default canary target runs at port 8000</span>
          </div>

          <div className="form-group">
            <label>Swarm Engine Orchestrator URL</label>
            <input
              type="text"
              value={engineUrl}
              onChange={(e) => setEngineUrl(e.target.value)}
              className="font-mono"
            />
            <span className="field-hint">FastAPI WebSocket and REST server at port 8001</span>
          </div>
        </div>

        {/* Nebius AI Studio */}
        <div className="setting-card">
          <h3 className="card-title">Nebius AI Studio & NVIDIA Inference</h3>
          <p className="card-desc">Token factory model parameters for patch generation.</p>

          <div className="form-group">
            <label>Primary Reasoning Model</label>
            <select
              value={nebiusModel}
              onChange={(e) => setNebiusModel(e.target.value)}
              className="font-mono select-input"
            >
              <option value="deepseek-ai/DeepSeek-R1">deepseek-ai/DeepSeek-R1 (High Reasoning)</option>
              <option value="meta-llama/Llama-3.3-70B-Instruct">meta-llama/Llama-3.3-70B-Instruct (Fast)</option>
              <option value="Qwen/Qwen2.5-Coder-32B-Instruct">Qwen/Qwen2.5-Coder-32B-Instruct</option>
            </select>
            <span className="field-hint">Served via Nebius Studio with token/s tracking</span>
          </div>

          <div className="form-group">
            <label>Nebius API Key</label>
            <input
              type="password"
              value="••••••••••••••••••••••••••••••"
              disabled
              className="font-mono"
            />
            <span className="field-hint">Configured via .env (NEBIUS_API_KEY)</span>
          </div>
        </div>

        {/* Fuzzing Swarm Parameters */}
        <div className="setting-card">
          <h3 className="card-title">Attack Swarm Tuning</h3>
          <p className="card-desc">Control concurrent worker volume and chaos attack parameters.</p>

          <div className="form-group">
            <div className="slider-label-row">
              <label>API Fuzzer Burst Size</label>
              <span className="slider-val font-mono text-cyan">{burstSize} Workers</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={burstSize}
              onChange={(e) => setBurstSize(Number(e.target.value))}
              className="range-input"
            />
            <span className="field-hint">
              Dispatches {burstSize} concurrent coroutines via <code className="font-mono">asyncio.gather</code>
            </span>
          </div>

          <div className="form-group">
            <label>UI Chaos Budget (Playwright)</label>
            <input
              type="number"
              defaultValue={8}
              min={3}
              max={20}
              className="font-mono"
            />
            <span className="field-hint">Maximum interactive mutations before telemetry capture</span>
          </div>
        </div>

        {/* Security & Anti-Lazy Rules */}
        <div className="setting-card">
          <h3 className="card-title">Anti-Lazy & Safety Policies</h3>
          <p className="card-desc">Enforce code quality standards on autonomous patch generation.</p>

          <div className="toggle-group">
            <div>
              <div className="toggle-title">Strict Anti-Lazy AST Validator</div>
              <div className="toggle-desc">Automatically reject patches containing `except: pass` or no-op handlers.</div>
            </div>
            <input
              type="checkbox"
              checked={strictAntiLazy}
              onChange={(e) => setStrictAntiLazy(e.target.checked)}
              className="toggle-box"
            />
          </div>

          <div className="toggle-group">
            <div>
              <div className="toggle-title">Offline Mock Mode Fallback</div>
              <div className="toggle-desc">Gracefully simulate Nebius & Tavily responses if API keys are absent.</div>
            </div>
            <input
              type="checkbox"
              checked={mockFallback}
              onChange={(e) => setMockFallback(e.target.checked)}
              className="toggle-box"
            />
          </div>
        </div>
      </form>

      <style jsx>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-tag {
          font-size: 10px;
          color: #00d4ff;
          font-weight: 700;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 6px;
        }

        .page-title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .page-sub {
          font-size: 13px;
          color: #8b949e;
        }

        .btn-save {
          background: linear-gradient(135deg, #00d4ff, #0066ff);
          border: none;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 0 16px rgba(0, 212, 255, 0.35);
          transition: all 0.2s ease;
        }

        .btn-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 24px rgba(0, 212, 255, 0.5);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1000px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        .setting-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-title {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }

        .card-desc {
          font-size: 12px;
          color: #8b949e;
          margin: 0;
          line-height: 1.4;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 500;
          color: #c9d1d9;
        }

        .form-group input,
        .select-input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 12px;
          color: #ffffff;
          font-size: 13px;
        }

        .form-group input:focus,
        .select-input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
        }

        .select-input {
          background: #0d1117;
          cursor: pointer;
        }

        .field-hint {
          font-size: 11px;
          color: #6e7681;
        }

        .slider-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slider-val {
          font-size: 12px;
          font-weight: 700;
        }

        .text-cyan {
          color: #00d4ff;
        }

        .range-input {
          accent-color: #00d4ff;
          cursor: pointer;
        }

        .toggle-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .toggle-title {
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .toggle-desc {
          font-size: 11px;
          color: #8b949e;
          max-width: 380px;
        }

        .toggle-box {
          width: 18px;
          height: 18px;
          accent-color: #00d4ff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
