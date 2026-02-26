# WokGen

**Multi-mode generative asset platform for creators, developers, and teams.**

WokGen is a production Next.js 14 platform for AI-powered asset generation across multiple creative domains — images, vectors, UI mockups, 3D models, skyboxes, voice, and more. Built with a focus on developer experience, team workspaces, and production reliability.

**WokGen is open-source.** Run locally for development — connect to the cloud API.

**Live:** [wokgen.wokspec.org](https://wokgen.wokspec.org) · **Eral 7c** — site-wide AI companion

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](./LICENSE)

---

## What's Inside

| Studio | What it generates | Providers |
|--------|-------------------|-----------|
| **Pixel Studio** | Images — realistic, concept, anime, 3D render | Replicate, Fal, SDXL, Flux |
| **Vector Studio** | SVG icons, illustrations, logos | Recraft, Ideogram |
| **UI/UX Studio** | UI mockups, wireframes, design specs | Replicate |
| **Business Studio** | Branded marketing assets with brand kit injection | Replicate + brand context |
| **Voice Studio** | Speech synthesis from text | ElevenLabs, PlayHT |
| **Text Studio** | Copy, brand voice, structured content | Groq, Together, OpenAI |
| **3D Studio** | 3D models (GLB/FBX/OBJ) from text/image | Meshy |
| **Skybox** | 360° environment panoramas | Blockade Labs |

### Tools
- **Background Remover** — SSRF-protected, before/after slider
- **Vectorize** — Raster-to-SVG with local file upload
- **Transcribe** — Audio-to-text with word-level confidence (AssemblyAI)
- **Exa Search** — Semantic web search with filters and export
- **Link Scraper** — Firecrawl-powered full-page scrape
- **JSON Toolkit** — Format, validate, minify with line numbers

### Eral 7c
Site-wide AI companion with persistent memory, project/brand context, WAP (Workflow Action Protocol) — Eral can trigger generation jobs, manage projects, and inject brand kit into generations. Powered by Llama 3.3 70B (Groq), with 8 model variants.

---

## Tech Stack

```
Framework:     Next.js 14 (App Router)
Language:      TypeScript 5
Database:      PostgreSQL via Prisma ORM (Neon recommended)
Auth:          NextAuth v5 (GitHub + Google OAuth)
Queue:         BullMQ + Redis (Upstash recommended)
Payments:      Stripe (subscriptions + credit packs)
Monitoring:    Sentry
Rate limiting: Redis-backed (all generation routes)
Circuit breaker: Custom implementation (CLOSED/OPEN/HALF_OPEN)
Tests:         Vitest (30 tests)
Deploy:        Vercel (Hobby/Pro/Enterprise)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (local or [Neon](https://neon.tech) free tier)
- Redis (local or [Upstash](https://upstash.com) free tier)

### 1. Clone and install

```bash
git clone https://github.com/wokspec/WokGen.git
cd WokGen
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your values
```

Minimum required variables for local dev:
```
DATABASE_URL=postgresql://...
AUTH_SECRET=<run: openssl rand -base64 32>
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

See [apps/web/.env.example](./apps/web/.env.example) for all variables with descriptions.

### 3. Set up database

```bash
cd apps/web
npx prisma migrate dev
npx prisma generate
```

### 4. Run development server

```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
WokGen/
├── apps/
│   └── web/                  # Next.js 14 app
│       ├── src/
│       │   ├── app/          # App Router pages + API routes
│       │   │   ├── api/      # All API endpoints
│       │   │   ├── pixel/    # Pixel Studio
│       │   │   ├── vector/   # Vector Studio
│       │   │   ├── uiux/     # UI/UX Studio
│       │   │   ├── eral/     # Eral 7c AI companion
│       │   │   ├── tools/    # Individual tools
│       │   │   └── dashboard/
│       │   ├── components/   # Shared UI components
│       │   ├── lib/          # Core utilities (circuit breaker, WAP, SSRF, etc.)
│       │   └── hooks/        # React hooks
│       └── prisma/           # Schema + migrations
├── packages/
│   └── woksdk/               # WokGen SDK (npm-publishable)
├── extensions/               # Browser extension (Chrome/Firefox WIP)
├── docs/                     # Architecture and internal docs
└── scripts/                  # Database and deployment scripts
```

---

## API / WokSDK

WokGen exposes a REST API at `/api/v1/` authenticated via API keys (manage in Settings → API Keys).

```bash
npm install @wokspec/woksdk
```

```typescript
import { WokSDK } from '@wokspec/woksdk';

const wok = new WokSDK({ apiKey: 'wok_...' });

// Generate an image
const job = await wok.generate({
  mode: 'pixel',
  prompt: 'A cyberpunk cityscape at night',
  aspectRatio: '16:9',
});
```

See [packages/woksdk/README.md](./packages/woksdk/README.md) for full SDK documentation.

---

## Security

- All generation routes are rate-limited (Redis-backed, serverless-safe)
- SSRF protection on all URL-accepting routes
- API key authentication with per-key scoping
- Conversation ownership validation on Eral
- HMAC-signed webhook payloads
- Circuit breaker on external provider calls

Found a vulnerability? See [SECURITY.md](./SECURITY.md).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Adding a new generation mode
- Adding a new AI provider
- PR guidelines and review process

---

## Deployment

Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

Quick deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wokspec/WokGen&env=DATABASE_URL,AUTH_SECRET,AUTH_GITHUB_ID,AUTH_GITHUB_SECRET)

---

## License

Apache 2.0 — see [LICENSE](./LICENSE).

Copyright 2024 WokSpec.
