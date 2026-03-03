# WokGen

**Free, open-source pixel art studio — AI-powered generation + browser-based pixel editor.**

WokGen is a dedicated pixel art platform. Generate sprites, tilesets, animations, and game-ready assets with AI — then refine them in the built-in browser pixel editor.

**Live:** [wokgen.wokspec.org](https://wokgen.wokspec.org) · **Eral 7c** — site-wide AI companion

> 🎨 **Need vectors, brand kits, UI/UX, or voice?** Those studios live at **[Vecto](https://github.com/WokSpec/Vecto)** — `vecto.wokspec.org`

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](./LICENSE)

---

## What's Inside

| Tool | What it does |
|------|-------------|
| **AI Generator** | Generate pixel art sprites, characters, tilesets from a text prompt. 18 style presets. |
| **Animator** | Generate multi-frame sprite animations as looping GIFs. |
| **Scene Builder** | Generate cohesive tilesets and environmental scenes. |
| **Pixel Editor** | Browser-based canvas editor — pencil, fill, eraser, eyedropper, palette, PNG export. |
| **Pixel Gallery** | Browse and save community pixel art generations. |

### AI Providers

| Provider | Used For |
|----------|---------|
| Fal.ai / FLUX | Standard pixel art generation |
| FLUX Pro (Replicate) | HD quality generation |
| Real-ESRGAN | Upscaling generated assets |
| ControlNet | Guided generation from sketch/palette |

### Eral 7c
Site-wide AI companion with persistent memory and WAP (Workflow Action Protocol). Eral can trigger generation jobs, manage projects, and inject brand context. Powered by Llama 3.3 70B (Groq).

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
Rate limiting: Redis-backed
Tests:         Vitest
```

---

## Getting Started

```bash
git clone https://github.com/WokSpec/WokGen
cd WokGen
cp apps/web/.env.example apps/web/.env.local
# fill in your DB, auth, and API keys
npm install
npm run web:dev
```

Visit `http://localhost:3000`.

The pixel editor (`/editor`) works fully offline — no API keys needed.

---

## Project Structure

```
WokGen/
├── apps/
│   └── web/              # Next.js 14 app
│       ├── src/
│       │   ├── app/
│       │   │   ├── pixel/       # AI pixel art generation
│       │   │   ├── editor/      # Browser pixel editor
│       │   │   ├── gallery/     # Community gallery
│       │   │   ├── eral/        # Eral AI companion
│       │   │   └── api/         # API routes
│       │   ├── components/
│       │   │   └── pixel-editor/ # PixelEditorTool component
│       │   └── lib/
│       │       └── modes.ts     # Pixel mode config
│       └── prisma/
└── packages/             # Shared packages
```

---

## Related Projects

- **[Vecto](https://github.com/WokSpec/Vecto)** — AI studio for vectors, brand, UI/UX, voice (`vecto.wokspec.org`)
- **[WokTool](https://github.com/WokSpec/WokTool)** — 80+ free browser-based dev & design tools (`woktool.wokspec.org`)
- **[WokSite](https://github.com/WokSpec/WokSite)** — WokSpec marketing site

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). All contributions welcome.

## License

Apache 2.0 — see [LICENSE](./LICENSE).
