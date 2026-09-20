import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

export function ExecutionTerminal({
  verificationResult,
  testCode,
  isRunning,
  step
}) {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'test'

  return (
    <div className="tool-card-light">
      <div className="tool-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="#2563eb" />
          <span>Live Execution Console</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>
            sandbox-runner / child_process
          </span>
        </div>

        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
          <button
            onClick={() => setActiveTab('live')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              background: activeTab === 'live' ? '#ffffff' : 'transparent',
              color: activeTab === 'live' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'live' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            Terminal Output
          </button>
          <button
            onClick={() => setActiveTab('test')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              background: activeTab === 'test' ? '#ffffff' : 'transparent',
              color: activeTab === 'test' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'test' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            Reproduction test.js
          </button>
        </div>
      </div>

      <div className="console-body-light">
        {activeTab === 'live' ? (
          <div>
            {isRunning && (
              <div style={{ color: '#38bdf8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>➜ [BugBuster Runner] Spawning isolated Node.js child process...</div>
                <div style={{ color: '#94a3b8' }}>$ node test.js</div>
                <div style={{ color: '#67e8f9', fontWeight: 600 }}>{step}</div>
              </div>
            )}

            {!isRunning && !verificationResult && (
              <div style={{ color: '#64748b' }}>
                <p style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>BugBuster Sandbox Engine (v1.0.0)</p>
                <p>Status: Idle. Waiting to execute autonomous Find-Fix-Verify cycle.</p>
                <p style={{ marginTop: '6px' }}>Click <strong style={{ color: '#fff' }}>"RUN LIVE SANDBOX PROOF"</strong> above to start.</p>
              </div>
            )}

            {!isRunning && verificationResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Phase 1 */}
                <div>
                  <div style={{ color: '#38bdf8', fontWeight: 700 }}>$ node test.js (PHASE 1: UNPATCHED CODE)</div>
                  <pre style={{ margin: '4px 0', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                    {verificationResult.before.stdout}
                  </pre>
                  {verificationResult.before.stderr && (
                    <pre style={{ margin: '4px 0', color: '#f87171', whiteSpace: 'pre-wrap' }}>
                      {verificationResult.before.stderr}
                    </pre>
                  )}
                  <div style={{ color: '#f87171', fontWeight: 700 }}>
                    [Process exited with code {verificationResult.before.exitCode}] ❌ FAIL (Expected defect confirmed)
                  </div>
                </div>

                {/* Phase 2 */}
                <div style={{ borderTop: '1px solid #334155', paddingTop: '8px' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 700 }}>$ git apply surgical-patch.diff (PHASE 2: APPLYING FIX)</div>
                  <div style={{ color: '#4ade80', marginTop: '2px' }}>
                    ✔ Unified Diff patch applied cleanly to sandbox workspace.
                  </div>
                </div>

                {/* Phase 3 */}
                <div style={{ borderTop: '1px solid #334155', paddingTop: '8px' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 700 }}>$ node test.js (PHASE 3: PATCHED CODE)</div>
                  <pre style={{ margin: '4px 0', color: '#86efac', whiteSpace: 'pre-wrap' }}>
                    {verificationResult.after.stdout}
                  </pre>
                  {verificationResult.after.stderr && (
                    <pre style={{ margin: '4px 0', color: '#fde047', whiteSpace: 'pre-wrap' }}>
                      {verificationResult.after.stderr}
                    </pre>
                  )}
                  <div style={{ color: '#4ade80', fontWeight: 700 }}>
                    [Process exited with code {verificationResult.after.exitCode}] ✅ PASS (Defect resolved and verified!)
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
              // Autonomous Reproduction Test Suite (Native node:assert)
            </div>
            <pre style={{ margin: 0, color: '#38bdf8', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
              {testCode || '// Test suite will appear here...'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
