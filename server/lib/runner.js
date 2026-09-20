import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { applyPatch } from './patcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SANDBOX_BASE = path.resolve(__dirname, '../sandbox');

/**
 * Ensures the sandbox base directory exists.
 */
async function ensureSandboxDir() {
  await fs.mkdir(SANDBOX_BASE, { recursive: true });
}

/**
 * Spawns a node process inside the specified sandbox directory with a timeout.
 */
function runSandboxProcess(sandboxDir, scriptName = 'test.js', timeoutMs = 8000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let killed = false;

    // Use node executable directly
    const child = spawn(process.execPath, [scriptName], {
      cwd: sandboxDir,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        CI: 'true'
      },
      windowsHide: true
    });

    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGKILL');
      stderr += `\n[BugBuster Runner] Process timed out after ${timeoutMs}ms (ReDoS or infinite loop detected).`;
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;
      resolve({
        exitCode: killed ? 124 : (code ?? 1),
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        durationMs,
        timedOut: killed
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        exitCode: 1,
        stdout,
        stderr: stderr + `\nProcess error: ${err.message}`,
        durationMs: Date.now() - startTime,
        timedOut: false
      });
    });
  });
}

/**
 * Executes the full Find-Fix-Verify Sandbox cycle:
 * 1. Sets up isolated workspace
 * 2. Runs reproduction test on buggy code (verifies FAIL ❌)
 * 3. Applies the surgical unified diff patch
 * 4. Re-runs reproduction test on patched code (verifies PASS ✅)
 */
export async function executeVerification({
  targetFile = 'service.js',
  buggyCode,
  patchedCode,
  patchDiff,
  testCode
}) {
  await ensureSandboxDir();

  const runId = `run_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const sandboxDir = path.join(SANDBOX_BASE, runId);

  try {
    await fs.mkdir(sandboxDir, { recursive: true });

    // Provide a localized package.json with ES module support
    await fs.writeFile(
      path.join(sandboxDir, 'package.json'),
      JSON.stringify({ type: 'module' }, null, 2),
      'utf8'
    );

    // 1. Write the initial (buggy) target file
    const targetFilePath = path.join(sandboxDir, targetFile);
    await fs.writeFile(targetFilePath, buggyCode, 'utf8');

    // Write the reproduction test file
    const testFilePath = path.join(sandboxDir, 'test.js');
    await fs.writeFile(testFilePath, testCode, 'utf8');

    // 2. PHASE 1: Run reproduction test on BUGGY code
    const beforeRun = await runSandboxProcess(sandboxDir, 'test.js', 6000);

    // 3. PHASE 2: Apply the surgical patch
    let patchApplicationError = null;
    let actualPatchedContent = patchedCode;

    if (patchDiff && !patchedCode) {
      try {
        actualPatchedContent = applyPatch(buggyCode, patchDiff);
      } catch (err) {
        patchApplicationError = err.message;
      }
    }

    if (!patchApplicationError) {
      await fs.writeFile(targetFilePath, actualPatchedContent, 'utf8');
    }

    // 4. PHASE 3: Run reproduction test on PATCHED code
    const afterRun = patchApplicationError
      ? { exitCode: 1, stdout: '', stderr: `Patch application failed: ${patchApplicationError}`, durationMs: 0 }
      : await runSandboxProcess(sandboxDir, 'test.js', 6000);

    const verified = beforeRun.exitCode !== 0 && afterRun.exitCode === 0;

    return {
      runId,
      verified,
      targetFile,
      patchApplicationError,
      before: {
        status: beforeRun.exitCode === 0 ? 'PASSED' : 'FAILED',
        exitCode: beforeRun.exitCode,
        stdout: beforeRun.stdout,
        stderr: beforeRun.stderr,
        durationMs: beforeRun.durationMs,
        timedOut: beforeRun.timedOut
      },
      after: {
        status: afterRun.exitCode === 0 ? 'PASSED' : 'FAILED',
        exitCode: afterRun.exitCode,
        stdout: afterRun.stdout,
        stderr: afterRun.stderr,
        durationMs: afterRun.durationMs,
        timedOut: afterRun.timedOut
      },
      timestamp: new Date().toISOString()
    };
  } finally {
    // Ephemeral cleanup: remove sandbox directory after execution
    try {
      await fs.rm(sandboxDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}
