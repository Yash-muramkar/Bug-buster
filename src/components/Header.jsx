import React, { useState, useEffect } from 'react';
import { Bug, Settings, HelpCircle } from 'lucide-react';

export function Header({ onOpenSettings, onOpenGuide }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch {
        setHealth({ status: 'offline' });
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="light-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand-box">
          <div className="brand-icon">
            <Bug size={22} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-title">
              <span>BugBuster</span>
              <span className="brand-track-tag">Track 4: Developer Tools</span>
            </div>
            <div className="brand-subtitle">
              <span>Autonomous Find-Fix-Verify AI Assistant</span>
              <span>•</span>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>HACK IT BROS '26</span>
            </div>
          </div>
        </div>

        {/* Sandbox Status & Controls */}
        <div className="navbar-right">
          <div className="status-badge-online">
            <span className="status-dot-green"></span>
            <span>{health?.status === 'online' ? `Sandbox Online (Node ${health.nodeVersion})` : 'Connecting...'}</span>
          </div>

          <button onClick={onOpenGuide} className="nav-btn">
            <HelpCircle size={15} color="#2563eb" />
            <span>How It Works</span>
          </button>

          <button onClick={onOpenSettings} className="nav-btn">
            <Settings size={15} color="#64748b" />
            <span>API Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
