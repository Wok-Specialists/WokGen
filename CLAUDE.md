# WokGen — Agent Reference

> **Read this before touching any code.** This file is the authoritative guide for automated agents (Claude, Copilot, Sweep) and human contributors working inside this repository.

---

## Table of Contents

1. [What This Repo Is](#1-what-this-repo-is)
2. [Hard Constraints — Do Not Break](#2-hard-constraints--do-not-break)
3. [Tech Stack with Versions](#3-tech-stack-with-versions)
4. [Monorepo Layout](#4-monorepo-layout)
5. [App Router Structure — Key Routes](#5-app-router-structure--key-routes)
6. [Database Patterns (Prisma)](#6-database-patterns-prisma)
7. [Auth Patterns (NextAuth v5)](#7-auth-patterns-nextauth-v5)
8. [API Route Patterns](#8-api-route-patterns)
9. [AI Provider Integration Patterns](#9-ai-provider-integration-patterns)
10. [Queue Job Patterns (BullMQ / p-queue)](#10-queue-job-patterns-bullmq--p-queue)
11. [Eral Companion Integration](#11-eral-companion-integration)
12. [Key Environment Variables](#12-key-environment-variables)
13. [How to Add a New Generation Mode](#13-how-to-add-a-new-generation-mode)
14. [How to Add a New API Route](#14-how-to-add-a-new-api-route)
15. [Style Presets](#15-style-presets)
16. [Rate Limiting](#16-rate-limiting)
17. [Common Gotchas and Pitfalls](#17-common-gotchas-and-pitfalls)
18. [Commit Conventions](#18-commit-conventions)
19. [CI/CD Notes](#19-cicd-notes)
20. [Agent-Specific Guidance](#20-agent-specific-guidance)

---

## 1. What This Repo Is

**WokGen** is an AI pixel art generation platform and the flagship product of WokSpec. It lets users generate sprites, tilesets, and animations via multiple AI providers. It includes:

- A **pixel editor** (browser-only canvas tool) for post-processing generated assets
- **18 style presets** covering retro, modern, NES, Game Boy, and more
- An **AI companion** called **Eral 7c** powered by Groq (Llama 3.3 70B) and Anthropic Claude
- A **WAP (Workflow Action Protocol)** for Eral↔WokGen bidirectional DOM communication
- **BullMQ async job queue** backed by Upstash Redis for heavy generation jobs
- **Brand kit** workflow for generating cohesive asset sets from a brand context
- **Prompt Lab** for iterative prompt engineering
- **ComfyUI** integration for self-hosted local generation pipelines
- A **WokSDK v1** (`/api/v1/*`) exposing public API endpoints with API key auth
- **Storybook** for UI component development

The codebase is a **monorepo**: the main Next.js app lives at `apps/web/`. The root `package.json` is minimal (workspace root). All application code, Prisma schema, and configuration live under `apps/web/`.

**Production deployment:** Vercel (`apps/web/.vercel/project.json` + `apps/web/vercel.json`). The `apps/web/render.yaml` is an alternative deployment config — check which is active.

---

## 2. Hard Constraints — Do Not Break

These are invariants that, if violated, will break production or the user experience in ways that are difficult to recover from.

### 2.1 Authentication

- **Never bypass the NextAuth session check** on protected routes. Use `auth()` from `@/lib/auth` in server components and `getServerSession()` / `useSession()` only as a fallback.
- The `AUTH_SECRET` must be consistent across all deployed instances. Rotating it invalidates all active sessions.
- The `apps/web/src/middleware.ts` enforces route protection and rate limiting at the Edge. Do not remove the `needsAuth` check paths without an explicit request.

### 2.2 Prisma / Database

- **Never run `prisma db push` on production.** Use `prisma migrate deploy`. The `build` script in `package.json` uses `prisma db push --accept-data-loss` — this is intentional for Vercel preview deployments only.
- Schema changes require a migration file. Generate with `npm run db:migrate`.
- The `Job` model status lifecycle is: `pending → running → succeeded | failed`. Do not invent new status values without updating the UI components that render them.
- `User.isAdmin` is the authorization gate for `/admin/*`. Setting this incorrectly in a migration is a security issue.

### 2.3 AI Generation

- **Never execute AI provider calls inline in API route handlers.** Either use the `genQueue` (p-queue) or push to BullMQ. See [Section 10](#10-queue-job-patterns-bullmq--p-queue).
- **Never hardcode API keys.** All provider keys must come from `process.env.*`.
- The `resolveProviderConfig()` function in `src/lib/providers/index.ts` is the single source for provider key resolution — BYOK (bring-your-own-key) headers override env vars. Always go through this function.

### 2.4 Pixel Editor

- The pixel editor (`src/components/pixel-editor/`, `src/app/pixel/`) uses browser Canvas API. It must **never run on the server** (Next.js SSR will throw). All canvas operations must be inside `'use client'` components and guarded with `typeof window !== 'undefined'` when called in effects.
- `src/worker/generate-worker.ts` is a Web Worker — it runs in the browser, not Node.js. Do not import Node.js-only modules into it.

### 2.5 Eral Integration

- Do not import Eral source code directly. The integration boundary is `src/lib/eral-integration.ts`. All constants (URLs, feature flags) go there.
- WAP events (`wap:dispatch` / `eral:action`) must remain DOM CustomEvents — do not convert to fetch calls or WebSockets without updating both sides.

### 2.6 Rate Limiting

- All public-facing AI endpoints must apply rate limiting. Use `@upstash/ratelimit` (Redis-backed) for production and the in-memory `checkRateLimit()` from `src/lib/rate-limiter.ts` only as a fallback.
- The Edge middleware applies a coarse-grained rate limit (60 req/10s per IP) on `/api/generate` and `/api/eral/chat`. This is a first line of defense — do not remove it.

---

## 3. Tech Stack with Versions

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14.2.35 |
| Language | TypeScript | 5.4.5 |
| React | React | 18.3.1 |
| ORM | Prisma | 5.14.0 |
| Database | PostgreSQL (Neon) | — |
| Auth | next-auth (v5 beta) | 5.0.0-beta.30 |
| Job Queue | BullMQ | 5.70.1 |
| In-process queue | p-queue | 9.1.0 |
| Redis client | ioredis | 5.9.3 |
| Redis (managed) | Upstash Redis | @upstash/redis ^1.36.2 |
| Rate limiting | @upstash/ratelimit | 2.0.8 |
| AI: image (standard) | Fal.ai (FLUX) | via REST |
| AI: image (HD) | Replicate (FLUX Pro, SDXL) | via REST |
| AI: upscale | Replicate (Real-ESRGAN) | via REST |
| AI: inpaint/ctrl | Replicate (ControlNet) | via REST |
| AI: text/companion | Groq (Llama 3.3 70B) | groq-sdk ^0.37.0 |
| AI: companion (deep) | Anthropic Claude | @anthropic-ai/sdk ^0.78.0 |
| Email | Resend | resend ^6.9.2 |
| Payments | Stripe | stripe ^20.3.1 |
| Monitoring | Sentry | @sentry/nextjs ^10.39.0 |
| Observability | OpenTelemetry | @opentelemetry/sdk-node |
| UI primitives | shadcn/ui + Tailwind CSS | Tailwind 3.4.4 |
| Animations | Framer Motion | ^12.34.3 |
| Data tables | TanStack Query | ^5.90.21 |
| Charts | Recharts | ^3.7.0 |
| PDF | pdf-lib + pdfkit | — |
| Testing | Vitest | ^4.0.18 |
| Component dev | Storybook | ^10.2.12 |
| Lint | ESLint | 8.57.0 |
| Node requirement | Node.js | ≥ 20 |

---

## 4. Monorepo Layout

```
WokGen/
├── apps/
│   └── web/                  # Main Next.js application (ALL app code lives here)
│       ├── prisma/
│       │   ├── schema.prisma # Canonical DB schema
│       │   └── migrations/   # Prisma migration files
│       ├── src/
│       │   ├── app/          # Next.js App Router pages and API routes
│       │   ├── components/   # Shared React components
│       │   ├── hooks/        # Custom React hooks
│       │   ├── lib/          # Utilities, providers, and service wrappers
│       │   ├── types/        # TypeScript type declarations
│       │   └── worker/       # Web Worker for in-browser generation
│       ├── package.json      # app-level dependencies (run npm commands here)
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── tsconfig.json
├── comfyui/
│   └── workflows/            # ComfyUI workflow JSON files
├── dataset/                  # Training dataset (images, licenses)
├── docs/                     # Internal documentation
│   ├── INTERNALS.md          # Systems reference (prompt engine, quality, etc.)
│   ├── ENV.md                # Full environment variable reference
│   ├── architecture.md       # High-level architecture
│   └── PIPELINES.md          # Generation pipeline docs
├── examples/                 # Example workflows and UI patterns
├── prompts/
│   └── prompts.jsonl         # Curated prompt dataset
├── scripts/
│   └── smoke-test.sh         # Basic smoke test
├── docker-compose.dev.yml    # Local dev with Docker (Postgres + Redis)
├── package.json              # Workspace root (minimal)
└── CLAUDE.md                 # This file
```

> **Important:** All `npm` commands must be run from `apps/web/`, not the repo root. The root `package.json` is a workspace root with no install target.

---

## 5. App Router Structure — Key Routes

All routes live under `apps/web/src/app/`. The pattern is: `page.tsx` = Server Component, `_client.tsx` = Client Component (the interactive part), `loading.tsx` + `error.tsx` for suspense/error boundaries.

### Pages

| Route | Description | Auth required |
|-------|-------------|---------------|
| `/` | Landing / home | No |
| `/(auth)/login` | Sign-in page (NextAuth) | No |
| `/dashboard` | User dashboard | Yes |
| `/studio` | Main AI generation studio | Yes |
| `/pixel` | Pixel editor (browser canvas) | Optional |
| `/gallery` | Public community gallery | No |
| `/explore` | Explore / discover assets | No |
| `/library` | User's saved assets | Yes |
| `/projects` | Projects list | Yes |
| `/projects/[id]` | Project detail + docs | Yes |
| `/prompt-lab` | Interactive prompt engineering | Yes |
| `/billing` | Billing / subscription management | Yes |
| `/settings` | User settings | Yes |
| `/account` | Account management | Yes |
| `/profile/[username]` | Public user profile | No |
| `/admin` | Admin panel | Yes + `isAdmin` |
| `/brand` | Brand kit management | Yes |
| `/editor` | Full-screen asset editor | Yes |
| `/emoji` | Emoji generator | Yes |
| `/onboarding` | New user onboarding flow | Yes |
| `/developers` | Developer portal / API docs | No |
| `/changelog` | Product changelog | No |
| `/community` | Community hub | No |
| `/docs` | In-app documentation | No |
| `/notifications` | Notification center | Yes |
| `/chopsticks` | Chopsticks Discord bot page | No |
| `/pricing` | Pricing page | No |
| `/design-system` | Design system reference | No |
| `/status` | Provider health status | No |

### API Routes (selected)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth handler |
| `/api/generate` | POST | Session/API key | Core generation route |
| `/api/v1/generate` | POST | API key (`generate` scope) | Public SDK generation |
| `/api/v1/me` | GET | API key (`read:profile`) | Public SDK user info |
| `/api/v1/jobs/[id]` | GET | API key | Job status |
| `/api/v1/assets` | GET | API key | Asset listing |
| `/api/v1/eral` | POST | Session | Eral chat (Groq) |
| `/api/health` | GET | None | Health check |
| `/api/health/deep` | GET | None | Deep health (DB + Redis) |
| `/api/quota` | GET | Session | Quota status |
| `/api/credits` | GET | Session | Credit balance |
| `/api/brand` | GET/POST | Session | Brand kit CRUD |
| `/api/user/api-keys` | GET/POST/DELETE | Session | API key management |
| `/api/providers` | GET | Session | Provider health + BYOK status |
| `/api/admin/*` | GET/POST | Session + isAdmin | Admin operations |
| `/api/preferences` | GET/POST | Session | User preferences |
| `/api/automations` | GET/POST | Session | Webhook automations |
| `/api/discord/interactions` | POST | Signature | Discord slash commands |

---

## 6. Database Patterns (Prisma)

### Setup

```bash
cd apps/web
npm run db:migrate   # create and apply a new migration
npm run db:push      # sync schema without migration (local dev only)
npm run db:studio    # open Prisma Studio
```

### Connection

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Always import `prisma` from `@/lib/db`. Never instantiate `PrismaClient` directly.

### Key Models

**User** — central model. Key fields:
- `id` — CUID, primary key
- `isAdmin` — grants admin access; never set via user input
- `hdTopUpCredits` / `hdMonthlyUsed` — HD generation credit tracking
- `stdGenToday` / `stdGenDate` — daily free quota counters

**Job** — represents a single generation request:
- `tool`: `generate | animate | rotate | inpaint | scene`
- `status`: `pending → running → succeeded | failed`
- `provider`: `replicate | fal | together | comfyui | pollinations | huggingface | stablehorde | prodia`
- `resultUrl` — final image URL after completion

**Subscription** — one per user:
- `planId`: `free | pro | studio | enterprise`
- `status`: `active | canceled | past_due | trialing`
- Auto-provisioned as `free` on first sign-in (see `auth.ts` `signIn` event)

**ApiKey** — for the public WokSDK:
- `key` — hashed in DB, shown to user only once on creation
- `scopes` — array of permitted scopes: `generate`, `read:profile`, etc.

### Common Patterns

```typescript
// ✅ Correct: include only what you need
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { id: true, isAdmin: true, subscription: { select: { planId: true } } },
});

// ❌ Wrong: never select everything on large models
const user = await prisma.user.findUnique({ where: { id } }); // loads ALL fields + relations

// ✅ Correct: atomic credit decrement
await prisma.user.update({
  where: { id: userId },
  data: { hdMonthlyUsed: { increment: 1 } },
});

// ✅ Correct: transaction for multi-step operations
await prisma.$transaction([
  prisma.job.update({ where: { id }, data: { status: 'running' } }),
  prisma.user.update({ where: { id: userId }, data: { hdMonthlyUsed: { increment: 1 } } }),
]);
```

### Migration Rules

- Every `prisma/schema.prisma` change needs a migration: `npm run db:migrate -- --name describe_change`
- Check for missing indexes on foreign keys (e.g., `@@index([userId])`)
- Use `onDelete: Cascade` for child records that must be cleaned up with the parent
- Use `onDelete: SetNull` for optional relations (e.g., `Job.userId`)

---

## 7. Auth Patterns (NextAuth v5)

### Configuration

Auth is configured in `apps/web/src/lib/auth.ts` using `NextAuth()` with the Prisma adapter.

- **Session strategy:** `jwt` — sessions are encrypted cookies, no DB round-trip per request
- **Providers:** GitHub OAuth + Google OAuth
- **JWT claims:** `sub` = `user.id`, `isAdmin` = `user.isAdmin`
- **Session augmentation:** `session.user.id` and `session.user.isAdmin` are added in the `callbacks`

### Reading the Session

```typescript
// In a Server Component or API route handler (server-side)
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = session.user.id; // string (cuid)
}

// In a Client Component
import { useSession } from 'next-auth/react';

export function ClientComponent() {
  const { data: session, status } = useSession();
  if (status === 'unauthenticated') return <LoginPrompt />;
}
```

### Protecting API Routes

```typescript
// apps/web/src/app/api/your-route/route.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... handler logic
}
```

### Admin-Only Routes

```typescript
const session = await auth();
if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
if (!(session.user as { isAdmin?: boolean }).isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Middleware Route Protection

`src/middleware.ts` auto-redirects unauthenticated requests to `/login?callbackUrl=...` for these paths:
`/account`, `/billing`, `/settings`, `/admin`, `/library`, `/projects`, `/dashboard`

The middleware also applies an Edge rate limit and sets security headers (CSP, X-Frame-Options, etc.) on every response.

### NextAuth v5 Caveats

- Import from `next-auth` (not `next-auth/next`) for v5
- The `auth()` function is usable in both middleware and route handlers — it reads the JWT cookie directly
- Do not use `getServerSession()` (v4 API) anywhere in this codebase

---

## 8. API Route Patterns

### Standard Response Shape

```typescript
// Success
return NextResponse.json({ data: result }, { status: 200 });

// Error
return NextResponse.json({ error: 'Human-readable message' }, { status: 400 });
```

### Route File Template

```typescript
// apps/web/src/app/api/your-feature/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';     // always set explicitly
export const dynamic = 'force-dynamic'; // always for auth-dependent routes

export async function POST(req: NextRequest) {
  // 1. Auth guard
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse + validate input
  let body: { prompt: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  // 3. Rate limit
  // Use @upstash/ratelimit in production (see src/lib/rate-limit.ts)

  // 4. Business logic
  const result = await doWork(session.user.id, body.prompt);

  return NextResponse.json({ data: result });
}
```

### API Key Auth (WokSDK v1)

For `/api/v1/*` routes, use the API key authenticator:

```typescript
import { authenticateApiKey, hasScope } from '@/lib/api-key-auth';

export async function POST(req: NextRequest) {
  const apiUser = await authenticateApiKey(req);
  if (!apiUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasScope(apiUser.scopes, 'generate')) {
    return NextResponse.json({ error: 'Forbidden: generate scope required' }, { status: 403 });
  }
  // apiUser.userId is the user's DB id
}
```

### CORS for Public API Routes

The `/api/v1/*` routes use open CORS (SDK is called from any origin):

```typescript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
```

Internal routes (`/api/*` without `/v1/`) should not set CORS headers — they are called same-origin only.

---

## 9. AI Provider Integration Patterns

### Provider Abstraction

All AI providers are wrapped under `apps/web/src/lib/providers/`. The key files:

- `index.ts` — `resolveProviderConfig()`, `assertKeyPresent()`, provider re-exports
- `types.ts` — `GenerateParams`, `GenerateResult`, `ProviderName`, `ProviderConfig`
- `replicate.ts` — Replicate REST polling (FLUX, SDXL, ControlNet, Real-ESRGAN)
- `fal.ts` — Fal.ai REST (FLUX standard)
- `groq.ts` — Groq chat (Llama 3.3 70B) — used by Eral
- `comfyui.ts` — ComfyUI local server
- `pollinations.ts` / `huggingface.ts` / `stablehorde.ts` / `prodia.ts` — free tier providers
- `gemini.ts`, `openrouter.ts`, `cerebras.ts` — additional LLM providers

### Calling a Provider

```typescript
import { resolveProviderConfig, assertKeyPresent, replicateGenerate } from '@/lib/providers';

// Inside a queue job or server action — never inline in an API handler
async function runGeneration(params: GenerateParams, byokKey?: string) {
  const config = resolveProviderConfig('replicate', byokKey);
  assertKeyPresent('replicate', config);

  try {
    const result = await replicateGenerate(params, config.apiKey);
    return result;
  } catch (err) {
    // Handle ProviderError — check err.skipProvider to try fallback
    throw err;
  }
}
```

### Provider Selection Logic

`src/lib/provider-scoring.ts` — scoring system that selects the best provider based on:
- Provider health (via `src/lib/provider-health.ts`)
- User plan (free users get Fal.ai standard; pro users get Replicate HD)
- BYOK availability

### Error Handling

Provider errors should set `skipProvider = true` on 402 / credit errors so the scoring system can automatically fall back to another provider.

### Groq (Eral / Text AI)

```typescript
import { groqChat } from '@/lib/providers/groq';

const { text } = await groqChat(SYSTEM_PROMPT, userMessage, {
  model: 'llama-3.3-70b-versatile',
  maxTokens: 2048,
  temperature: 0.7,
  timeoutMs: 30_000,
});
```

Groq requires `GROQ_API_KEY`. The free tier is 30 req/min, 500K tokens/day.

### Replicate (HD Generation)

Replicate uses polling — the `replicateGenerate()` function creates a prediction and polls until `status === 'succeeded'`. The polling interval and timeout are configurable via `config.timeoutMs` (default 300s).

### Fal.ai (Standard Generation)

Fal.ai uses a queue-based request/response. Import `FAL_MODELS` from `providers/fal.ts` for available model IDs.

---

## 10. Queue Job Patterns (BullMQ / p-queue)

### Two-Tier Queue Architecture

WokGen has two queue layers:

**Layer 1: p-queue (process-local, always active)**
```typescript
// src/lib/gen-queue.ts
import PQueue from 'p-queue';

const genQueue = new PQueue({
  concurrency: parseInt(process.env.GENERATION_CONCURRENCY || '10', 10),
  timeout: 45_000,
});

// Usage: wraps any AI call to cap concurrency
const result = await genQueue.add(() => generate(params));
```

**Layer 2: BullMQ (Redis-backed, optional async workers)**
- Enabled when `BULL_MQ_ENABLED=true` AND `REDIS_URL` is set
- Use `QUEUE_ENABLED` export from `gen-queue.ts` to check
- `queueGeneration(params)` — push a job to the `generation` queue
- `getQueuedJobStatus(jobId)` — poll job state

### When to Use Which Layer

```typescript
import { QUEUE_ENABLED, queueGeneration, genQueue } from '@/lib/gen-queue';

if (QUEUE_ENABLED) {
  // Async path: push to BullMQ, return jobId to client for polling
  await queueGeneration({ jobId, userId, prompt, mode, style });
  return NextResponse.json({ jobId, status: 'queued' });
} else {
  // Sync path: run in-process via p-queue
  const result = await genQueue.add(() => runGeneration(params));
  return NextResponse.json({ result });
}
```

### Rule: Never Execute Inline

**AI generation must never be called directly in an API route handler without going through either `genQueue.add()` or `queueGeneration()`.** This prevents request timeouts and cascading failures.

```typescript
// ❌ Wrong — blocks the request, no concurrency control
export async function POST(req: Request) {
  const result = await replicateGenerate(params, apiKey); // DON'T DO THIS
  return NextResponse.json(result);
}

// ✅ Correct — goes through the process queue
export async function POST(req: Request) {
  const result = await genQueue.add(() => replicateGenerate(params, apiKey));
  return NextResponse.json(result);
}
```

### BullMQ Worker

The worker process lives at `src/worker/generate-worker.ts`. It processes jobs from the `generation` queue. Job attempts = 3, completed jobs kept (count: 100), failed jobs kept (count: 100).

---

## 11. Eral Companion Integration

### Overview

Eral is a separate WokSpec product (`wokspec/Eral` repo). WokGen integrates with it via:
1. **EralCompanion** — floating widget in the root layout (`src/components/EralCompanion.tsx`)
2. **EralSidebar** — collapsible panel in studio pages (`src/app/_components/EralSidebar.tsx`)
3. **WAP (Workflow Action Protocol)** — bidirectional DOM event bus
4. **/api/v1/eral** — server-side Eral proxy (Groq-backed)

### Integration Boundary

All constants and helpers are in `src/lib/eral-integration.ts`. **Do not import anything from the Eral repo directly.**

```typescript
import { ERAL_ENABLED, ERAL_URL, sendWAPToEral, onEralAction } from '@/lib/eral-integration';
```

### WAP Protocol

WokGen → Eral: dispatch `wap:dispatch` CustomEvent on `window`
Eral → WokGen: listen for `eral:action` CustomEvent on `window`

```typescript
import { sendWAPToEral } from '@/lib/eral-integration';
import type { WAPAction } from '@/lib/wap';

// Send context to Eral
sendWAPToEral({ type: 'studio:context', payload: { mode: 'pixel', prompt: currentPrompt } });

// Listen for Eral actions
import { onEralAction } from '@/lib/eral-integration';

useEffect(() => {
  const unsubscribe = onEralAction((action) => {
    if (action.type === 'generate:trigger') {
      // Eral asked WokGen to generate
    }
  });
  return unsubscribe;
}, []);
```

### Studio Context Shape

```typescript
export interface EralStudioContext {
  mode: string;       // "pixel" | "vector" | "business" | ...
  tool?: string;      // active tool within the studio
  prompt?: string;    // current prompt text
  studioContext?: string;  // freeform extra context
  projectId?: string;
}
```

### Feature Flag

Eral features are gated by `NEXT_PUBLIC_ERAL_ENABLED=true`. When false, all Eral UI components render nothing.

---

## 12. Key Environment Variables

See `docs/ENV.md` for the complete reference. Below are the most critical variables:

### Required to Start

```env
DATABASE_URL=postgresql://...       # Neon pooled URL (with ?pgbouncer=true)
DIRECT_URL=postgresql://...         # Neon direct URL (port 5432, no pgbouncer)
AUTH_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_BASE_URL=https://wokgen.wokspec.org
```

### Auth Providers

```env
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

### AI Providers

```env
FAL_KEY=                   # Fal.ai — standard image generation
REPLICATE_API_TOKEN=       # Replicate — HD generation + upscaling
GROQ_API_KEY=              # Groq — Eral AI chat (Llama 3.3 70B)
ANTHROPIC_API_KEY=         # Anthropic Claude — deep Eral companion
OPENAI_API_KEY=            # OpenAI — TTS
ELEVENLABS_API_KEY=        # ElevenLabs — primary TTS
HF_TOKEN=                  # HuggingFace — free-tier generation
```

### Queue / Redis

```env
REDIS_URL=redis://...            # Redis (for BullMQ)
UPSTASH_REDIS_REST_URL=          # Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_TOKEN=
BULL_MQ_ENABLED=true             # Set to enable async worker queue
GENERATION_CONCURRENCY=10        # p-queue concurrency cap
```

### Billing

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Observability

```env
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=               # For source map uploads
```

### Eral Integration

```env
NEXT_PUBLIC_ERAL_ENABLED=true
NEXT_PUBLIC_ERAL_URL=https://eral.wokspec.org
ERAL_API_URL=https://eral.wokspec.org/api   # server-side only
```

### Feature Flags / Tuning

```env
PROMPT_ENGINE=wokspec            # "wokspec" (internal) or "oss" (stub)
MAINTENANCE_MODE=false           # Set to "true" for downtime (returns 503)
GENERATION_TIMEOUT_MS=300000     # AI provider timeout in ms (default 5 min)
```

---

## 13. How to Add a New Generation Mode

A "mode" is a generation preset (e.g., `pixel`, `vector`, `business`, `animate`). Each mode has:
- A prompt builder in `src/lib/`
- Route entries in the studio UI
- A job tool value in the Prisma `Job` model

### Step-by-Step

**1. Create the prompt builder**
```typescript
// src/lib/prompt-builder-<mode>.ts
export interface <Mode>PromptParams { /* ... */ }
export function build<Mode>Prompt(params: <Mode>PromptParams): { positive: string; negative: string } {
  // Build and return prompt tokens
}
```

**2. Register in the prompt engine**
```typescript
// src/lib/prompt-engine.ts
import { build<Mode>Prompt } from './prompt-builder-<mode>';

// Add case to the mode switch
case '<mode>':
  return build<Mode>Prompt(params as <Mode>PromptParams);
```

**3. Add to the mode switcher UI**
```typescript
// src/app/_components/ModeSwitcher.tsx
// Add entry to the modes array
```

**4. Create the studio page** (if it needs its own page)
```
src/app/studio/<mode>/
├── page.tsx          # Server component, exports metadata
└── _client.tsx       # 'use client' — all interactive UI
```

**5. Add an API route if needed**
Follow the pattern in Section 8.

**6. Update the Job model tool enum** (if tracking jobs)
```prisma
// prisma/schema.prisma — add to tool field comment
/// Tool: generate | animate | rotate | inpaint | scene | <mode>
tool String @default("generate")
```
Then run `npm run db:migrate -- --name add_mode_<mode>`.

**7. Add quality profile** (optional)
```typescript
// src/lib/quality-profiles.ts
// Add QualityProfile entry for the new mode
```

**8. Wire up provider selection**
Update `src/lib/provider-scoring.ts` to handle which provider to use for the new mode.

---

## 14. How to Add a New API Route

### Internal route (session auth)

1. Create `apps/web/src/app/api/<feature>/route.ts`
2. Copy the template from Section 8
3. Add `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'`
4. Protect with `const session = await auth(); if (!session?.user?.id) return 401`

### Public SDK route (`/api/v1/`)

1. Create `apps/web/src/app/api/v1/<feature>/route.ts`
2. Use `authenticateApiKey` + `hasScope` (see Section 8)
3. Add open CORS headers
4. Apply rate limiting: `await checkRateLimit('v1:<feature>:<userId>', 20, 60_000)`
5. Document the new endpoint in `src/app/api/openapi/route.ts` (OpenAPI spec)

### Admin route

1. Create `apps/web/src/app/api/admin/<feature>/route.ts`
2. Check session AND `isAdmin` flag
3. These routes are not in the public SDK — no API key auth, no CORS

---

## 15. Style Presets

WokGen supports 18 style presets defined in `src/lib/prompt-builder-pixel.ts` (or similar). Preset names include:
- `retro`, `nes`, `gameboy`, `snes`, `gba`
- `modern`, `hd`, `16bit`, `32bit`
- `isometric`, `topdown`, `sidescroll`
- `minimal`, `cute`, `dark`, `neon`, `pastel`, `earthy`

Each preset maps to a curated token chain used in the prompt builder. Do not rename preset IDs — they are stored in user preferences and job records.

The UI for selecting presets is `src/components/studio/StylePresetGrid.tsx`.

---

## 16. Rate Limiting

### Layers

| Layer | Location | Backed by | Scope |
|-------|----------|-----------|-------|
| Edge coarse limit | `src/middleware.ts` | In-memory Map | 60 req/10s per IP on `/api/generate`, `/api/eral/chat` |
| Per-user API limit | Route handlers | Upstash Redis | Varies by plan and endpoint |
| In-memory fallback | `src/lib/rate-limiter.ts` | Map | Used when Redis is unavailable |
| Concurrent generation cap | `src/lib/gen-queue.ts` | p-queue | 10 concurrent AI calls per process |
| Per-user concurrent | `src/lib/quota.ts` | Redis | Shared across instances |

### Adding Rate Limiting to a New Route

```typescript
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limiter';

const key = getRateLimitKey(req, 'my-endpoint');
const rl = checkRateLimit(key, 10, 60_000); // 10 req/min
if (!rl.ok) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, {
    status: 429,
    headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
  });
}
```

---

## 17. Common Gotchas and Pitfalls

### Canvas in SSR

The pixel editor uses browser Canvas API. Next.js will try to SSR any imported component. Always:
```typescript
'use client';
// Guard effects that touch canvas
useEffect(() => {
  if (typeof window === 'undefined') return;
  // canvas code here
}, []);
```

### Prisma in Edge Runtime

Prisma uses Node.js runtime. Any route using Prisma must declare:
```typescript
export const runtime = 'nodejs';
```
Do NOT use Prisma in middleware or Edge API routes.

### NextAuth v5 Session in Server Components

In Next.js App Router Server Components, use:
```typescript
import { auth } from '@/lib/auth';
const session = await auth();
```
Not `getServerSession(authOptions)` (that's v4). Not `useSession()` (that's client-side only).

### BullMQ IORedis Connection

When creating a BullMQ `Queue` or `Worker`, pass `{ maxRetriesPerRequest: null }` to the IORedis connection or BullMQ will throw a runtime error.

### Neon Database Connections

Use the **pooled** URL (port 6432, `?pgbouncer=true`) for `DATABASE_URL` (runtime queries). Use the **direct** URL (port 5432, no pgbouncer) for `DIRECT_URL` (Prisma migrate only). Mixing these up causes connection exhaustion in production.

### p-queue Timeout vs BullMQ

p-queue's `timeout: 45_000` drops a job from the in-process queue — it does NOT cancel the ongoing fetch. The underlying AI provider call may still be running. Always set an `AbortSignal.timeout()` on provider fetch calls.

### `NEXT_PUBLIC_*` Variables at Build Time

Variables prefixed `NEXT_PUBLIC_` are baked into the client bundle at build time. Changing them requires a redeploy. Do not use them for secrets.

### Storybook Stories

Stories in `*.stories.tsx` are only loaded by Storybook — they are excluded from the production build by the webpack config. Keep story files co-located with components.

### `prisma db push` vs `prisma migrate`

`prisma db push` syncs the schema without creating a migration file. It's used in the Vercel build script for preview deployments with `--accept-data-loss`. **Never use it on production** — always use `prisma migrate deploy` in production CI.

### Discord Webhook Signature

The `/api/discord/interactions` route requires Ed25519 signature verification. Any code that modifies it must preserve the signature check — Discord will stop sending events if the endpoint returns 401.

---

## 18. Commit Conventions

Follow **Conventional Commits**:

```
<type>(<scope>): <short description>

[optional body]

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

**Types:**
- `feat` — new feature or capability
- `fix` — bug fix
- `chore` — maintenance, deps, config
- `refactor` — code restructuring without behavior change
- `docs` — documentation only
- `perf` — performance improvement
- `style` — formatting, whitespace (no logic change)
- `test` — adding or modifying tests
- `ci` — CI/CD workflow changes

**Scopes (optional, use when helpful):**
- `auth`, `studio`, `pixel`, `eral`, `queue`, `billing`, `api`, `db`, `providers`, `admin`

**Examples:**
```
feat(studio): add watercolor style preset
fix(queue): handle BullMQ connection retry on startup
chore(deps): update bullmq to 5.70.1
refactor(providers): extract BYOK key resolution to resolveProviderConfig
docs: update ENV.md with ERAL_API_URL
```

---

## 19. CI/CD Notes

The existing CI runs on GitHub Actions. Already in place:

- **CodeQL** — static security analysis (JavaScript/TypeScript)
- **Gitleaks** — secret scanning on every push and PR
- **Dependabot** — automated dependency PRs (npm, GitHub Actions)

### Build Commands (Vercel)

```bash
cd apps/web && npm ci
npm run build   # = prisma generate + prisma db push + next build
```

### Environment on Vercel

- Production: all env vars set in Vercel project settings
- Preview: same vars, but `DATABASE_URL` should point to a branch/preview DB (Neon branching recommended)

### Sentry Source Maps

The `SENTRY_AUTH_TOKEN` env var is required for source map uploads during CI build. Without it, Sentry source maps are skipped (non-fatal).

### TypeScript Checks

```bash
cd apps/web && npx tsc --noEmit
```

This runs against `tsconfig.json`. There is a `tsconfig.tsbuildinfo` for incremental builds.

### Testing

```bash
cd apps/web && npm run test       # vitest run (single pass)
npm run test:watch                # vitest watch mode
npm run test:coverage             # with coverage report
```

---

## 20. Agent-Specific Guidance

### For All Agents

- **Always run from `apps/web/`**, not the monorepo root
- **Do not modify** `prisma/migrations/` directly — always use `prisma migrate dev`
- **Do not commit** `.env`, `.env.local`, `.env.production` — these are in `.gitignore`
- **Do not change** `AUTH_SECRET` — doing so invalidates all active user sessions
- **Do not refactor** the `src/lib/providers/` interface without updating all callers
- **Always add** `export const runtime = 'nodejs'` to routes that use Prisma

### For Sweep

- If asked to add a new feature to the studio, follow Section 13 (new generation mode)
- If asked to add a new API route, follow Section 14
- Do not modify `prisma/schema.prisma` without explicit instruction — schema changes require migrations
- Rate limiting must be applied to any new public-facing AI endpoint
- Canvas operations must be guarded — no SSR canvas code

### For Claude / Copilot

- When generating API route code, include auth guard, input validation, rate limiting, and error handling
- When modifying Prisma queries, always include `select` to avoid over-fetching
- When adding a new AI provider call, wrap it in `genQueue.add()` — never call providers inline
- Prefer `@/lib/providers/index.ts` utilities over direct provider calls

### What NOT to Do

- ❌ Do not hardcode any API keys, secrets, or tokens in source code
- ❌ Do not add new OAuth providers without updating `src/lib/auth.ts` AND the Prisma adapter
- ❌ Do not bypass the rate limiter on generation endpoints
- ❌ Do not use `fetch()` directly to call AI providers — always go through the provider wrappers
- ❌ Do not add Canvas/DOM code to Server Components or API routes
- ❌ Do not modify CODEOWNERS, CodeQL config, or Gitleaks config without security team sign-off
- ❌ Do not add `console.log()` in production code — use `src/lib/logger.ts` (pino)
- ❌ Do not add new dependencies at the workspace root — add them to `apps/web/package.json`
