#!/usr/bin/env node
import chalk from 'chalk';
import { BENCHMARK_PRESETS, getPresetById } from '../server/lib/presets.js';
import { executeVerification } from '../server/lib/runner.js';
import { generateGitHubPRComment } from '../server/lib/github.js';

const args = process.argv.slice(2);
const command = args[0] || 'verify';
const targetId = args[1] || 'transfer-race';

async function main() {
  console.log(chalk.bold.cyan('\n======================================================'));
  console.log(chalk.bold.cyan('  🛡️  BugBuster CLI — Find. Fix. Verify.'));
  console.log(chalk.bold.dim('  Track 4: Developer Tools & Open Innovation | Hackathon'));
  console.log(chalk.bold.cyan('======================================================\n'));

  if (command === 'list') {
    console.log(chalk.bold.yellow('Available Benchmark Suites:'));
    BENCHMARK_PRESETS.forEach((p, idx) => {
      console.log(`  ${chalk.cyan(idx + 1)}. [${chalk.bold.green(p.id)}] ${chalk.white(p.title)} (${chalk.dim(p.cwe)})`);
    });
    console.log(`\nRun verification using: ${chalk.cyan('node bin/bugbuster.js verify <preset-id>')}\n`);
    return;
  }

  const preset = getPresetById(targetId) || BENCHMARK_PRESETS[0];

  console.log(chalk.bold.white(`Target Benchmark: `) + chalk.yellow.bold(preset.title));
  console.log(chalk.bold.white(`Classification:   `) + chalk.magenta(preset.cwe));
  console.log(chalk.bold.white(`Severity:         `) + chalk.red.bold(preset.severity));
  console.log(chalk.bold.white(`Target File:      `) + chalk.cyan(preset.targetFile));
  console.log(chalk.dim(`\nRoot Cause: ${preset.rootCause}\n`));

  console.log(chalk.bold.yellow('⏳ [Phase 1] Executing reproduction test on UNPATCHED code...'));
  
  const result = await executeVerification({
    targetFile: preset.targetFile,
    buggyCode: preset.buggyCode,
    patchedCode: preset.patchedCode,
    patchDiff: preset.patchDiff,
    testCode: preset.testCode
  });

  console.log(chalk.dim('--- Terminal Output (Before Fix) ---'));
  console.log(result.before.stdout || '');
  console.log(chalk.red(result.before.stderr || ''));
  console.log(chalk.bold.red(`❌ Unpatched Test Result: ${result.before.status} (Exit Code ${result.before.exitCode}) [${result.before.durationMs}ms]`));

  console.log(chalk.bold.yellow('\n⏳ [Phase 2] Applying surgical Unified Diff patch...'));
  console.log(chalk.dim(preset.patchDiff.slice(0, 300) + '...'));

  console.log(chalk.bold.yellow('\n⏳ [Phase 3] Executing reproduction test on PATCHED code...'));
  console.log(chalk.dim('--- Terminal Output (After Fix) ---'));
  console.log(chalk.green(result.after.stdout || ''));
  if (result.after.stderr) console.log(chalk.red(result.after.stderr));
  console.log(chalk.bold.green(`✅ Patched Test Result:   ${result.after.status} (Exit Code ${result.after.exitCode}) [${result.after.durationMs}ms]`));

  console.log(chalk.bold.cyan('\n======================================================'));
  if (result.verified) {
    console.log(chalk.bold.bgGreen.black('  VERIFICATION PROOF: PASS ✅  '));
    console.log(chalk.green('  Vulnerability successfully reproduced and surgical fix verified in real sandbox.'));
  } else {
    console.log(chalk.bold.bgRed.white('  VERIFICATION PROOF: FAILED ❌  '));
  }
  console.log(chalk.bold.cyan('======================================================\n'));

  if (args.includes('--export') || args.includes('-e')) {
    const prComment = generateGitHubPRComment({ finding: preset, verificationResult: result });
    console.log(chalk.bold.yellow('📋 Generated GitHub PR Verification Markdown Comment:\n'));
    console.log(prComment);
    console.log('\n');
  }
}

main().catch(err => {
  console.error(chalk.red('Fatal CLI Error:'), err);
  process.exit(1);
});
