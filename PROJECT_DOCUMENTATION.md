# 🛡️ BugBuster — Complete Technical Architecture & Project Documentation
### Track 4: Developer Tools & Open Innovation | HACK IT BROS '26

---

## 📋 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Core Philosophy: Zero Fake Demos](#2-core-philosophy-zero-fake-demos)
3. [System Architecture & Workflow](#3-system-architecture--workflow)
4. [Complete Tech Stack & Dependencies](#4-complete-tech-stack--dependencies)
5. [The 4-Stage Autonomous Pipeline](#5-the-4-stage-autonomous-pipeline)
6. [6 Preloaded Benchmark Testbeds (Detailed Root Causes & Proofs)](#6-6-preloaded-benchmark-testbeds)
7. [External GitHub Repository & PR Ingestion Engine](#7-external-github-repository--pr-ingestion-engine)
8. [Frontend Design System & UI Architecture](#8-frontend-design-system--ui-architecture)
9. [CLI Terminal Tool & Export System](#9-cli-terminal-tool--export-system)
10. [Cloud Deployment Architecture (Vercel + Serverless)](#10-cloud-deployment-architecture-vercel--serverless)
11. [Verification Commands & Multi-Agent Evaluation Guide](#11-verification-commands--multi-agent-evaluation-guide)

---

## 1. Executive Summary & Problem Statement

Modern software development relies heavily on AI coding assistants (GitHub Copilot, Cursor, ChatGPT, Claude). However, current tools suffer from a critical flaw: **Unverified Speculative Fixes**. 

When presented with complex security vulnerabilities or subtle logic defects (such as asynchronous race conditions, prototype pollution, or deserialization flaws), standard AI assistants generate patches based purely on statistical token prediction. Developers are left to blindly trust the suggestion or spend hours manually writing tests to verify that:
1. The bug actually existed in the first place.
2. The patch actually fixes the root cause without introducing regressions.

### The Solution: BugBuster
**BugBuster** is an autonomous AI developer assistant that eliminates speculative suggestions by implementing a closed, live **Find-Fix-Verify Loop**:
- It ingests code from GitHub PRs, public repositories, or direct input.
- It identifies the exact root cause and categorizes it under industry-standard CWE and OWASP standards.
- It writes an automated **reproduction test suite** that actively reproduces the failure (**FAIL ❌ / Exit Code 1**).
- It generates a surgical, minimal **Unified Git Diff patch**.
- It executes the test suite against the patched code in an isolated host sandbox (**PASS ✅ / Exit Code 0**).
- It exports a tamper-evident audit report formatted for GitHub Pull Request discussions.

---

## 2. Core Philosophy: Zero Fake Demos

Hackathon prototypes often fake terminal outputs using `setTimeout`, hardcoded strings, or mocked responses. **BugBuster strictly adheres to genuine execution**:
- **Real OS Process Spawning:** Executes `node:child_process` (`spawn`) directly on the host system (or `/tmp` on serverless platforms).
- **Ephemeral Sandbox Isolation:** Creates isolated directories (`server/sandbox/run_<timestamp>_<random>/`) with dedicated `package.json` configurations.
- **Authentic Telemetry:** Displays true operating system exit codes (`0`, `1`, `124`), process execution runtimes in milliseconds, real `stdout` streams, and stack trace `stderr`.
- **Automatic Cleanup:** Ephemeral sandbox directories are wiped immediately upon test conclusion to prevent storage leaks.

---

## 3. System Architecture & Workflow

```
                        ┌─────────────────────────────────────────┐
                        │        Ingestion Entry Points           │
                        │  • 6 Benchmark Scenarios (Preloaded)    │
                        │  • GitHub PR URL (e.g. /pull/482)       │
                        │  • GitHub Repo URL (e.g. /user/repo)    │
                        │  • Custom User Code / Git Diff          │
                        └────────────────────┬────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │      AST & Heuristic Analysis Engine     │
                        │  • Vulnerability Pattern Matching       │
                        │  • CWE / OWASP Formal Classification    │
                        │  • Optional Gemini 1.5 Flash API Hook   │
                        └────────────────────┬────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          ┌───────────────────────────┐               ┌───────────────────────────┐
          │ Autonomous Test Generator │               │  Surgical Patcher Engine  │
          │ Generates standalone      │               │ Generates minimal Unified │
          │ node:assert test.js suite │               │ Git Diff (.diff)          │
          └────────────┬──────────────┘               └─────────────┬─────────────┘
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │  Host Child Process Sandbox Environment │
                        │  (server/sandbox/run_* or /tmp/*)       │
                        ├─────────────────────────────────────────┤
                        │ PHASE 1: Run test.js on Unpatched Code  │
                        │ ➔ Verifies FAIL ❌ (OS Exit Code 1)     │
                        │                                         │
                        │ PHASE 2: Apply Unified Diff Patch       │
                        │ ➔ diff.applyPatch()                     │
                        │                                         │
                        │ PHASE 3: Run test.js on Patched Code    │
                        │ ➔ Verifies PASS ✅ (OS Exit Code 0)     │
                        └────────────────────┬────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │         Audit & Proof Delivery          │
                        │  • Clean Light UI Verification Matrix   │
                        │  • Unified Diff Viewer (Add/Del Colors) │
                        │  • Live Process Terminal Console        │
                        │  • One-Click GitHub PR Comment Exporter │
                        │  • BugBuster CLI Output (--export)      │
                        └─────────────────────────────────────────┘
```

---

## 4. Complete Tech Stack & Dependencies

### Frontend (`src/`)
- **React 19 (`react`, `react-dom`):** Latest concurrent rendering engine for responsive UI state management.
- **Vite 6 (`vite`, `@vitejs/plugin-react`):** Ultra-fast ESM development and production bundler (sub-2 second build).
- **Lucide React (`lucide-react`):** Clean, accessible developer icons (`ShieldCheck`, `Bug`, `GitPullRequest`, `Terminal`, `Copy`, etc.).
- **Vanilla CSS Design System (`src/index.css`):**
  - High-contrast, clean **Light Theme** (slate `#f8fafc` background, pure white `#ffffff` cards, subtle slate borders `#e2e8f0`).
  - Font Stack: Variable Google Fonts (**Inter** for UI, **JetBrains Mono** for code and terminal telemetry).
  - Eliminates bulky UI frameworks (no Tailwind compilation overhead).

### Backend (`server/`)
- **Node.js (v18+ / v25+):** Native child process execution and file system manipulation.
- **Express 4 (`express`):** High-performance RESTful API microservice.
- **CORS (`cors`):** Cross-Origin Resource Sharing middleware for Vite proxy and cloud calls.
- **Diff (`diff`):** Industrial-standard RFC unified diff generation and patch application.
- **Chalk 5 (`chalk`):** Terminal ANSI color formatting for the CLI tool.
- **Dotenv (`dotenv`):** Environment variable configuration.

### Infrastructure & Cloud
- **Vercel Serverless Architecture:**
  - `api/index.js`: Serverless handler routing `/api/*` to Express.
  - `vercel.json`: Clean routing rewrites for Single Page Application and Serverless API.
  - Temporary Writable Directory: Dynamic adaptation to `os.tmpdir()` in cloud environments.

---

## 5. The 4-Stage Autonomous Pipeline

### Stage 1: Ingest & Vulnerability Classification
- Ingests code or diffs from repositories, pull requests, or presets.
- Classifies vulnerabilities using exact Common Weakness Enumeration (CWE) and OWASP Top 10 mappings.
- Pinpoints technical root causes and estimates blast radius.

### Stage 2: Reproduction Test Synthesis
- Generates a standalone, deterministic reproduction test suite (`test.js`).
- Uses native `node:assert` assertions.
- Sets strict boundary invariants (e.g., account balance must never be negative, prototype must not have unauthorized keys, email regex must resolve within bounds).

### Stage 3: Surgical Patch Application
- Generates a minimal, non-breaking Unified Git Diff targeting strictly the vulnerable lines.
- Employs `diff.applyPatch` to write modifications cleanly to disk.
- Avoids full-file rewrites, preserving existing architectural formatting.

### Stage 4: Live Isolated Sandbox Proof
- Ephemeral workspace generation with `package.json` (`"type": "module"`).
- Spawns Node.js child process with timeout protection (guards against infinite loops and ReDoS attacks).
- Verifies that unpatched code exits with code `1` and patched code exits with code `0`.

---

## 6. 6 Preloaded Benchmark Testbeds

### 1. Financial Concurrency Race Condition (The Official Brief)
- **Target File:** `transferService.js`
- **CWE:** `CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization`
- **OWASP:** `A01:2021-Broken Access Control`
- **Severity:** `CRITICAL`
- **Root Cause:** In `POST /api/auth/transfer`, an asynchronous latency gap exists between balance verification (`balance >= amount`) and balance deduction.
- **Exploit:** 5 simultaneous requests of $40 each against an initial $100 balance. In the unpatched code, all 5 pass the balance check before any deduction commits, dropping Alice's balance to **-$100** (double-spending).
- **Fix:** Implements an atomic mutex account lock (`accountLocks.set(fromId, true)`) and re-checks balance inside the critical section.
- **Live Proof:** Unpatched run **FAILS (Exit 1)** on assertion `balance >= 0`. Patched run **PASSES (Exit 0)**, serializing transfers to allow only 2 deductions ($80 total), leaving Alice with $20.

---

### 2. Express Recursive Prototype Pollution
- **Target File:** `mergeUtil.js` (CVE-2024 Pattern)
- **CWE:** `CWE-1321: Improperly Controlled Modification of Object Prototype Attributes`
- **OWASP:** `A03:2021-Injection`
- **Severity:** `HIGH`
- **Root Cause:** Recursive `deepMerge` processes untrusted JSON payloads without filtering `__proto__`, `constructor`, or `prototype` property keys.
- **Exploit:** Malicious payload `{ "__proto__": { "isAdmin": true } }` pollutes the global `Object.prototype`.
- **Fix:** Defensive guard skips dangerous prototype keys (`if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;`).
- **Live Proof:** Unpatched run **FAILS (Exit 1)** when `{}.isAdmin === true`. Patched run **PASSES (Exit 0)**, confirming prototype integrity.

---

### 3. JWT "alg": "none" Signature Bypass
- **Target File:** `authValidator.js`
- **CWE:** `CWE-347: Improper Verification of Cryptographic Signature`
- **OWASP:** `A02:2021-Cryptographic Failures`
- **Severity:** `HIGH`
- **Root Cause:** The authentication validator accepts the token algorithm header directly from client input and bypasses signature verification when `alg === 'none'`.
- **Exploit:** Forged token with payload `{ "user": "admin", "role": "superuser" }` signed with `alg: none` grants admin access.
- **Fix:** Enforces a strict algorithm whitelist (`HS256`, `RS256`) and validates signatures using constant-time `crypto.timingSafeEqual`.
- **Live Proof:** Unpatched run **FAILS (Exit 1)** by accepting unsigned tokens. Patched run **PASSES (Exit 0)**, rejecting unsigned tokens with `Error: Insecure JWT algorithm`.

---

### 4. Catastrophic Regular Expression DoS (ReDoS)
- **Target File:** `emailValidator.js`
- **CWE:** `CWE-1333: Inefficient Regular Expression Complexity`
- **OWASP:** `A05:2021-Security Misconfiguration`
- **Severity:** `MEDIUM`
- **Root Cause:** Nested exponential quantifier `/^([a-zA-Z0-9]+)+@([a-zA-Z0-9]+)+\.([a-zA-Z]+)+$/` exhibits $O(2^n)$ backtracking on non-matching inputs.
- **Exploit:** Attack payload `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!@example.com"` locks the Node.js event loop for over 5,000ms.
- **Fix:** Replaced with linear $O(n)$ regular expression and an upfront 254-character boundary guard (`RFC 5321`).
- **Live Proof:** Unpatched run **FAILS (Exit 124 / Timeout)** after 6,000ms. Patched run **PASSES (Exit 0)** in <1ms.

---

### 5. SQL Injection in Query Builder
- **Target File:** `userSearch.js`
- **CWE:** `CWE-89: Improper Neutralization of Special Elements used in an SQL Command`
- **OWASP:** `A03:2021-Injection`
- **Severity:** `HIGH`
- **Root Cause:** Raw string concatenation `SELECT * FROM users WHERE username = '` + `username` + `' AND active = 1`.
- **Exploit:** Input `admin' OR '1'='1` breaks query syntax and returns all rows regardless of `active` status.
- **Fix:** Parameterized query binding (`sql: '... WHERE username = ? AND active = ?', params: [username, 1]`).
- **Live Proof:** Unpatched run **FAILS (Exit 1)** returning unauthorized records. Patched run **PASSES (Exit 0)** with 0 records returned.

---

### 6. Hardcoded Cloud Credentials Leak
- **Target File:** `s3Client.js`
- **CWE:** `CWE-798: Use of Hard-coded Credentials`
- **OWASP:** `A07:2021-Identification and Authentication Failures`
- **Severity:** `HIGH`
- **Root Cause:** Hardcoded AWS access key ID and secret access key committed directly into source code.
- **Exploit:** Repository scanners and adversaries can scrape production credentials and extract private cloud storage.
- **Fix:** Refactored to load from environment variables (`process.env.AWS_ACCESS_KEY_ID`) with startup guard checks.
- **Live Proof:** Unpatched run **FAILS (Exit 1)** on regex credential scan. Patched run **PASSES (Exit 0)** with zero hardcoded credentials detected.

---

## 7. External GitHub Repository & PR Ingestion Engine

BugBuster features an autonomous ingestion engine for external repositories and pull requests:

### Repository Ingestion (Case Study: `gold-prediction-ml-model`)
- **URL Tested:** `https://github.com/Yash-muramkar/gold-prediction-ml-model`
- **Target File Detection:** Inspects repository tree via GitHub API (or raw branch fallbacks) to detect primary application logic (e.g. `app.py`).
- **Vulnerability Identified:** **Insecure ML Model Deserialization & Missing Checksum Guard** (`CWE-502`, `OWASP A08`).
- **Root Cause:** Direct `joblib.load()` parses pickled model weights without cryptographic checksum verification (SHA-256), creating a remote code execution vector.
- **Autonomous Fix:** Injects integrity validation guard comments and cryptographic validation scaffolding.
- **Live Verification:** Standalone reproduction test verifies absence of guard (**FAIL ❌**) and confirms guard injection (**PASS ✅**).

### Pull Request Ingestion
- Ingests public pull request diffs (e.g., `https://github.com/owner/repo/pull/123`).
- Parses unified diff hunks, detects modifications, extracts affected files, and runs the Find-Fix-Verify cycle on incoming PR changes.

---

## 8. Frontend Design System & UI Architecture

The frontend is structured in a linear, 3-step developer workflow:

1. **Header (`Header.jsx`):**
   - Brand logo and Hackathon track identifier.
   - Dynamic health indicator: `🟢 Sandbox Online (Node v25.8.0)`.
   - "How It Works" guide modal and API settings triggers.
2. **Step-by-Step Guidance Stepper:**
   - Visual progress tracker: Step 1 (Choose Scenario) ➔ Step 2 (Run Live Proof) ➔ Step 3 (Verify Fail/Pass & Export).
3. **Preset Scenario Selector (`PresetSelector.jsx`):**
   - 6 clean white cards with severity tags (`CRITICAL`, `HIGH`, `MEDIUM`), CWE codes, and active emerald selection borders.
4. **Target Code & Ingestion Panel (`InputPanel.jsx`):**
   - 3 tabs: **Preloaded Scenario**, **Ingest GitHub PR / Repo**, and **Custom Code / Diff**.
   - Quick sample chips for instant 1-click loading.
   - Primary Action Button: **`▶ RUN LIVE SANDBOX PROOF`**.
5. **Live Verification Proof Card (`VerificationProof.jsx`):**
   - Side-by-side comparison matrix:
     - **Left (Soft Red `#fef2f2`):** Unpatched Reproduction Test — `EXIT 1 ❌ (PROVEN VULNERABILITY)`.
     - **Right (Soft Green `#f0fdf4`):** Patched Code Sandbox — `EXIT 0 ✅ (VERIFIED RESOLUTION)`.
   - Displays exact child process execution turnaround in milliseconds.
6. **Inspector Panels:**
   - **Vulnerability Breakdown (`VulnerabilityCard.jsx`):** Root cause analysis and blast radius assessment.
   - **Unified Diff Viewer (`DiffViewer.jsx`):** Line additions (`+` green) and deletions (`-` red) with full-file toggle.
   - **Live Execution Terminal (`ExecutionTerminal.jsx`):** Developer console streaming child process `stdout` and `stderr`.
7. **Modals:**
   - **Export Modal (`ExportModal.jsx`):** Formats complete verification reports into GitHub PR markdown with status badges.
   - **Settings Modal (`SettingsModal.jsx`):** Optional Google Gemini API key configuration.
   - **Guide Modal (`GuideModal.jsx`):** 4-stage pipeline architectural diagram.

---

## 9. CLI Terminal Tool & Export System

BugBuster includes a dedicated command-line interface:

```bash
# Verify the Hackathon financial concurrency race condition
npm run cli verify transfer-race

# Verify and print exportable GitHub PR Markdown comment
npm run cli verify transfer-race -- --export

# List all available benchmark scenarios
npm run cli list
```

### Exportable PR Comment Output
When verification completes, BugBuster generates an audit comment ready to paste into GitHub PR discussions:

```markdown
## ![BugBuster](https://img.shields.io/badge/BugBuster-VERIFIED%20PASS%20%E2%9C%85-10b981?style=for-the-badge&logo=github)
### 🛡️ Autonomous Find-Fix-Verify Security Report
> Verified by **BugBuster AI Developer Assistant** | HACK IT BROS '26

| Metric | Before Fix (Unpatched) | After Fix (Patched) |
|---|---|---|
| **Test Status** | **❌ FAIL** | **✅ PASS** |
| **Exit Code** | `1` | `0` |
| **Duration** | `119ms` | `176ms` |
| **Result** | **Reproduced Vulnerability** | **Defect Resolved** |
```

---

## 10. Cloud Deployment Architecture (Vercel + Serverless)

BugBuster is architected to deploy seamlessly to cloud infrastructure:

- **`.gitignore`:** Cleanly excludes `node_modules/`, `dist/`, and local logs, ensuring clean Linux installs without permission errors.
- **`vercel.json`:**
  ```json
  {
    "version": 2,
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/index.js" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **Serverless API Bridge (`api/index.js`):** Exports the Express application directly as a Vercel serverless function.
- **Serverless Writable Sandbox:** Automatically detects `process.env.VERCEL` and writes ephemeral sandbox test files to `os.tmpdir()` (`/tmp/bugbuster-sandbox`), overcoming read-only lambda constraints.

---

## 11. Verification Commands & Multi-Agent Evaluation Guide

For evaluating AI agents, judges, and developers, use the following commands:

| Purpose | Command | Expected Output |
|---|---|---|
| **Automated Batch Test** | `npm test` | All 6 benchmark suites verify **PASS ✅** in isolated child processes |
| **CLI Verification** | `npm run cli verify transfer-race` | Shows Phase 1 (Exit 1) ➔ Phase 2 ➔ Phase 3 (Exit 0) |
| **CLI with PR Export** | `npm run cli verify transfer-race -- --export` | Outputs complete markdown PR verification comment |
| **Production Build** | `npm run build` | Bundles 1600+ modules into `dist/` with 0 errors |
| **Local Dev Server** | `npm run dev` | Spawns Express (`:5055`) and Vite (`:5173`) concurrently |
| **Single Preset Query** | `curl http://localhost:5055/api/presets/transfer-race` | Returns structured JSON preset metadata |
| **Health Check API** | `curl http://localhost:5055/api/health` | Returns `{ status: 'online', mode: 'SANDBOX_ACTIVE' }` |

---

*BugBuster — Built for Track 4: Developer Tools & Open Innovation | HACK IT BROS '26*
