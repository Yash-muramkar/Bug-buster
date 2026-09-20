import React from 'react';
import { Zap, ShieldAlert, Cpu, Lock, AlertTriangle, KeyRound, Database } from 'lucide-react';

const ICONS = {
  'transfer-race': Zap,
  'prototype-pollution': ShieldAlert,
  'jwt-timing-attack': Lock,
  'redos-attack': Cpu,
  'sqli-param-pollution': Database,
  'secret-leakage': KeyRound
};

export function PresetSelector({ presets, selectedPresetId, onSelectPreset, disabled }) {
  return (
    <div className="light-card">
      <div className="card-title-row">
        <div className="card-title-heading">
          <span className="title-dot"></span>
          <span>Step 1: Select a Real-World Bug Scenario</span>
        </div>
        <span className="card-title-meta">
          {presets.length} Preloaded Benchmark Suites
        </span>
      </div>

      <div className="preset-grid-light">
        {presets.map((preset) => {
          const Icon = ICONS[preset.id] || AlertTriangle;
          const isSelected = selectedPresetId === preset.id;

          const severityClass =
            preset.severity === 'CRITICAL'
              ? 'sev-critical'
              : preset.severity === 'HIGH'
              ? 'sev-high'
              : 'sev-medium';

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              disabled={disabled}
              className={`preset-card-light ${isSelected ? 'active' : ''}`}
            >
              <div>
                <div className="preset-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={16} color="#2563eb" />
                    <span className="preset-badge-tag">{preset.badge}</span>
                  </div>
                  <span className={`severity-pill-light ${severityClass}`}>
                    {preset.severity}
                  </span>
                </div>

                <div className="preset-name">
                  {preset.title}
                </div>

                <div className="preset-summary">
                  {preset.summary}
                </div>
              </div>

              <div className="preset-bottom">
                <span className="cwe-tag-light">
                  {preset.cwe.split(':')[0]}
                </span>
                <span className="preset-action-indicator" style={{ color: isSelected ? '#16a34a' : '#2563eb' }}>
                  {isSelected ? '✓ SELECTED' : 'Select Scenario →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
