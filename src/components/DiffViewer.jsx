import React, { useState } from 'react';
import { GitCompare, Copy, Check } from 'lucide-react';

export function DiffViewer({ patchDiff, patchedCode, targetFile }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'patched'

  const handleCopy = () => {
    const textToCopy = viewMode === 'diff' ? patchDiff : patchedCode;
    navigator.clipboard.writeText(textToCopy || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const diffLines = (patchDiff || '').split('\n');

  return (
    <div className="tool-card-light">
      <div className="tool-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCompare size={16} color="#16a34a" />
          <span>Surgical Code Patch</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
            {targetFile || 'service.js'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('diff')}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                background: viewMode === 'diff' ? '#ffffff' : 'transparent',
                color: viewMode === 'diff' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'diff' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Unified Diff
            </button>
            <button
              onClick={() => setViewMode('patched')}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                background: viewMode === 'patched' ? '#ffffff' : 'transparent',
                color: viewMode === 'patched' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'patched' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Full Patched File
            </button>
          </div>

          <button onClick={handleCopy} className="nav-btn" style={{ padding: '4px 10px', fontSize: '11px' }}>
            {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="diff-light-box">
        {viewMode === 'diff' ? (
          <div>
            {diffLines.map((line, idx) => {
              let lineType = 'norm';
              if (line.startsWith('+') && !line.startsWith('+++')) {
                lineType = 'add';
              } else if (line.startsWith('-') && !line.startsWith('---')) {
                lineType = 'del';
              } else if (line.startsWith('@@') || line.startsWith('diff ') || line.startsWith('index ')) {
                lineType = 'hunk';
              }

              return (
                <div key={idx} className={`diff-line-row ${lineType}`}>
                  <span className="diff-line-no">{idx + 1}</span>
                  <span style={{ flex: 1 }}>{line || ' '}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <pre style={{ margin: 0, padding: '12px', color: '#0f172a', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            {patchedCode || '// Patched code will appear here...'}
          </pre>
        )}
      </div>
    </div>
  );
}
