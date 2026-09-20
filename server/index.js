import express from 'express';
import cors from 'cors';
import { BENCHMARK_PRESETS, getPresetById } from './lib/presets.js';
import { analyzeCode } from './lib/analyzer.js';
import { executeVerification } from './lib/runner.js';
import { fetchGitHubPR, generateGitHubPRComment } from './lib/github.js';

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'BugBuster Autonomous Verification Engine',
    version: '1.0.0',
    mode: 'SANDBOX_ACTIVE',
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  });
});

// List benchmark vulnerability presets
app.get('/api/presets', (req, res) => {
  res.json({
    count: BENCHMARK_PRESETS.length,
    presets: BENCHMARK_PRESETS
  });
});

// Retrieve a specific benchmark preset by identifier
app.get('/api/presets/:id', (req, res) => {
  const preset = getPresetById(req.params.id);
  if (!preset) {
    return res.status(404).json({ success: false, error: `Preset '${req.params.id}' not found.` });
  }
  res.json({ success: true, preset });
});

// Analyze code or diff
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, diff, presetId, targetFile } = req.body;
    const geminiApiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
    const openaiApiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;

    const result = await analyzeCode({
      code,
      diff,
      presetId,
      targetFile,
      geminiApiKey,
      openaiApiKey
    });

    res.json({
      success: true,
      analysis: result
    });
  } catch (error) {
    console.error('Error during code analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute live isolated sandbox verification
app.post('/api/verify', async (req, res) => {
  try {
    const {
      targetFile,
      buggyCode,
      patchedCode,
      patchDiff,
      testCode
    } = req.body;

    if (!buggyCode || !testCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: buggyCode and testCode are mandatory.'
      });
    }

    const verificationResult = await executeVerification({
      targetFile,
      buggyCode,
      patchedCode,
      patchDiff,
      testCode
    });

    res.json({
      success: true,
      result: verificationResult
    });
  } catch (error) {
    console.error('Error during test sandbox execution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Fetch PR from GitHub
app.post('/api/fetch-pr', async (req, res) => {
  try {
    const { prUrl } = req.body;
    if (!prUrl) {
      return res.status(400).json({ success: false, error: 'PR URL is required' });
    }

    const prData = await fetchGitHubPR(prUrl);
    res.json({
      success: true,
      data: prData
    });
  } catch (error) {
    console.error('Error fetching PR:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export GitHub verification comment
app.post('/api/github/export-comment', (req, res) => {
  try {
    const { finding, verificationResult } = req.body;
    const commentMarkdown = generateGitHubPRComment({ finding, verificationResult });
    res.json({
      success: true,
      markdown: commentMarkdown
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 [BugBuster Engine] Server listening on http://localhost:${PORT}`);
  console.log(`🛡️  Live Sandbox Engine: READY (Node.js ${process.version})`);
  console.log(`📦 Loaded ${BENCHMARK_PRESETS.length} real-world vulnerability benchmark suites.\n`);
});
