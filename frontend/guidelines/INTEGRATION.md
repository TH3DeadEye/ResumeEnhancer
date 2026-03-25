# Backend Integration — What Was Done

This document summarises every change made to wire the AWS backend to the Next.js frontend. Read this before touching any of the files listed below.

---

## Overview

The frontend was previously a fully-animated prototype running entirely on mock data and fake timers. All four AWS Lambda endpoints are now live. Authentication via Cognito/Amplify was already functional; this work focused on the API layer and dashboard pages.

---

## New Files

### `frontend/lib/api.ts`
The single source of truth for all backend communication.

- Reads `NEXT_PUBLIC_API_URL` from the environment (set to `/api/proxy` — see below)
- Automatically attaches the Cognito `Authorization: Bearer <idToken>` header on every request using `getAuthToken()` from `auth-service.ts`
- Exports these functions:

| Function | Method | Endpoint | Returns |
|---|---|---|---|
| `uploadResume(file)` | POST | `/resume/upload` | `{ resume_id }` |
| `enhanceResume(resumeId, jobDescription)` | POST | `/resume/enhance` | `EnhancementResult` |
| `listResumes()` | GET | `/resume/list` | `Resume[]` |
| `downloadEnhancement(resumeId)` | GET | `/resume/download?resume_id=` | `DownloadResult` |
| `pollResumeStatus(resumeId, statuses[])` | — | polls `listResumes()` | `Resume` when status reached |

- Exports TypeScript types: `Resume`, `EnhancementResult`, `SectionFeedback`, `BulletSuggestion`, `DownloadResult`
- `pollResumeStatus` polls every 3 seconds, times out after 20 attempts (60 s)

### `frontend/app/api/proxy/[...path]/route.ts`
A Next.js server-side route that forwards all requests to AWS API Gateway.

**Why it exists (important — do not remove or replace with `next.config.ts` rewrites):**
- Node's native `fetch` (undici) tries IPv6 first; CloudFront drops IPv6 connections with `ConnectTimeoutError`. This proxy forces IPv4 via `node:https` with `family: 4`.
- `next.config.ts` rewrites stream the request body in chunks; API Gateway drops large base64-encoded PDF bodies mid-stream with `ECONNRESET`. This proxy buffers the full body before forwarding.

Supports `GET` and `POST`. Passes the `Authorization` header through. Uses `API_GATEWAY_URL` from the environment (server-side only — never exposed to the browser).

---

