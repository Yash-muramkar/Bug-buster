import React, { useState } from 'react';
import { X, Key, Check } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(keyInput.trim());
    localStorage.setItem('bugbuster_gemini_key', keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay-light">
      <div className="modal-box-light" style={{ maxWidth: '500px' }}>
        <div className="modal-head-light">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="#2563eb" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>API Settings (Optional)</h3>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body-light" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#1e40af', lineHeight: 1.5 }}>
              <strong>Zero-Config Offline Mode is Active:</strong> All 6 benchmark suites run locally in real Node.js child processes without needing any external API keys. Add a Gemini API key if you want to analyze arbitrary external GitHub PRs.
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="github-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="modal-foot-light">
            <button type="button" onClick={onClose} className="nav-btn">
              Cancel
            </button>
            <button type="submit" className="btn-run-proof" style={{ padding: '8px 18px', fontSize: '13px' }}>
              {saved ? <Check size={16} /> : null}
              <span>{saved ? 'Saved!' : 'Save Key'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
