import { createUnifiedDiff } from './patcher.js';

export const BENCHMARK_PRESETS = [
  {
    id: 'transfer-race',
    title: 'Financial Concurrency Race Condition',
    category: 'Concurrency & Race Conditions',
    badge: 'Official Hackathon Scenario',
    cwe: 'CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization',
    owasp: 'A01:2021-Broken Access Control',
    severity: 'CRITICAL',
    targetFile: 'transferService.js',
    summary: 'Missing concurrency lock and idempotency control in account balance deduction allows double-spending and negative balances.',
    rootCause: 'In POST /api/auth/transfer, an asynchronous gap between the balance check (balance >= amount) and the deduction allows multiple concurrent requests to read the initial balance before any deduction is committed.',
    blastRadius: 'Attackers can empty accounts and generate unauthorized credit by sending burst requests simultaneously.',
    buggyCode: `// Account balances ledger
export const accounts = {
  'acc-101': { balance: 100, owner: 'Alice' },
  'acc-102': { balance: 50, owner: 'Bob' }
};

/**
 * Transfers funds from one account to another.
 * VULNERABILITY: Asynchronous balance check gap allows race conditions!
 */
export async function transfer(fromId, toId, amount) {
  const sender = accounts[fromId];
  const receiver = accounts[toId];

  if (!sender || !receiver) {
    return { success: false, error: 'Invalid account ID' };
  }

  // BUG: Multiple concurrent requests pass this check before any deduction executes
  if (sender.balance >= amount) {
    // Simulate database I/O latency
    await new Promise((resolve) => setTimeout(resolve, 35));

    sender.balance -= amount;
    receiver.balance += amount;

    return { 
      success: true, 
      transferred: amount, 
      remainingBalance: sender.balance 
    };
  }

  return { success: false, error: 'Insufficient funds' };
}
`,
    patchedCode: `// Account balances ledger
export const accounts = {
  'acc-101': { balance: 100, owner: 'Alice' },
  'acc-102': { balance: 50, owner: 'Bob' }
};

// Concurrency mutex lock map to serialize account operations
const accountLocks = new Map();

/**
 * Transfers funds from one account to another.
 * FIXED: Atomic concurrency lock prevents race condition double-spending.
 */
export async function transfer(fromId, toId, amount) {
  const sender = accounts[fromId];
  const receiver = accounts[toId];

  if (!sender || !receiver) {
    return { success: false, error: 'Invalid account ID' };
  }

  // Acquire concurrency lock for the sender account
  while (accountLocks.get(fromId)) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  accountLocks.set(fromId, true);

  try {
    // Re-verify balance strictly inside atomic critical section
    if (sender.balance >= amount) {
      await new Promise((resolve) => setTimeout(resolve, 35));

      sender.balance -= amount;
      receiver.balance += amount;

      return { 
        success: true, 
        transferred: amount, 
        remainingBalance: sender.balance 
      };
    }

    return { success: false, error: 'Insufficient funds' };
  } finally {
    // Always release lock
    accountLocks.delete(fromId);
  }
}
`,
    testCode: `import assert from 'node:assert';
import { transfer, accounts } from './transferService.js';

async function runTest() {
  console.log('⚡ Starting Concurrency Double-Spend Verification Suite');
  console.log('Initial Alice Balance: $' + accounts['acc-101'].balance);
  console.log('Attempting 5 concurrent transfers of $40 (Total requested: $200 against $100 balance)...');

  const requests = [
    transfer('acc-101', 'acc-102', 40),
    transfer('acc-101', 'acc-102', 40),
    transfer('acc-101', 'acc-102', 40),
    transfer('acc-101', 'acc-102', 40),
    transfer('acc-101', 'acc-102', 40)
  ];

  const results = await Promise.all(requests);
  const successCount = results.filter(r => r.success).length;
  const finalBalance = accounts['acc-101'].balance;

  console.log('Results summary: ' + successCount + ' transfers succeeded.');
  console.log('Final Alice Balance: $' + finalBalance);

  // Assertion 1: Balance must NEVER go below zero
  assert(finalBalance >= 0, 'FAIL: Account balance went negative ($' + finalBalance + ')! Race condition double-spend exploited.');

  // Assertion 2: Only at most 2 transfers of $40 can succeed from $100
  assert(successCount <= 2, 'FAIL: Overdraft occurred: ' + successCount + ' transfers succeeded totaling $' + (successCount * 40));

  console.log('✅ VERIFIED PASS: Concurrency guard successfully prevented double-spend overdraft.');
}

runTest();
`
  },
  {
    id: 'prototype-pollution',
    title: 'Express Recursive Prototype Pollution',
    category: 'Object Injection & Privilege Escalation',
    badge: 'CVE-2024 Pattern',
    cwe: 'CWE-1321: Improperly Controlled Modification of Object Prototype Attributes',
    owasp: 'A03:2021-Injection',
    severity: 'CRITICAL',
    targetFile: 'mergeUtil.js',
    summary: 'Unsanitized recursive object merge utility allows injecting properties directly into global Object.prototype.',
    rootCause: 'The merge function copies user-controlled JSON keys recursively without checking for "__proto__", "constructor", or "prototype" properties.',
    blastRadius: 'Remote attackers can poison Object.prototype, altering application logic, bypassing authorization checks, or triggering RCE.',
    buggyCode: `/**
 * Deep merges properties from source into target.
 * VULNERABILITY: Does not filter __proto__ or constructor keys!
 */
export function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      // BUG: Target[key] when key is __proto__ mutates Object.prototype directly
      target[key] = source[key];
    }
  }
  return target;
}
`,
    patchedCode: `// Blacklist dangerous prototype alteration properties
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Deep merges properties from source into target.
 * FIXED: Sanitizes dangerous prototype keys before merging.
 */
export function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    // Defense: strictly reject dangerous prototype pollution keys
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }

    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
`,
    testCode: `import assert from 'node:assert';
import { deepMerge } from './mergeUtil.js';

function runTest() {
  console.log('🧪 Starting Prototype Pollution Security Suite');

  // Craft malicious payload targeting Object.prototype
  const maliciousPayload = JSON.parse('{"__proto__": {"isAdmin": true, "role": "superadmin"}}');
  const target = {};

  console.log('Merging user configuration payload into empty target object...');
  deepMerge(target, maliciousPayload);

  // Probe fresh, untouched object
  const freshUser = {};
  console.log('Testing fresh clean object property: freshUser.isAdmin = ' + freshUser.isAdmin);

  // Assertion: Object.prototype must NOT be polluted
  assert.strictEqual(
    freshUser.isAdmin, 
    undefined, 
    'FAIL: Prototype pollution succeeded! Unprivileged objects now inherit { isAdmin: true }.'
  );

  console.log('✅ VERIFIED PASS: Prototype pollution safely blocked; Object.prototype remains clean.');
}

runTest();
`
  },
  {
    id: 'jwt-timing-attack',
    title: 'JWT "alg": "none" Signature Bypass',
    category: 'Authentication & Cryptography',
    badge: 'Auth Bypass',
    cwe: 'CWE-347: Improper Verification of Cryptographic Signature',
    owasp: 'A07:2021-Identification and Authentication Failures',
    severity: 'HIGH',
    targetFile: 'authValidator.js',
    summary: 'JWT token verification algorithm accepts unsigned tokens with alg: "none" and uses non-constant time comparison.',
    rootCause: 'The validator parses the algorithm specified in the token header without enforcing an explicit whitelist of cryptographic algorithms.',
    blastRadius: 'Attackers can forge arbitrary administrative tokens without possessing the server HMAC secret.',
    buggyCode: `import crypto from 'node:crypto';

const SECRET = 'company-super-secret-key-2026';

/**
 * Validates a JWT token.
 * VULNERABILITY: Accepts alg: "none" and compares signatures naively.
 */
export function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  const signature = parts[2] || '';

  // BUG: Permitting "none" algorithm allows unsigned forged tokens!
  if (header.alg === 'none') {
    return payload;
  }

  // BUG: Naive string equality is vulnerable to timing attacks
  const expectedSig = crypto.createHmac('sha256', SECRET)
    .update(\`\${parts[0]}.\${parts[1]}\`)
    .digest('base64url');

  if (signature === expectedSig) {
    return payload;
  }

  return null;
}
`,
    patchedCode: `import crypto from 'node:crypto';

const SECRET = 'company-super-secret-key-2026';
const ALLOWED_ALGORITHMS = new Set(['HS256']);

/**
 * Validates a JWT token.
 * FIXED: Enforces strict algorithm whitelist and timing-safe signature comparison.
 */
export function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let header, payload;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch (err) {
    return null;
  }

  // FIXED: Explicitly reject "none" and enforce allowed algorithms
  if (!ALLOWED_ALGORITHMS.has(header.alg)) {
    return null;
  }

  const expectedSig = crypto.createHmac('sha256', SECRET)
    .update(\`\${parts[0]}.\${parts[1]}\`)
    .digest('base64url');

  const sigBuf = Buffer.from(parts[2]);
  const expectedBuf = Buffer.from(expectedSig);

  // FIXED: Timing-safe buffer comparison prevents timing attacks
  if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return payload;
  }

  return null;
}
`,
    testCode: `import assert from 'node:assert';
import { verifyToken } from './authValidator.js';

function runTest() {
  console.log('🧪 Starting JWT Security & Signature Verification Suite');

  // Craft a forged unsigned token with alg: "none" requesting admin role
  const forgedHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const forgedPayload = Buffer.from(JSON.stringify({ sub: 'attacker', role: 'superadmin' })).toString('base64url');
  const forgedToken = \`\${forgedHeader}.\${forgedPayload}.\`;

  console.log('Sending forged token with alg: "none" to verifyToken()...');
  const result = verifyToken(forgedToken);

  console.log('Verification result: ', result);

  // Assertion: Forged token must be rejected (return null)
  assert.strictEqual(
    result, 
    null, 
    'FAIL: Unsigned "none" algorithm token was accepted as valid!'
  );

  console.log('✅ VERIFIED PASS: Unsigned "none" token strictly rejected.');
}

runTest();
`
  },
  {
    id: 'redos-attack',
    title: 'Catastrophic Regular Expression DoS (ReDoS)',
    category: 'Denial of Service',
    badge: 'Algorithmic Complexity',
    cwe: 'CWE-1333: Inefficient Regular Expression Complexity',
    owasp: 'A05:2021-Security Misconfiguration',
    severity: 'MEDIUM',
    targetFile: 'emailValidator.js',
    summary: 'Email validation regular expression contains nested overlapping quantifiers causing polynomial/exponential backtracking.',
    rootCause: 'The regex pattern ^([a-zA-Z0-9_.-]+)+@... causes the regex engine to explore thousands of permutation paths when given trailing mismatch characters.',
    blastRadius: 'A single unauthenticated request can freeze the Node.js event loop for seconds, crashing the server for all other users.',
    buggyCode: `/**
 * Validates user email address.
 * VULNERABILITY: Nested repetition (+ inside +) causes catastrophic backtracking!
 */
const VULNERABLE_REGEX = /^([a-zA-Z0-9_.-]+)+@([a-zA-Z0-9_.-]+)\\.([a-zA-Z]{2,6})$/;

export function validateEmail(email) {
  return VULNERABLE_REGEX.test(email);
}
`,
    patchedCode: `/**
 * Validates user email address.
 * FIXED: Linear-time regex without overlapping nested quantifiers.
 */
const SAFE_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$/;

export function validateEmail(email) {
  // Guard length to prevent oversized payloads
  if (typeof email !== 'string' || email.length > 254) {
    return false;
  }
  return SAFE_REGEX.test(email);
}
`,
    testCode: `import assert from 'node:assert';
import { validateEmail } from './emailValidator.js';

function runTest() {
  console.log('🧪 Starting ReDoS Resilience Verification Suite');

  // Payload with 30 characters that causes exponential backtracking in buggy regex
  const evilPayload = 'a'.repeat(30) + '!';

  console.log('Testing payload: ' + evilPayload.slice(0, 10) + '... (' + evilPayload.length + ' chars)');
  const startTime = Date.now();
  const result = validateEmail(evilPayload);
  const elapsedMs = Date.now() - startTime;

  console.log('Validation elapsed time: ' + elapsedMs + 'ms');

  // Assertion: Validation must reject evil string and complete in under 50ms
  assert.strictEqual(result, false, 'Invalid email must return false');
  assert(
    elapsedMs < 50, 
    'FAIL: ReDoS triggered! Execution took ' + elapsedMs + 'ms (threshold: 50ms).'
  );

  console.log('✅ VERIFIED PASS: Execution completed in ' + elapsedMs + 'ms without event loop stall.');
}

runTest();
`
  },
  {
    id: 'sqli-param-pollution',
    title: 'SQL Injection in Query Builder',
    category: 'Injection Vulnerabilities',
    badge: 'SQLi',
    cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    owasp: 'A03:2021-Injection',
    severity: 'HIGH',
    targetFile: 'userSearch.js',
    summary: 'Raw string concatenation in SQL query allows user input to break out of query logic and bypass filters.',
    rootCause: 'Values from request query parameters are directly interpolated into the SQL string without parameterized placeholders.',
    blastRadius: 'Attackers can bypass authentication, view hidden records, or extract entire database tables.',
    buggyCode: `// Simulated database table
const DB_USERS = [
  { id: 1, username: 'admin', active: true, role: 'superadmin' },
  { id: 2, username: 'charlie', active: false, role: 'suspended' },
  { id: 3, username: 'alice', active: true, role: 'user' }
];

/**
 * Executes user lookup query.
 * VULNERABILITY: Raw string concatenation of user input into SQL syntax!
 */
export function findActiveUser(username) {
  // BUG: String concatenation allows SQL injection syntax
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND active = 1";
  
  // Simulated SQL engine evaluation
  if (username.includes("' OR '1'='1") || username.includes("' OR 1=1")) {
    // Injected clause returns all users regardless of active status
    return DB_USERS;
  }

  return DB_USERS.filter(u => u.username === username && u.active);
}
`,
    patchedCode: `// Simulated database table
const DB_USERS = [
  { id: 1, username: 'admin', active: true, role: 'superadmin' },
  { id: 2, username: 'charlie', active: false, role: 'suspended' },
  { id: 3, username: 'alice', active: true, role: 'user' }
];

/**
 * Executes user lookup query.
 * FIXED: Uses parameterized binding to treat input strictly as a literal value.
 */
export function findActiveUser(username) {
  // FIXED: Parameterized query structure
  const queryPlan = {
    sql: 'SELECT * FROM users WHERE username = ? AND active = ?',
    params: [username, 1]
  };

  // Safe evaluation treating username as strict literal string
  return DB_USERS.filter(u => u.username === queryPlan.params[0] && u.active === Boolean(queryPlan.params[1]));
}
`,
    testCode: `import assert from 'node:assert';
import { findActiveUser } from './userSearch.js';

function runTest() {
  console.log('🧪 Starting SQL Injection Exploit Verification Suite');

  const attackPayload = "admin' OR '1'='1";
  console.log("Injecting payload: " + attackPayload);

  const results = findActiveUser(attackPayload);
  console.log("Returned records count: " + results.length);

  // Assertion: The payload must NOT match all users; it should return 0 records because no user has that literal username
  assert.strictEqual(
    results.length,
    0,
    'FAIL: SQL Injection succeeded! Query returned ' + results.length + ' records including unauthorized rows.'
  );

  console.log('✅ VERIFIED PASS: Query was safely parameterized. 0 unauthorized rows returned.');
}

runTest();
`
  },
  {
    id: 'secret-leakage',
    title: 'Hardcoded Cloud Credentials Leak',
    category: 'Secrets & Supply Chain',
    badge: 'Secret Detection',
    cwe: 'CWE-798: Use of Hard-coded Credentials',
    owasp: 'A07:2021-Identification and Authentication Failures',
    severity: 'HIGH',
    targetFile: 's3Client.js',
    summary: 'Cloud storage client contains embedded AWS secret access keys rather than loading from environment variables.',
    rootCause: 'Static AWS credential constants are checked into source code instead of using environment configuration.',
    blastRadius: 'Exposes private cloud buckets, internal company data, and triggers high-cost unauthorized resource usage.',
    buggyCode: `/**
 * AWS S3 Storage Client Configuration.
 * VULNERABILITY: Hardcoded production secret keys!
 */
export const s3Config = {
  region: 'us-east-1',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  // BUG: Production secret key committed directly into repository!
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  bucket: 'production-assets-bucket'
};

export function getCredentials() {
  return s3Config;
}
`,
    patchedCode: `/**
 * AWS S3 Storage Client Configuration.
 * FIXED: Loads credentials from environment variables with startup guard.
 */
export function getCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials in environment (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)');
  }

  return {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId,
    secretAccessKey,
    bucket: process.env.AWS_BUCKET_NAME || 'production-assets-bucket'
  };
}
`,
    testCode: `import assert from 'node:assert';
import fs from 'node:fs';

function runTest() {
  console.log('🧪 Starting Hardcoded Secret Leakage Audit Suite');

  const fileContent = fs.readFileSync(new URL('./s3Client.js', import.meta.url), 'utf8');

  // Check for raw secret key pattern in source code
  const hasHardcodedKey = /wJalrXUtnFEMI\\/K7MDENG\\/bPxRfiCYEXAMPLEKEY/.test(fileContent);
  const hasHardcodedId = /AKIAIOSFODNN7EXAMPLE/.test(fileContent);

  console.log('Static code scan result: hardcoded secret present = ' + (hasHardcodedKey || hasHardcodedId));

  assert(
    !hasHardcodedKey && !hasHardcodedId, 
    'FAIL: Hardcoded AWS secret credentials detected in source file!'
  );

  console.log('✅ VERIFIED PASS: Zero hardcoded secrets detected. Configuration requires environment variables.');
}

runTest();
`
  }
];

// Pre-calculate patch diffs for all benchmark presets
BENCHMARK_PRESETS.forEach(preset => {
  preset.patchDiff = createUnifiedDiff(preset.targetFile, preset.buggyCode, preset.patchedCode);
});

export function getPresetById(id) {
  return BENCHMARK_PRESETS.find(p => p.id === id);
}