## Modified Files

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=/api/proxy
API_GATEWAY_URL=https://p3xj2brlia.execute-api.us-west-2.amazonaws.com/Prod
NEXT_PUBLIC_AWS_REGION=us-west-2
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-west-2_qhPzQQqYA
NEXT_PUBLIC_COGNITO_CLIENT_ID=jsb637fsid2puaed9mnavgsio
```
- `NEXT_PUBLIC_API_URL=/api/proxy` — routes all `lib/api.ts` calls through the Next.js proxy instead of hitting API Gateway directly from the browser.
- Cognito vars were previously commented out (hardcoded in `amplify-provider.tsx`); now uncommented so `amplify-provider.tsx` reads them from the environment.

### `frontend/app/dashboard/upload/page.tsx`
Previously used fake `setInterval` progress and a 3-second `setTimeout` to simulate uploading and enhancement. Now:

- `handleUpload()` calls `uploadResume(file)` → gets `resume_id` → calls `pollResumeStatus(resume_id, ['PARSED', 'ENHANCED'])` → shows Step 2 when the backend finishes parsing
- `handleEnhance()` calls `enhanceResume(resumeId, jobDescription)` → stores the full `EnhancementResult`
- Success card now shows real data: Overall / ATS / Job Match scores, Top Wins, Keywords to Add
- `handleDownload()` fetches `downloadEnhancement(resumeId)` and triggers a browser download of the enhancement result as a `.json` file

### `frontend/app/dashboard/history/page.tsx`
Previously showed 5 hardcoded mock resumes. Now:

- `fetchResumes()` calls `listResumes()` — real data from DynamoDB
- Status values from the API (`uploaded`, `EXTRACTED`, `PARSED`, `ENHANCED`, `FAILED`) are mapped to display statuses (`processing`, `parsed`, `enhanced`, `failed`)
- **View button** — calls `downloadEnhancement(resumeId)`, opens an inline modal showing: scores grid, suggested summary, top wins, keywords to add, full section-by-section feedback with original → improved suggestions
- **Download button** — calls `downloadEnhancement(resumeId)`, downloads a `.json` file

### `frontend/app/dashboard/page.tsx`
Previously showed 3 hardcoded mock resumes. Now:

- `fetchResumes()` calls `listResumes()` — real data; stats (total, enhanced) computed from live data
- Shows the 5 most recent resumes
- **View** and **Download** buttons behave identically to the History page (same modal, same JSON export)

### `frontend/lib/auth-service.ts`
Added a silent `signOut()` call at the start of `handleSignIn()`.

**Why:** Amplify throws `UserAlreadyAuthenticatedException` if a stale session exists in `localStorage` when a user tries to sign in again (e.g. after closing the tab without signing out). The silent sign-out clears the stale session before attempting the new sign-in.

### `frontend/app/components/theme-provider.tsx`
Changed `import { type ThemeProviderProps } from 'next-themes/dist/types'` → `from 'next-themes'`.

The `/dist/types` sub-path no longer exists in the installed version of `next-themes`, causing a build failure. The type is exported from the package root.

### `frontend/app/components/hero-section.tsx`
Added `as unknown as gsap.TweenVars` type assertion on the GSAP ScrambleText tween call.

GSAP's TypeScript types require a `text` field on the `scrambleText` object, but the plugin works without it at runtime (scrambles in-place). The assertion silences the compile error without changing runtime behaviour.

### `backend/template.yaml`
Two changes to bring the local template in sync with the deployed AWS stack:

1. **Added `ListHandler`** — the `GET /resume/list` Lambda was deployed to AWS but missing from the local template. Added the full resource definition with `DynamoDBReadPolicy`.
2. **Fixed `BedrockModelId` default** — changed from `anthropic.claude-3-5-sonnet-20240620-v1:0` to `us.anthropic.claude-3-5-haiku-20241022-v1:0` to match what is actually deployed.

---

## Deleted Files

These five Next.js API routes were stubs that returned `501 Not Implemented`. They were never called by any frontend code (`lib/api.ts` bypasses them entirely by going through the proxy). Deleting them removes confusion.

- `frontend/app/api/auth/signin/route.ts`
- `frontend/app/api/auth/signup/route.ts`
- `frontend/app/api/resume/upload/route.ts`
- `frontend/app/api/resume/enhance/route.ts`
- `frontend/app/api/resume/download/route.ts`

Authentication is handled entirely client-side by AWS Amplify — no server-side auth routes are needed.

---

## Backend Status Flow (for reference)

```
User uploads PDF
    ↓
POST /resume/upload          → status: "uploaded"
    ↓ (S3 trigger, async)
ExtractionHandler (pypdf)    → status: "EXTRACTED"
    ↓ (S3 trigger, async)
ParserHandler (Bedrock)      → status: "PARSED"  ← frontend polls until here
    ↓ (user triggers)
POST /resume/enhance         → status: "ENHANCED"
    ↓
GET /resume/download         → returns full EnhancementResult JSON
```

`pollResumeStatus` in `lib/api.ts` polls `GET /resume/list` every 3 seconds waiting for `PARSED` or `ENHANCED` before allowing the user to proceed to Step 2.

---

## What Is Still Not Done

| Item | File | Notes |
|---|---|---|
| Contact form email | `app/api/contact/route.ts` | SES `SendEmailCommand` is commented out — form submits successfully but no email is sent |
| Settings page | `/dashboard/settings` | Link exists in nav (desktop + mobile) but the page does not exist — currently a 404 |
| Footer links | `app/components/landing-footer.tsx` | GitHub, LinkedIn point to generic URLs; Privacy Policy / Terms / Security link to `#` |
| Production CORS | `backend/samconfig.toml` | `FrontendUrl` defaults to `http://localhost:3000` — must be updated and backend redeployed when the frontend goes live on a real domain |
| `react-day-picker` | `frontend/package.json` | Missing dependency — `calendar.tsx` imports it, `npm run build` fails without it. Run `npm install react-day-picker` |
