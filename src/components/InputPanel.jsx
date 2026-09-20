import React, { useState } from 'react';
import { GitPullRequest, Code2, Play, RefreshCw, FileCode, CheckCircle2, ArrowRight } from 'lucide-react';

export function InputPanel({
  activeTab,
  setActiveTab,
  targetFile,
  buggyCode,
  setBuggyCode,
  onRunVerify,
  onFetchPR,
  isRunning,
  step,
  ingestedInfo
}) {
  const [prUrl, setPrUrl] = useState('https://github.com/Yash-muramkar/gold-prediction-ml-model');
  const [fetchingPR, setFetchingPR] = useState(false);

  const handleFetchPR = async (e) => {
    if (e) e.preventDefault();
    if (!prUrl) return;
    setFetchingPR(true);
    await onFetchPR(prUrl);
    setFetchingPR(false);
  };

  const handleSelectSampleRepo = async (url) => {
    setPrUrl(url);
    setFetchingPR(true);
    await onFetchPR(url);
    setFetchingPR(false);
  };

  const handleRunVerifyWrapper = async () => {
    // If on PR tab and user hasn't fetched the current URL yet, fetch first then verify
    if (activeTab === 'pr' && (!ingestedInfo || ingestedInfo.url !== prUrl)) {
      setFetchingPR(true);
      await onFetchPR(prUrl);
      setFetchingPR(false);
    }
    onRunVerify();
  };

  const lineCount = (buggyCode || '').split('\n').length;

  return (
    <div className="light-card">
      <div className="card-title-row">
        <div className="card-title-heading">
          <span className="title-dot" style={{ background: '#16a34a' }}></span>
          <span>Step 2: Target Code & Live Sandbox Execution</span>
        </div>
        <span className="card-title-meta">
          Target File: <strong>{targetFile || 'service.js'}</strong> ({lineCount} lines)
        </span>
      </div>

      {/* Tabs Row */}
      <div className="input-tabs-row">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('preset')}
            className={`tab-btn-light ${activeTab === 'preset' ? 'active' : ''}`}
          >
            <FileCode size={15} />
            <span>Preloaded Scenario</span>
          </button>

          <button
            onClick={() => setActiveTab('pr')}
            className={`tab-btn-light ${activeTab === 'pr' ? 'active' : ''}`}
          >
            <GitPullRequest size={15} />
            <span>Ingest GitHub PR / Repo</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`tab-btn-light ${activeTab === 'custom' ? 'active' : ''}`}
          >
            <Code2 size={15} />
            <span>Custom Code / Diff</span>
          </button>
        </div>

        <div className="file-indicator-light">
          File: <strong>{targetFile || 'service.js'}</strong>
        </div>
      </div>

      {/* GitHub URL input */}
      {activeTab === 'pr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <form onSubmit={handleFetchPR} className="github-input-group">
            <input
              type="text"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/owner/repo or https://github.com/owner/repo/pull/123"
              className="github-input"
            />
            <button
              type="submit"
              disabled={fetchingPR || isRunning}
              className="btn-run-proof"
              style={{ padding: '0 18px', height: '42px', fontSize: '13px' }}
            >
              {fetchingPR ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={15} />}
              <span>{fetchingPR ? 'Fetching...' : 'Fetch from GitHub'}</span>
            </button>
          </form>

          {/* Quick sample chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: '#64748b' }}>
            <span>Quick Samples:</span>
            <button
              type="button"
              onClick={() => handleSelectSampleRepo('https://github.com/Yash-muramkar/gold-prediction-ml-model')}
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '14px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}
            >
              ⭐ Yash-muramkar/gold-prediction-ml-model (ML Integrity)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSampleRepo('https://github.com/DerivativeJRM07/gaming_data_analysis')}
              style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', color: '#9d174d', borderRadius: '14px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}
            >
              🎮 DerivativeJRM07/gaming_data_analysis (Notebook IPYNB)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSampleRepo('https://github.com/enterprise-fintech/payment-gateway/pull/482')}
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '14px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}
            >
              PR #482 (Financial Concurrency)
            </button>
          </div>

          {/* Ingestion success banner */}
          {ingestedInfo && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#166534' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>
                  Ingested <strong>{ingestedInfo.targetFile}</strong> from GitHub ({ingestedInfo.title}). Ready to verify!
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px' }}>
                AST & SANDBOX COMPATIBLE
              </span>
            </div>
          )}
        </div>
      )}

      {/* Code Editor Box */}
      <div className="code-box-light">
        <div className="code-bar-light">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }}></span>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b' }}></span>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }}></span>
            <span style={{ marginLeft: '6px', color: '#ffffff', fontWeight: 600 }}>{targetFile || 'service.js'}</span>
            <span style={{ color: '#f87171', fontSize: '11px' }}>● Unpatched Source Code</span>
          </div>
          <span>ES Module / Python</span>
        </div>

        <textarea
          value={buggyCode}
          onChange={(e) => setBuggyCode(e.target.value)}
          disabled={isRunning || activeTab === 'preset'}
          rows={9}
          spellCheck={false}
          className="code-area-light"
          placeholder="// Paste vulnerable code or diff here..."
        />
      </div>

      {/* Action Row */}
      <div className="action-row-light">
        <div className="action-label-light">
          <CheckCircle2 size={18} color="#16a34a" />
          <span>Autonomous Loop: <strong>Reproduce (FAIL ❌)</strong> ➔ <strong>Apply Patch</strong> ➔ <strong>Verify (PASS ✅)</strong></span>
        </div>

        <button
          onClick={onRunVerify}
          disabled={isRunning || !buggyCode}
          className="btn-run-proof"
        >
          {isRunning ? (
            <>
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span>{step || 'Executing Sandbox Proof...'}</span>
            </>
          ) : (
            <>
              <Play size={16} fill="#ffffff" />
              <span>RUN LIVE SANDBOX PROOF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
