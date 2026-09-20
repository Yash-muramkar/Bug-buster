import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { PresetSelector } from './components/PresetSelector.jsx';
import { InputPanel } from './components/InputPanel.jsx';
import { VulnerabilityCard } from './components/VulnerabilityCard.jsx';
import { DiffViewer } from './components/DiffViewer.jsx';
import { ExecutionTerminal } from './components/ExecutionTerminal.jsx';
import { VerificationProof } from './components/VerificationProof.jsx';
import { ExportModal } from './components/ExportModal.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { GuideModal } from './components/GuideModal.jsx';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('transfer-race');
  const [activeTab, setActiveTab] = useState('preset');
  const [targetFile, setTargetFile] = useState('transferService.js');
  const [buggyCode, setBuggyCode] = useState('');
  const [finding, setFinding] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState('');

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('bugbuster_gemini_key') || '');
  const [exportMarkdown, setExportMarkdown] = useState('');
  const [ingestedInfo, setIngestedInfo] = useState(null);

  // Fetch presets on mount
  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await fetch('/api/presets');
        if (res.ok) {
          const data = await res.json();
          setPresets(data.presets);
          const initial = data.presets.find(p => p.id === 'transfer-race') || data.presets[0];
          if (initial) {
            setSelectedPresetId(initial.id);
            setTargetFile(initial.targetFile);
            setBuggyCode(initial.buggyCode);
            setFinding(initial);
          }
        }
      } catch (err) {
        console.error('Failed to fetch presets:', err);
      }
    }
    loadPresets();
  }, []);

  // Handle selecting a preset
  const handleSelectPreset = (id) => {
    setSelectedPresetId(id);
    setActiveTab('preset');
    setVerificationResult(null);
    setIngestedInfo(null);
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setTargetFile(preset.targetFile);
      setBuggyCode(preset.buggyCode);
      setFinding(preset);
    }
  };

  // Handle fetching a GitHub PR or Repo
  const handleFetchPR = async (prUrl) => {
    try {
      setIsRunning(true);
      setStep('Fetching repository code from GitHub...');
      const res = await fetch('/api/fetch-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prUrl })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch from GitHub');
      }
      const data = await res.json();
      const repoOrPr = data.data;

      setStep('Analyzing fetched code for security vulnerabilities...');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey
        },
        body: JSON.stringify({
          code: repoOrPr.code || '',
          diff: repoOrPr.diff || '',
          targetFile: repoOrPr.targetFile
        })
      });

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        const analyzedFinding = analyzeData.analysis;
        setFinding(analyzedFinding);
        setTargetFile(repoOrPr.targetFile || analyzedFinding.targetFile);
        setBuggyCode(repoOrPr.code || analyzedFinding.buggyCode);
        setVerificationResult(null);
        setIngestedInfo({
          url: prUrl,
          targetFile: repoOrPr.targetFile || analyzedFinding.targetFile,
          title: analyzedFinding.title,
          badge: analyzedFinding.badge,
          severity: analyzedFinding.severity
        });
      }
    } catch (err) {
      alert('Error fetching from GitHub: ' + err.message);
    } finally {
      setIsRunning(false);
      setStep('');
    }
  };

  // Execute the autonomous Find-Fix-Verify cycle
  const handleRunVerify = async () => {
    if (!finding && !buggyCode) return;
    setIsRunning(true);
    setVerificationResult(null);

    try {
      let currentFinding = finding;
      if (!currentFinding || activeTab === 'custom') {
        setStep('Step 1/3: Analyzing code & synthesizing reproduction test assertions...');
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-api-key': apiKey
          },
          body: JSON.stringify({
            code: buggyCode,
            presetId: activeTab === 'preset' ? selectedPresetId : null,
            targetFile: targetFile
          })
        });
        const analyzeData = await analyzeRes.json();
        currentFinding = analyzeData.analysis;
        setFinding(currentFinding);
        setTargetFile(currentFinding.targetFile);
      }

      setStep('Step 2/3: Executing reproduction test in sandbox (verifying FAIL ❌)...');
      await new Promise(r => setTimeout(r, 250));

      setStep('Step 3/3: Applying surgical patch & verifying resolution (PASS ✅)...');

      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetFile: currentFinding.targetFile,
          buggyCode: currentFinding.buggyCode,
          patchedCode: currentFinding.patchedCode,
          patchDiff: currentFinding.patchDiff,
          testCode: currentFinding.testCode
        })
      });

      if (!verifyRes.ok) {
        throw new Error('Sandbox verification failed to execute.');
      }

      const verifyData = await verifyRes.json();
      setVerificationResult(verifyData.result);

      // Generate exportable PR comment
      const exportRes = await fetch('/api/github/export-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding: currentFinding,
          verificationResult: verifyData.result
        })
      });

      if (exportRes.ok) {
        const exportData = await exportRes.json();
        setExportMarkdown(exportData.markdown);
      }
    } catch (err) {
      console.error('Error during verification cycle:', err);
      alert('Verification error: ' + err.message);
    } finally {
      setIsRunning(false);
      setStep('');
    }
  };

  return (
    <div>
      {/* Clean Light Navbar */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <main className="app-layout">
        {/* Step-by-step guidance banner */}
        <div className="stepper-card">
          <div className="stepper-steps">
            <div className="step-item active">
              <span className="step-bubble">1</span>
              <span>Choose Bug Scenario</span>
            </div>
            <span className="step-arrow-divider">➔</span>
            <div className="step-item active">
              <span className="step-bubble">2</span>
              <span>Click "Run Live Sandbox Proof"</span>
            </div>
            <span className="step-arrow-divider">➔</span>
            <div className={`step-item ${verificationResult ? 'active' : ''}`}>
              <span className="step-bubble">3</span>
              <span>Verify FAIL ❌ ➔ PASS ✅</span>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>Zero-Config Offline Sandbox Ready</span>
          </div>
        </div>

        {/* Step 1: Benchmark Scenarios */}
        <PresetSelector
          presets={presets}
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          disabled={isRunning}
        />

        {/* Step 2: Code Editor & Ingestion */}
        <InputPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          targetFile={targetFile}
          buggyCode={buggyCode}
          setBuggyCode={setBuggyCode}
          onRunVerify={handleRunVerify}
          onFetchPR={handleFetchPR}
          isRunning={isRunning}
          step={step}
          ingestedInfo={ingestedInfo}
        />

        {/* Step 3: Live Verification Proof Card (Hero Result) */}
        {verificationResult && (
          <VerificationProof
            verificationResult={verificationResult}
            onOpenExport={() => setIsExportOpen(true)}
            finding={finding}
          />
        )}

        {/* Threat Breakdown Analysis */}
        {finding && (
          <VulnerabilityCard finding={finding} />
        )}

        {/* Surgical Diff & Live Console */}
        <div className="two-tools-grid">
          <DiffViewer
            patchDiff={finding?.patchDiff}
            patchedCode={finding?.patchedCode}
            targetFile={targetFile}
          />

          <ExecutionTerminal
            verificationResult={verificationResult}
            testCode={finding?.testCode}
            isRunning={isRunning}
            step={step}
          />
        </div>
      </main>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        markdown={exportMarkdown}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
