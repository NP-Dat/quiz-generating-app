# Security Scanning Guide: `.github/workflows/security_scan.yml`

This document explains the dedicated security scanning workflow, how each job works, what it catches, and how to act on the results.

---

## 1. Overview

The `security_scan.yml` workflow runs **independently** from the build/deploy pipeline (`react-deploy.yml`). Its sole purpose is to detect vulnerabilities, leaked secrets, and insecure code patterns across both the frontend (`quiz-react-app`) and backend (`back-end`).

### Triggers

| Trigger | When | Why |
| --- | --- | --- |
| `push` to `main` | Every merge/commit to the default branch | Catch issues as soon as code lands. |
| `pull_request` to `main` | Every PR targeting `main` | Block vulnerable code before it merges. |
| `schedule` — `cron: "0 6 * * 1"` | Every Monday at 06:00 UTC | Detect **newly disclosed CVEs** in existing dependencies even when no code changes are pushed. |

### Global Settings

- **Node version**: `22.x` (matches the deploy workflow).
- **Top-level permissions**: `contents: read` — the workflow only reads source code by default. Individual jobs escalate permissions only where needed.

---

## 2. Jobs Breakdown

All four jobs run **in parallel** (no `needs` dependencies) so the workflow finishes as fast as possible.

### 2.1 Dependency Audit — Frontend

| Field | Value |
| --- | --- |
| **Job ID** | `dependency-audit-frontend` |
| **Working directory** | `./quiz-react-app` |
| **Key command** | `npm audit --audit-level=high` |

**What it does:**

1. Checks out the repo and installs frontend dependencies via `npm ci`.
2. Runs `npm audit`, which queries the npm advisory database for known vulnerabilities in the dependency tree.
3. The `--audit-level=high` flag means the job **fails** only if there are **high** or **critical** severity advisories. Moderate and low findings are reported but do not break the build.

**How to fix failures:**

- Run `npm audit` locally inside `quiz-react-app/` to see the full report.
- Use `npm audit fix` for automatic patches, or manually bump the affected package in `package.json`.
- If a fix is not yet available upstream, consider `npm audit fix --force` (may include breaking changes) or add an override in `package.json`.

---

### 2.2 Dependency Audit — Backend

| Field | Value |
| --- | --- |
| **Job ID** | `dependency-audit-backend` |
| **Working directory** | `./back-end` |
| **Key command** | `npm audit --audit-level=high` |

Identical logic to the frontend audit, but scoped to the Express API's dependency tree. Same remediation steps apply.

---

### 2.3 CodeQL Analysis (JavaScript/TypeScript)

| Field | Value |
| --- | --- |
| **Job ID** | `codeql-analysis` |
| **Extra permissions** | `security-events: write` |
| **Language** | `javascript-typescript` |
| **Query suite** | `security-extended` |

**What it does:**

1. GitHub's **CodeQL** engine builds a semantic database of the entire JavaScript/TypeScript codebase.
2. It then runs the `security-extended` query suite, which includes checks for:
   - SQL / NoSQL injection
   - Cross-site scripting (XSS)
   - Prototype pollution
   - Path traversal
   - Insecure randomness
   - Hard-coded credentials
   - And many more (200+ rules).
3. Results are uploaded to the repository's **Security → Code scanning alerts** tab.

**How to act on findings:**

- Navigate to **Security → Code scanning** in the GitHub UI.
- Each alert includes the vulnerable code path, a description of the issue, and a suggested fix.
- Dismiss false positives directly in the UI with a reason (e.g., "used in tests only").

**Permissions note:** This job requires `security-events: write` so CodeQL can upload SARIF results to GitHub's security dashboard.

---

### 2.4 Secret Leak Detection

