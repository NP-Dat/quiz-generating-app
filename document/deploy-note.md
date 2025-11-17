# Deployment Guide: Render Backend + GitHub Pages Frontend

Use this checklist to provision the backend on Render, deploy the frontend with GitHub Pages, and wire the GitHub Actions workflow (`.github/workflows/react-deploy.yml`) so both tiers go live together.

---

## 1. Backend API on Render

1. **Create a Web Service**

   - In Render, choose **New → Web Service** and connect this GitHub repo.
   - Set the **Root Directory** to `back-end`.
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: pick the smallest option that fits (the API is lightweight).

2. **Environment Variables (Render Dashboard)**

   - `MONGODB_URI` – connection string for your Atlas/local cluster.
   - `CLIENT_ORIGIN` – final frontend URL (GitHub Pages) so CORS stays strict.
   - `PORT` – typically `${PORT}` to use the value Render injects.
   - Optional: `NODE_ENV=production`.

3. **Deploy Hook URL**

   - Open the service → **Deploys** tab → **Manual Deploy → Deploy Hook**.
   - Copy the generated URL; store it as `BACKEND_DEPLOY_HOOK_URL` in GitHub secrets (used by the workflow to trigger a deploy after successful builds).

4. **Grab the Public API URL**

   - After Render finishes the first deploy, note the hostname it assigns (e.g., `https://quiz-api.onrender.com`).
   - Use this URL for `REACT_APP_API_BASE_URL` (frontend) and to test the API directly (`GET https://.../health`).

5. **Verify**
   - `curl https://<render-domain>/health` should return `{ "status": "ok" }`.
   - Ensure Render’s “Environment → Allowed Hosts / CORS” (if applicable) matches the GitHub Pages URL.

---

## 2. Frontend on GitHub Pages

1. **`quiz-react-app/package.json`**

   - Set `homepage` to `https://<username>.github.io/<repository>/`.
   - Keep `"predeploy": "npm run build"` and `"deploy": "gh-pages -d build"` (manual fallback).

2. **Static Asset Paths**

   - Components already use `process.env.PUBLIC_URL` for JSON files (see `QuizList.js`, `Quiz.js`).
   - No additional changes required unless you add new static fetches.

3. **Repository Settings**

   - GitHub → `Settings → Pages → Build and deployment → Source = GitHub Actions`.

4. **Local `.env` (optional)**
   - `quiz-react-app/.env` can point to Render for manual tests:
     ```
     REACT_APP_API_BASE_URL=https://quiz-api.onrender.com
     ```

---

## 3. GitHub Actions Workflow Overview

`react-deploy.yml` currently defines five jobs:

| Job               | Purpose                                       | Runs on PRs?   | Notes                                                |
| ----------------- | --------------------------------------------- | -------------- | ---------------------------------------------------- |
| `backend-checks`  | `npm ci`, lint, and tests for the Express API | ✅             | No secrets needed; keeps PRs healthy.                |
| `backend-build`   | Prepares `.env` with secrets, installs deps   | ❌ (push only) | Requires `MONGODB_URI`, `CLIENT_ORIGIN`, `API_PORT`. |
| `deploy-backend`  | Triggers Render deploy via hook               | ❌ (push only) | Needs `BACKEND_DEPLOY_HOOK_URL`.                     |
| `frontend-build`  | Builds the React app, embeds API base URL     | ✅             | Requires `REACT_APP_API_BASE_URL` even on PRs.       |
| `deploy-frontend` | Publishes to GitHub Pages                     | ❌ (push only) | Depends on backend deploy to ensure API is live.     |

### Workflow quick map (`.github/workflows/react-deploy.yml`)

- The file is split by concern: checks first, then deploys. Each subsequent job declares explicit `needs` so GitHub shows a linear graph (checks → backend build → backend deploy → frontend build → frontend deploy).
- Every `run: npm ci` executes inside its respective folder thanks to `defaults.run.working-directory`. You can search `"working-directory"` in the YAML to double-check.
- Secrets are validated in the shell before writing `.env` files. If one is missing, the job fails immediately via `echo "::error ..."; exit 1`. This prevents silent fallbacks.
- `deploy-backend` is intentionally tiny: it only posts to `BACKEND_DEPLOY_HOOK_URL`, leaving Render to build/run the API. If you change hosts, swap this step for that provider’s CLI or API.
- `deploy-frontend` uses the standard GitHub Pages trio (`configure-pages`, `upload-pages-artifact`, `deploy-pages`). The job waits on both frontend build and backend deploy so the React app never ships ahead of the API.

The workflow fails immediately if any required secret is missing, avoiding accidental deployments with fallback values.

---

## 4. GitHub Repository Secrets

Add these under **Settings → Secrets and variables → Actions**:

| Secret                    | Used by        | Description                                                                       |
| ------------------------- | -------------- | --------------------------------------------------------------------------------- |
| `MONGODB_URI`             | backend-build  | Atlas/local Mongo connection string.                                              |
| `CLIENT_ORIGIN`           | backend-build  | Production frontend URL (e.g., `https://user.github.io/app`).                     |
| `API_PORT`                | backend-build  | Port the Express server should listen on (match Render, e.g., `10000`/`${PORT}`). |
| `REACT_APP_API_BASE_URL`  | frontend-build | Public API URL from Render.                                                       |
| `BACKEND_DEPLOY_HOOK_URL` | deploy-backend | Render deploy hook endpoint.                                                      |

Optional extras (if needed later): `NODE_ENV`, analytics keys, etc.

---

## 5. Deployment Checklist

1. **Backend**

   - Provision MongoDB (Atlas/local) and update `MONGODB_URI`.
   - Create/verify Render service + env vars.
   - Copy Render deploy hook + API URL into GitHub secrets.

2. **Frontend**

   - Confirm `package.json` `homepage` is correct.
   - Ensure GitHub Pages settings use GitHub Actions.

3. **GitHub Actions**

   - Set all secrets listed above.
   - Push to `main`. On success:
     - Render logs show a new deploy triggered by the hook.
     - `deploy-frontend` step outputs the GitHub Pages URL (`steps.deployment.outputs.page_url`).

4. **Smoke Test**
   - Visit the Pages URL, play a quiz, upload one.
   - Watch network calls in dev tools to verify they hit the Render domain.

With these steps in place, any push to `main` automatically lint/tests the backend, deploys it via Render, builds the React client pointing at the Render URL, and publishes the static site through GitHub Pages. Pull requests still run the frontend build and backend checks so you catch issues before merging.
