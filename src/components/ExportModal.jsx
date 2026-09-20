import React, { useState } from 'react';
import { X, Copy, Check, GitPullRequest } from 'lucide-react';

export function ExportModal({ isOpen, onClose, markdown }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay-light">
      <div className="modal-box-light">
        <div className="modal-head-light">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitPullRequest size={20} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Export GitHub PR Verification Comment</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Ready to paste into GitHub PR discussion or CI/CD audit logs</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-light">
          <textarea
            readOnly
            value={markdown || ''}
            rows={14}
            style={{
              width: '100%',
              padding: '12px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#0f172a',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.5,
              resize: 'none'
            }}
          />
        </div>

        <div className="modal-foot-light">
          <button onClick={onClose} className="nav-btn">
            Close
          </button>
          <button onClick={handleCopy} className="btn-run-proof" style={{ padding: '8px 18px', fontSize: '13px' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy PR Markdown'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
