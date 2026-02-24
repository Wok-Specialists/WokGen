# Changelog

All notable changes to WokGen are documented in this file.

## [1.1.0] — 2025-07-15

### Cycles 40–44 (Final Cycles)

#### Added
- **Notification Bell** (c40): `NotificationBell` component in nav — unread badge, dropdown with last 10 notifications, mark-all-read button
- **Bulk Download** (c43): Pixel gallery now supports multi-select checkboxes and a "Download selected" button that opens each image in a new tab
- **Automations Test Run** (c42): Test button now available for all automation types (email, in_app, webhook). Non-webhook types log and update `lastRunAt`; webhooks fire the URL and return HTTP status

#### Improved
- **Page Performance** (c41): Added `loading="lazy"` to below-fold images in community gallery modal
- **Automations Test Route** (c42): Test route now updates `lastRunAt`/`lastRunStatus` after any test run and returns `{ ok: true, message }` consistently

### Cycles 1–39

#### Core Platform
- **c1–c3**: Initial pixel, business, vector, UI/UX studios; removed emoji mode with redirects
- **c4**: Replaced all emoji icons with SVG components site-wide
- **c5–c6**: Visual polish, typography, spacing, and color system tokens
- **c7**: Style-aware provider routing with quality gate and request tracing
- **c8**: Prompt Intelligence Engine — quality classifier, auto-enrichment, examples library
- **c9**: Structured logging with pino across all API routes
- **c10**: DB performance — Job index on `(projectId, status)`, Notification model

#### Infrastructure
- **c11**: Redis cache layer — admin stats caching + cache key constants
- **c12**: Rate limits by plan — HD/batch/director/Eral quotas + 80% warning notifications
- **c13**: WAP (Workspace Automation Platform) — 8 actions, action log, execute handlers
- **c14**: Eral Director — project type selector, retry-failed, export manifest
- **c15**: Eral Simulate — export .txt/.md, Voice This, stop/add-turn controls
- **c16**: Eral context memory — project brief injection + mode-aware asset context
- **c17**: Onboarding use cases expanded — Product Design and Explore added
- **c18**: Universal studio layout system — `StudioResultPanel`, `GeneratingState`, `StudioEmpty`

#### Studio Features
- **c19**: Pixel studio — capture provider header, show in metadata strip
- **c20**: Voice studio — character presets and text URL param pre-population
- **c21**: Text studio — SSE streaming scaffold
- **c22**: Business studio — target audience field, YouTube thumbnail and TikTok cover platforms
- **c23**: Vector studio — detect SVG content type for download extension
- **c24**: Community gallery — trending sort, remix button, removed emoji mode
- **c25**: Asset permalink at `/assets/[id]`
- **c26**: Style mirror — copy style from community modal, apply in pixel studio

#### APIs & Integrations
- **c27**: Notifications API — GET unread, PATCH mark all read
- **c28**: OpenAPI spec — added missing endpoints + interactive docs page
- **c29**: Webhooks system — Webhook model + `/api/webhooks/user` GET/POST
- **c30**: TypeScript SDK — `@wokgen/sdk` with `generate` and `getJob`
- **c31**: Referral system — Referral model + `/api/referrals` GET/POST
- **c32**: Admin panel — Provider Health tab
- **c33**: Error handling hardening in generate route and studio error components
- **c34**: BullMQ async queue scaffold with `QUEUE_ENABLED` flag
- **c35**: `typecheck` script added to root `package.json`

#### Security & Ops
- **c36**: Security headers hardening — X-DNS-Prefetch-Control, tightened CSP `img-src`
- **c37**: Input validation hardening with `input-sanitize.ts`
- **c38**: Eral docs tutorial page and link from docs hub
- **c39**: Dockerfile health check fixed to `/api/health`; self-hosted env vars documented
