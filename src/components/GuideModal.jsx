import React from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-light">
      <div className="modal-box-light" style={{ maxWidth: '780px' }}>
        <div className="modal-head-light">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#16a34a" />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>BugBuster Architecture & Autonomous Pipeline</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>HACK IT BROS '26 | Track 4: Developer Tools & Open Innovation</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-light" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 4 Stages */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
              4-Stage Autonomous Pipeline
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#2563eb', display: 'block', marginBottom: '4px', fontSize: '12px' }}>1. INGEST & SCAN</strong>
                <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>Parses PR diffs or code to detect root causes with CWE/OWASP classification.</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#dc2626', display: 'block', marginBottom: '4px', fontSize: '12px' }}>2. REPRODUCTION TEST</strong>
                <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>Generates standalone test assertions that reliably fail on unpatched code.</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#b45309', display: 'block', marginBottom: '4px', fontSize: '12px' }}>3. SURGICAL PATCH</strong>
                <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>Synthesizes a minimal Unified Diff fixing root cause without side effects.</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#16a34a', display: 'block', marginBottom: '4px', fontSize: '12px' }}>4. SANDBOX PROOF</strong>
                <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>Runs test in isolated child process: ❌ FAIL before fix ➔ ✅ PASS after fix.</p>
              </div>
            </div>
          </div>

          {/* Real Sandbox Compliance */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>No Fake Demo Compliance: Genuine Host Sandbox Execution</span>
            </div>
            <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
              BugBuster does not fake test executions or mock outputs. It invokes <code style={{ color: '#2563eb', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>node:child_process</code> on the host system, capturing genuine exit codes, elapsed milliseconds, and process streams.
            </p>
          </div>
        </div>

        <div className="modal-foot-light">
          <button onClick={onClose} className="btn-run-proof" style={{ padding: '8px 18px', fontSize: '13px' }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
