# BugBuster — Find. Fix. Verify.
### Track 4: Developer Tools & Open Innovation | HACK IT BROS '26

[![BugBuster Status](https://img.shields.io/badge/BugBuster-VERIFIED%20PASS%20%E2%9C%85-10b981?style=for-the-badge&logo=github)](https://github.com/)
[![Track 4](https://img.shields.io/badge/Track%204-Developer%20Tools%20%26%20Open%20Innovation-06b6d4?style=for-the-badge)](https://github.com/)
[![Sandbox Execution](https://img.shields.io/badge/Sandbox-Real%20Child%20Process%20Node.js-f59e0b?style=for-the-badge)](https://github.com/)

**BugBuster** is an autonomous AI developer assistant engineered to eliminate unverified code fixes. Traditional code review is slow and error-prone, while standard AI assistants only provide speculative suggestions without proving they actually work.

BugBuster solves this by implementing an **Autonomous Find-Fix-Verify Loop**:
1. **Ingest & Scan:** Ingests GitHub PRs, Git Diffs, or raw code and runs AST heuristics and CWE/OWASP classification.
2. **Automated Reproduction Test:** Generates a minimal, standalone reproduction test suite that reliably triggers the vulnerability (proves bug existence).
3. **Surgical Patch Synthesis:** Generates a minimal Unified Git Diff targeting only the root cause.
4. **Live Sandbox Verification (No Fake Demos):** Executes the reproduction test suite live in an isolated child process sandbox on the host system:
   - **Phase 1 (Unpatched Code):** Runs test suite ➔ **VERIFIED FAIL ❌ (Exit Code 1)** with real assertion failure and stack trace.
   - **Phase 2 (Patch Application):** Applies surgical Unified Diff.
   - **Phase 3 (Patched Code):** Re-runs test suite ➔ **VERIFIED PASS ✅ (Exit Code 0)** with execution runtime and test counts.
5. **Audit Proof & PR Export:** Generates tamper-evident proof cards, live terminal logs, and exportable GitHub PR verification comments with badges.

---

## 🛡️ No Fake Demo Compliance

- **Real Process Execution:** Tests are spawned via `node:child_process` in ephemeral sandbox folders (`server/sandbox/run_<id>`).
- **Authentic Telemetry:** Displays true operating system exit codes, elapsed milliseconds, stdout, and stderr.
- **Offline + LLM Dual Mode:** Works 100% offline out-of-the-box with the 6 benchmark scenarios and AST engine, with optional Google Gemini API key support for analyzing arbitrary public GitHub PRs.

---

## ⚡ 6 Real-World Preloaded Benchmark Testbeds

1. **Financial Concurrency Vulnerability (The Official Brief Scenario)**
   - *Target:* `POST /api/auth/transfer` (`transferService.js`)
   - *CWE:* `CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization`
   - *Exploit:* Missing idempotency check + race condition allows concurrent requests to double-spend ($200 withdrawn from $100 balance).
   - *Live Proof:* 5 concurrent transfers fail before fix (balance goes to -$100). Patched lock table serializes operations (balance remains $20).
2. **Express Recursive Prototype Pollution**
   - *Target:* `mergeUtil.js` (CVE-2024 Pattern)
   - *CWE:* `CWE-1321: Improperly Controlled Modification of Object Prototype Attributes`
   - *Live Proof:* Pollutes `Object.prototype` with `isAdmin: true`. Patched defensive filter blocks dangerous keys.
3. **JWT "alg": "none" Signature Bypass**
   - *Target:* `authValidator.js`
   - *CWE:* `CWE-347: Improper Verification of Cryptographic Signature`
   - *Live Proof:* Unsigned forged token bypasses auth. Patched validator enforces algorithm whitelist and timing-safe comparisons.
4. **Catastrophic ReDoS (Denial of Service)**
   - *Target:* `emailValidator.js`
   - *CWE:* `CWE-1333: Inefficient Regular Expression Complexity`
   - *Live Proof:* Exponential backtracking blocks event loop for 5,000ms+. Linear regex resolves in <1ms.
5. **SQL Injection in Query Builder**
   - *Target:* `userSearch.js`
   - *CWE:* `CWE-89: Improper Neutralization of Special Elements used in an SQL Command`
   - *Live Proof:* Input `' OR '1'='1` extracts unauthorized records. Parameterized query eliminates syntax breakout.
6. **Hardcoded Cloud Credentials Leak**
   - *Target:* `s3Client.js`
   - *CWE:* `CWE-798: Use of Hard-coded Credentials`
   - *Live Proof:* Raw AWS credentials embedded in repository. Refactored to secure environment loading with guard checks.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run

```bash
# Clone or navigate to project directory
cd "d:/Bug AI"

# Install dependencies
npm install

# Start both backend (port 5055) and frontend (port 5173) concurrently
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 💻 CLI Verification Demo

BugBuster includes a dedicated CLI for terminal demonstrations:

```bash
# List all benchmark suites
npm run cli list

# Verify the official Hackathon financial concurrency race condition
npm run cli verify transfer-race

# Verify prototype pollution
npm run cli verify prototype-pollution

# Verify ReDoS resilience
npm run cli verify redos-attack

# Generate and print GitHub PR verification markdown comment directly in terminal
npm run cli verify transfer-race -- --export

# Automated batch verification of all 6 benchmark testbeds
npm test
```

---

## 🏗️ Architecture

```
BugBuster System Flow:
Code / PR / Diff Input
         │
         ▼
[AST & Heuristic Analyzer]  ◄── Optional: Google Gemini Flash
         │
         ├── 1. Root Cause Breakdown & CWE/OWASP Classification
         ├── 2. Autonomous Reproduction Test Suite (test.js)
         └── 3. Surgical Unified Diff Patch (.diff)
         │
         ▼
[Live Child Process Test Runner] (server/lib/runner.js)
         ├── Phase 1: Run test on unpatched code ──► ❌ EXIT 1 (FAIL)
         ├── Phase 2: Apply Unified Diff patch
         └── Phase 3: Run test on patched code   ──► ✅ EXIT 0 (PASS)
         │
         ▼
[Developer Dashboard & PR Badging]
         ├── Visual Side-by-Side Proof Matrix
         ├── Interactive ANSI Terminal Stream
         ├── Unified Diff & Code Inspector
         └── One-Click GitHub PR Markdown Comment Exporter
```

---

## 📂 Project Structure

```
d:/Bug AI/
├── bin/
│   └── bugbuster.js            # Standalone CLI tool
├── server/
│   ├── index.js                # Express API server (port 5055)
│   ├── lib/
│   │   ├── presets.js          # 6 real-world benchmark suites
│   │   ├── runner.js           # Isolated child process sandbox engine
│   │   ├── analyzer.js         # AST heuristics & Gemini fallback
│   │   ├── patcher.js          # Unified diff generator & patch applier
│   │   └── github.js           # GitHub PR comment & diff fetcher
│   └── sandbox/                # Ephemeral test directories
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Main application coordinator
│   ├── index.css               # Cyber/DevSecOps design system & tokens
│   └── components/
│       ├── Header.jsx          # Branding, Track 4 badge & Sandbox ping
│       ├── PresetSelector.jsx  # 6 benchmark testbed selector cards
│       ├── InputPanel.jsx      # PR URL / Custom code / Diff editor
│       ├── VulnerabilityCard.jsx # Threat analysis, CWE, root cause
│       ├── DiffViewer.jsx      # Unified & split diff patch inspector
│       ├── ExecutionTerminal.jsx # Retro-modern ANSI console terminal
│       ├── VerificationProof.jsx # Side-by-side FAIL ❌ -> PASS ✅ matrix
│       ├── ExportModal.jsx     # Exportable GitHub PR comment with badge
│       ├── SettingsModal.jsx   # API key configuration
│       └── GuideModal.jsx      # Architecture & pipeline guide
├── package.json
├── vite.config.js
└── test_all.js                 # Full suite verification script
```

---

## 🏆 Hackathon Track 4 Alignment

- **Developer Tools & Open Innovation:** Automates the most tedious part of code review — generating reproducible test cases and proving fixes work before merging.
- **Security & Reliability:** Covers critical OWASP Top 10 vulnerabilities including race conditions, prototype pollution, injection, and algorithmic DoS.
- **Developer Experience:** Frictionless one-click workflow with instant feedback, zero-config offline mode, and PR-ready GitHub markdown exports.
