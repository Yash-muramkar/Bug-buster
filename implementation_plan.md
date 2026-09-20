# BugBuster — Find. Fix. Verify.
### Track 4: Developer Tools & Open Innovation | HACK IT BROS '26

BugBuster is an autonomous AI developer assistant engineered to eliminate unverified code fixes. Traditional code review is slow and error-prone, while standard AI code assistants only offer speculative suggestions without proving they work. 

BugBuster solves this by implementing an **Autonomous Find-Fix-Verify Loop**:
1. Ingests GitHub PRs, Git Diffs, or raw code.
2. Identifies deep security vulnerabilities, concurrency flaws, and logic bugs (root cause + CWE/OWASP classification).
3. Generates an automated reproduction test that proves the bug exists (fails on unpatched code).
4. Generates a minimal surgical code patch.
5. **Executes the test suite live** in an isolated sandbox before and after the patch.
6. Presents verified proof: **FAIL ❌ Before Fix → PASS ✅ After Fix**, complete with real terminal outputs, diff viewers, and an exportable GitHub PR verification comment.

---

## User Review Required

> [!IMPORTANT]
> **No Fake Demo Compliance**: The system uses a real sandboxed Node.js / Python test runner executing live child processes on Windows. It produces real execution times, stdout, stderr, and exit codes.
> 
> **Zero-Config Live Mode + Dual LLM Engine**: Works out-of-the-box with built-in high-fidelity rule & AST analyzers + 6 pre-loaded real-world CVE/concurrency testbeds (including the challenge's featured `POST /api/auth/transfer` race condition), while also allowing instant drop-in Gemini or OpenAI API keys for live custom PR analysis.

---

## Architecture & System Design

```mermaid
flowchart TD
    A["Code Input (GitHub PR / Git Diff / Code Snippet)"] --> B["BugBuster Core Engine"]
    
    subgraph Multi-Agent Autonomous Loop
        B --> C["Red Team Agent (Vulnerability & Exploit Hunter)"]
        C --> D["Identifies Root Cause (CWE/OWASP) & Generates Failing Test"]
        D --> E["Blue Team Agent (Surgical Patch Synthesizer)"]
        E --> F["Generates Unified Diff & Validates AST"]
    end

    subgraph Verification Sandbox (No Fake Demo)
        F --> G["Test Runner Sandbox (Child Process / VM)"]
        G --> H["1. Run Test on Buggy Code -> VERIFIED FAIL ❌"]
        H --> I["2. Apply Unified Diff Patch"]
        I --> J["3. Re-run Test on Patched Code -> VERIFIED PASS ✅"]
    end

    J --> K["BugBuster Dev Dashboard & GitHub PR Badge"]
```

---

## Proposed Project Structure

Location: `d:\Bug AI`

```
bugbuster/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── bin/
│   └── bugbuster.js                 # CLI tool: `bugbuster verify <file-or-pr>`
├── server/
│   ├── index.js                     # Express API Server (port 5000)
│   ├── lib/
│   │   ├── analyzer.js              # Vulnerability detection (AST + LLM + Patterns)
│   │   ├── patcher.js               # Diff generation & application
│   │   ├── test_generator.js        # Automated reproduction test generator
│   │   ├── runner.js                # Live process sandbox & verification engine
│   │   ├── github.js                # GitHub PR fetcher & verification comment generator
│   │   └── presets.js               # 6 real-world benchmark vulnerability suites
│   └── sandbox/                     # Ephemeral sandbox directory for test executions
├── src/
│   ├── main.jsx                     # React entry point
│   ├── App.jsx                      # Main UI Controller & Navigation
│   ├── components/
│   │   ├── Header.jsx               # Hackathon branding, status & API config modal
│   │   ├── InputSection.jsx         # PR link input, git diff editor & preset selector
│   │   ├── VulnerabilityCard.jsx    # Severity, CWE badge, explanation, impact
│   │   ├── DiffViewer.jsx           # Side-by-side before/after code patch viewer
│   │   ├── ExecutionTerminal.jsx    # Live streaming ANSI terminal showing real test runs
│   │   ├── VerificationProof.jsx    # FAIL ❌ -> PASS ✅ comparison matrix & metrics
│   │   └── ExportModal.jsx          # One-click GitHub PR comment & PR creator
│   └── presets/                     # Interactive demo scenarios
└── README.md
```

---

## Core MVP & Track 4 Requirements Coverage

| Requirement | Implementation in BugBuster |
|---|---|
| **1. Accept GitHub PR / Repo link / Git diff** | GitHub API integration + raw diff parser + live paste editor + 6 instant preloaded benchmark suites |
| **2. Identify meaningful bug/security issue** | Deep AST and pattern analysis covering race conditions, prototype pollution, timing attacks, ReDoS, SQLi, and secret leaks |
| **3. Clear explanation of root cause** | Technical breakdown: Vulnerable lines, Exploit mechanics, CWE classification, Blast radius |
| **4. Generate targeted code fix / patch** | Surgical Unified Diff patch with line additions/removals and explanation |
| **5. Generate automated test case** | Standalone runnable test suite (asserts expected behavior, fails on bug, passes on fix) |
| **6. Run / execute test against patch** | Real child process execution in sandbox capturing real exit codes and stdout/stderr |
| **7. Show before/after with verified proof** | Side-by-side terminal verification logs: unpatched run (FAIL ❌) vs patched run (PASS ✅) with execution speed |

---

## 6 Real-World Preloaded Benchmark Scenarios

1. **Financial Concurrency Vulnerability (The Official Brief Scenario)**
   - Target: `POST /api/auth/transfer`
   - Issue: Missing idempotency key check + race condition in account balance deduction allowing double-spending.
   - Live Test: Fires 5 concurrent requests with 100 balance. Before: balance goes negative (-400). After: Exactly one succeeds, 4 are rejected with 409 Conflict.
2. **Express Prototype Pollution (CVE-2024 Pattern)**
   - Target: Unsanitized recursive object merge utility.
   - Live Test: Injects `__proto__.isAdmin = true`. Before: normal user escalates to admin. After: Prototype pollution blocked safely.
3. **JWT Timing Attack & Alg None Bypass**
   - Target: Token verification handler.
   - Live Test: Sends crafted unsigned token with `"alg": "none"`. Before: Auth bypasses. After: Strict signature & algorithm validation enforces rejection.
4. **Catastrophic ReDoS (Denial of Service)**
   - Target: Email regex validator with polynomial backtracking.
   - Live Test: Sends `a@` + `a`*35 + `!`. Before: Event loop blocks for 4,000ms+ (timeout). After: Fixed safe regex completes in 0.2ms.
5. **SQL Injection in Parameterized Query Construction**
   - Target: User account lookup with string concatenation.
   - Live Test: Input `' OR '1'='1`. Before: Leaks all accounts. After: Prepared statement only matches exact username.
6. **Hardcoded Secret & API Key Leakage**
   - Target: Cloud storage upload service with embedded `AKIA...` AWS secret key.
   - Live Test: Scans diff for high-entropy secrets and validates zero leakage after environment variable refactoring.

---

## Verification Plan

### Automated Tests
- Run backend verification suite: execute the sandbox runner directly via Node.js script to ensure test execution, failure capture, patch application, and pass capture work reliably.
- Test frontend build: run `npm run build` to ensure zero compilation or bundling errors.

### Live Demonstration Verification
- Start the BugBuster application on `http://localhost:5173` (with backend on `http://localhost:5000`).
- Execute all 6 benchmark scenarios end-to-end.
- Validate the live verification output: FAIL ❌ on unpatched code, PASS ✅ on patched code, with live process terminal output.
- Test custom git diff input mode.
- Test export to GitHub PR comment format.
