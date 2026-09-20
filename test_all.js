async function testAll() {
  const presetsRes = await fetch('http://localhost:5055/api/presets');
  const { presets } = await presetsRes.json();
  console.log('Testing ' + presets.length + ' benchmark scenarios against /api/verify...\n');

  let passedAll = true;

  for (const preset of presets) {
    const start = Date.now();
    const res = await fetch('http://localhost:5055/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetFile: preset.targetFile,
        buggyCode: preset.buggyCode,
        patchedCode: preset.patchedCode,
        patchDiff: preset.patchDiff,
        testCode: preset.testCode
      })
    });

    const data = await res.json();
    const v = data.result;
    const elapsed = Date.now() - start;

    if (!v.verified) {
      passedAll = false;
      console.log(`❌ FAIL: ${preset.id} - ${preset.title}`);
      console.log('Before stdout/err:', v.before.stdout, v.before.stderr);
      console.log('After stdout/err:', v.after.stdout, v.after.stderr);
    } else {
      console.log(`✅ [${preset.id}] ${preset.title}`);
      console.log(`   Before: ${v.before.status} (exit ${v.before.exitCode}, ${v.before.durationMs}ms)`);
      console.log(`   After:  ${v.after.status} (exit ${v.after.exitCode}, ${v.after.durationMs}ms)`);
      console.log(`   Total turnaround: ${elapsed}ms\n`);
    }
  }

  if (passedAll) {
    console.log('🎉 ALL 6 BENCHMARK SUITES VERIFIED PASS IN ISOLATED SANDBOX CHILD PROCESSES!');
  } else {
    process.exit(1);
  }
}

testAll().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
