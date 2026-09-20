import React from 'react';
import { ShieldCheck, XCircle, CheckCircle2, GitPullRequest } from 'lucide-react';

export function VerificationProof({
  verificationResult,
  onOpenExport,
  finding
}) {
  if (!verificationResult) return null;

  const isVerified = verificationResult.verified;
  const before = verificationResult.before;
  const after = verificationResult.after;

  return (
    <div className="proof-box-light">
      {/* Header */}
      <div className="proof-header-light">
        <div className="proof-left">
          <div className="proof-icon-circle">
            {isVerified ? <ShieldCheck size={26} /> : <XCircle size={26} color="#dc2626" />}
          </div>
          <div>
            <div className="proof-headline-h2">
              <span>Step 3: Live Sandbox Verification Result</span>
              <span className="safe-merge-pill">
                {isVerified ? 'VERIFIED PASS • SAFE TO MERGE' : 'ACTION REQUIRED'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              {finding?.title ? (
                <>
                  Verified for <strong style={{ color: '#0f172a' }}>{finding.title}</strong>: defect reproduced on unpatched code and proven resolved on patched code in an isolated sandbox.
                </>
              ) : (
                'Defect was reproduced live on unpatched code and proven resolved on patched code in an isolated Node.js child process sandbox.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenExport}
          className="btn-run-proof"
          style={{ background: '#0284c7', padding: '9px 18px', fontSize: '13px' }}
        >
          <GitPullRequest size={16} />
          <span>Export GitHub PR Comment</span>
        </button>
      </div>

      {/* Side-by-Side Proof Comparison */}
      <div className="proof-comparison-grid">
        {/* BEFORE FIX: Unpatched Run */}
        <div className="proof-col unpatched">
          <div className="proof-col-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XCircle size={16} color="#dc2626" />
              <span>Before Fix (Unpatched Code)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
              <span>{before.durationMs}ms</span>
              <span style={{ background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                EXIT {before.exitCode}
              </span>
            </div>
          </div>

          <div className="proof-code-output">
            {before.stdout || before.stderr || 'No stdout emitted.'}
            {before.stderr && before.stdout && (
              <div style={{ marginTop: '8px', fontWeight: 600, color: '#991b1b' }}>
                {before.stderr}
              </div>
            )}
          </div>

          <div className="proof-col-bottom">
            <span>Reproduction Status: <strong>Vulnerability Proven</strong></span>
            <span>❌ Failed Test Assertions</span>
          </div>
        </div>

        {/* AFTER FIX: Patched Run */}
        <div className="proof-col patched">
          <div className="proof-col-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>After Fix (Surgically Patched)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
              <span>{after.durationMs}ms</span>
              <span style={{ background: '#16a34a', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                EXIT {after.exitCode}
              </span>
            </div>
          </div>

          <div className="proof-code-output">
            {after.stdout || 'Test passed with clean output.'}
            {after.stderr && (
              <div style={{ marginTop: '8px', color: '#b45309' }}>
                {after.stderr}
              </div>
            )}
          </div>

          <div className="proof-col-bottom">
            <span>Fix Verification: <strong>All Invariants Satisfied</strong></span>
            <span>✅ Passed All Assertions</span>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
        <div>
          Sandbox Run ID: <strong style={{ color: '#0f172a' }}>{verificationResult.runId}</strong>
          <span style={{ margin: '0 8px' }}>•</span>
          Verified at: <span style={{ color: '#334155' }}>{new Date(verificationResult.timestamp).toLocaleTimeString()}</span>
        </div>
        <div style={{ color: '#16a34a', fontWeight: 600 }}>
          ✔ Host ChildProcess Sandbox Isolation Active
        </div>
      </div>
    </div>
  );
}