| Field | Value |
| --- | --- |
| **Job ID** | `secret-scanning` |
| **Tool** | [Gitleaks](https://github.com/gitleaks/gitleaks) v2 |
| **Checkout depth** | Full history (`fetch-depth: 0`) |

**What it does:**

1. Clones the **full git history** (not just the latest commit).
2. Gitleaks scans every commit for patterns that match known secret formats: AWS keys, GitHub tokens, database connection strings, private keys, API keys, passwords in URLs, etc.
3. The job **fails** if any leak is found.

**Why full history?** A secret committed and then deleted in a later commit is still recoverable from git history. Gitleaks catches these.

**How to act on findings:**

1. **Rotate the leaked credential immediately** — assume it is compromised.
2. Remove the secret from the codebase (use environment variables or a secret manager instead).
3. If the secret is in old history, consider using `git filter-repo` or BFG Repo-Cleaner to purge it, then force-push.

**Environment variable:** The job passes `GITHUB_TOKEN` so Gitleaks can comment on PRs with findings.

---

### 2.5 OWASP Dependency-Check

| Field | Value |
| --- | --- |
| **Job ID** | `owasp-dependency-check` |
| **Extra permissions** | `security-events: write`, `contents: read` |
| **Tool** | [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) |
| **Fail threshold** | CVSS ≥ 7 |

**What it does:**

1. Scans `quiz-react-app/package-lock.json` and `back-end/package-lock.json` against the **National Vulnerability Database (NVD)**.
2. Skips dev dependencies (`--nodeAuditSkipDevDependencies`) since they don't ship to production.
3. Generates an **HTML report** and uploads it as a GitHub Actions artifact (retained for 14 days).
4. The job **fails** if any dependency has a CVE with a CVSS score of **7 or higher** (high/critical).

**How to view the report:**

1. Go to the workflow run in the **Actions** tab.
2. Scroll to **Artifacts** at the bottom.
3. Download `owasp-dependency-check-report` and open the HTML file in a browser.

**How to fix failures:**

- Update the vulnerable package to a patched version.
- If no patch exists, evaluate the CVE to determine if the vulnerable code path is actually reachable in your app. If not, you may suppress it in a future configuration file.

---

## 3. Workflow Architecture Diagram

```
push / PR to main
        │
        ├──► dependency-audit-frontend   (npm audit)
        │
        ├──► dependency-audit-backend    (npm audit)
        │
        ├──► codeql-analysis             (SAST — code patterns)
        │
        ├──► secret-scanning             (Gitleaks — git history)
        │
        └──► owasp-dependency-check      (NVD — known CVEs)
                    │
                    └──► uploads HTML report artifact
```

All jobs run in **parallel**. A failure in any single job marks the overall workflow as failed and blocks the PR (if branch protection rules are configured).

---

## 4. Required Secrets & Permissions

| Item | Scope | Notes |
| --- | --- | --- |
| `GITHUB_TOKEN` | Automatic | Provided by GitHub Actions; used by Gitleaks and CodeQL. No manual setup needed. |
| `security-events: write` | Job-level permission | Required by CodeQL and OWASP to upload scan results. Already declared in the workflow. |

**No additional repository secrets are needed** — this workflow is self-contained.

---

## 5. Configuring Branch Protection

To enforce security checks before merging PRs:

1. Go to **Settings → Branches → Branch protection rules → `main`**.
2. Enable **Require status checks to pass before merging**.
3. Add these status checks:
   - `Dependency Audit — Frontend`
   - `Dependency Audit — Backend`
   - `CodeQL Analysis (JavaScript)`
   - `Secret Leak Detection`
   - `OWASP Dependency-Check`

This prevents any PR with known vulnerabilities from being merged.

---

## 6. Maintenance & Customization

| Task | How |
| --- | --- |
| **Change audit severity threshold** | Edit `--audit-level=high` to `moderate` or `critical` in the npm audit steps. |
| **Adjust OWASP fail threshold** | Change `--failOnCVSS 7` to a different score (e.g., `9` for critical-only). |
| **Add more CodeQL queries** | Change `queries: security-extended` to `security-and-quality` for code quality rules on top of security. |
| **Customize Gitleaks rules** | Add a `.gitleaks.toml` file at the repo root to allowlist known false positives or add custom patterns. |
| **Change schedule frequency** | Edit the cron expression. E.g., `"0 6 * * *"` for daily, `"0 6 1 * *"` for monthly. |
| **Add new scan targets** | Add more `--scan` flags to the OWASP job or new `working-directory` audit jobs for additional packages. |

---

## 7. Relationship to the Deploy Workflow

| Workflow | File | Purpose |
| --- | --- | --- |
| Build, Test, and Deploy | `react-deploy.yml` | Lint → Test → Build → Deploy (Render + GitHub Pages) |
| Security Scan | `security_scan.yml` | Vulnerability audit → SAST → Secret detection → CVE scanning |

The two workflows are **completely independent**. Security scan failures do not block deployments unless you configure branch protection rules (recommended). This separation ensures:

- Deployments are not slowed down by long-running security scans.
- Security results are clearly visible in their own workflow.
- The scheduled weekly scan runs without triggering any deploy logic.
