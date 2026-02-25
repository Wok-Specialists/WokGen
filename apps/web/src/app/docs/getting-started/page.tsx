import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Getting Started — WokGen Docs',
  description:
    'New to WokGen? This guide walks you through your first generation in under 5 minutes, ' +
    'explains all six studio modes, introduces Eral 7c, shows you how to access ' +
    '35+ free browser tools, and covers accounts, community, and the API.',
};

// ---------------------------------------------------------------------------
// Component helpers
// ---------------------------------------------------------------------------

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="docs-heading-2">{children}</h2>;
}

function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h3 id={id} className="docs-heading-3">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="docs-p">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="docs-ul">{children}</ul>;
}

function LI({ children }: { children: React.ReactNode }) {
  return <li className="docs-li">{children}</li>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="docs-code">{children}</code>;
}

function Pre({ children }: { children: React.ReactNode }) {
  return <pre className="docs-pre">{children}</pre>;
}

function Callout({
  children,
  type = 'info',
}: {
  children: React.ReactNode;
  type?: 'info' | 'tip' | 'warn';
}) {
  const icons = { info: 'ℹ', tip: '→', warn: '⚠' };
  return (
    <div className={`docs-callout docs-callout--${type}`}>
      <span className="docs-callout-icon">{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GettingStarted() {
  return (
    <main className="docs-main">
      {/* Page header */}
      <div className="docs-content-header">
        <div className="landing-badge">
          <span className="landing-badge-dot" style={{ background: '#7c5cfc' }} />
          Getting Started
        </div>
        <h1 className="docs-title">Getting Started with WokGen</h1>
        <p className="docs-subtitle">
          From zero to your first AI-generated asset in under 5 minutes.
        </p>
      </div>

      {/* ================================================================== */}
      {/* 1. WHAT IS WOKGEN?                                                  */}
      {/* ================================================================== */}
      <H2 id="what-is-wokgen">1. What is WokGen?</H2>
      <P>
        WokGen is a multi-vertical AI asset generation platform. It gives creators, developers,
        and designers a single place to generate pixel art, business graphics, vector icons,
        UI components, voice audio, and marketing copy — each with a purpose-built studio
        tuned for that specific asset type.
      </P>
      <P>
        Every studio shares a common backbone: a prompt field, a style preset picker, quality
        controls (Standard free / HD credit-based), and a generation history tied to your
        workspace. What differs is the <em>model configuration</em>, the toolset, and the
        export pipeline — WokGen Pixel ships pixel-correct PNGs at integer sizes while
        WokGen Business ships presentation-ready rasters at display resolution.
      </P>
      <P>
        WokGen is free to use. Standard-quality generations are unlimited and cost nothing.
        HD generations use a premium model and consume credits. There is no paywall to try
        any studio — open one and start generating.
      </P>

      {/* ================================================================== */}
      {/* 2. FIRST GENERATION                                                 */}
      {/* ================================================================== */}
      <H2 id="first-generation">2. Your First Generation</H2>
      <P>
        The fastest way to learn WokGen is to generate something with Pixel mode.
        Pixel art has very visible, predictable outputs — great for a first experiment.
      </P>

      <div className="docs-steps">
        <div className="docs-step">
          <div className="docs-step-num">1</div>
          <div className="docs-step-body">
            <div className="docs-step-title">Open Pixel mode</div>
            <div className="docs-step-desc">
              Navigate to <Link href="/pixel/studio" className="docs-inline-link">wokgen.io/pixel/studio</Link>.
              You do not need an account to generate in Standard quality.
            </div>
          </div>
        </div>
        <div className="docs-step">
          <div className="docs-step-num">2</div>
          <div className="docs-step-body">
            <div className="docs-step-title">Pick a style preset</div>
            <div className="docs-step-desc">
              Select <strong>rpg_icon</strong> from the Style Preset dropdown. This preset is
              tuned for small, clear item sprites — great for beginners.
            </div>
          </div>
        </div>
        <div className="docs-step">
          <div className="docs-step-num">3</div>
          <div className="docs-step-body">
            <div className="docs-step-title">Write a short prompt</div>
            <div className="docs-step-desc">
              Type: <Code>iron sword with blue gem</Code>. Keep it noun-focused.
              No need to write &ldquo;pixel art&rdquo; — the preset handles that.
            </div>
          </div>
        </div>
        <div className="docs-step">
          <div className="docs-step-num">4</div>
          <div className="docs-step-body">
            <div className="docs-step-title">Set size to 32×32</div>
            <div className="docs-step-desc">
              32×32 is the standard icon size. Leave quality on Standard (free).
            </div>
          </div>
        </div>
        <div className="docs-step">
          <div className="docs-step-num">5</div>
          <div className="docs-step-body">
            <div className="docs-step-title">Generate &amp; preview</div>
            <div className="docs-step-desc">
              Click <strong>Generate</strong>. In 3–8 seconds your sprite appears.
              Use the zoom button to see it at 4× — that&apos;s how it looks in a typical game.
            </div>
          </div>
        </div>
        <div className="docs-step">
          <div className="docs-step-num">6</div>
          <div className="docs-step-body">
            <div className="docs-step-title">Download</div>
            <div className="docs-step-desc">
              Click <strong>Download PNG</strong>. The file is named
              <Code>wokgen-rpg_icon-iron-sword-{'{seed}'}.png</Code>. Drop it into Unity,
              Godot, or any engine that accepts PNG — it&apos;s ready to use.
            </div>
          </div>
        </div>
      </div>

      <Callout type="tip">
        Not happy with the first result? Click <strong>Generate</strong> again. Each run uses a
        different random seed so you get a new variation. Iterate fast on Standard, then switch
        to HD for your final pick.
      </Callout>

      {/* ================================================================== */}
      {/* 3. UNDERSTANDING MODES                                              */}
      {/* ================================================================== */}
      <H2 id="understanding-modes">3. Understanding Modes</H2>
      <P>
        WokGen has six studios. Each is a separate AI configuration — not just a style filter
        on a single model. Use the studio that matches your target asset type.
      </P>

      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Studio</th>
              <th>Best for</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Pixel', 'Game sprites, tilesets, animations, icons', 'PNG, GIF, spritesheet'],
              ['Business', 'Logos, brand assets, slide visuals, banners', 'PNG, high-res raster'],
              ['Vector', 'Icon sets, illustrations, design system parts', 'SVG, PNG'],
              ['UI/UX', 'React components, Tailwind sections, Next.js pages', 'Code (TSX/HTML)'],
              ['Voice', 'Narration, NPC dialogue, podcast intros, ads', 'MP3, WAV'],
              ['Text', 'Blog posts, product copy, emails, social captions', 'Markdown, plain text'],
            ].map(([studio, best, output]) => (
              <tr key={studio}>
                <td><strong>{studio}</strong></td>
                <td>{best}</td>
                <td><Code>{output}</Code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="info">
        All studios share your workspace, history, and gallery. You can mix asset types in
        the same project.
      </Callout>

      {/* ================================================================== */}
      {/* 4. USING ERAL                                                       */}
      {/* ================================================================== */}
      <H2 id="using-eral">4. Using Eral</H2>
      <P>
        Eral is the WokGen AI director. You can talk to Eral in plain English or use WAP
        (WokGen Action Protocol) slash commands to control the platform without touching the
        GUI. Open the Eral panel from any studio by clicking the chat icon in the top-right
        corner.
      </P>
      <H3>Try your first command</H3>
      <Pre>{`generate a neon city skyline tileset, 16×16, cyberpunk palette`}</Pre>
      <P>
        Eral interprets the request, fills in the studio settings, and starts generation.
        You don&apos;t need to navigate menus.
      </P>
      <H3>Director Mode</H3>
      <P>
        For complex jobs — like building a full 8-directional character sheet — start your
        message with <Code>/director</Code>. Eral will plan the individual generation steps,
        run them in parallel, and assemble the results. See the{' '}
        <Link href="/docs/eral">Eral guide</Link> for the full reference.
      </P>

      {/* ================================================================== */}
      {/* 5. FREE TOOLS                                                       */}
      {/* ================================================================== */}
      <H2 id="free-tools">5. Free Tools</H2>
      <P>
        WokGen ships 35+ browser-based creative tools — no account, no install, no cost.
        Each tool is a standalone utility that works entirely in your browser.
      </P>
      <UL>
        <LI><strong>Pixel tools</strong> — sprite editor, palette extractor, tile packer, GIF optimizer</LI>
        <LI><strong>Color tools</strong> — palette generator, contrast checker, gradient builder</LI>
        <LI><strong>Image tools</strong> — background remover, upscaler, format converter</LI>
        <LI><strong>Dev tools</strong> — JSON formatter, base64 encoder, regex tester</LI>
        <LI><strong>Typography tools</strong> — font pairer, line-height calculator, fluid type scale</LI>
      </UL>
      <P>
        Access all tools at <Link href="/tools">wokgen.io/tools</Link>. They are completely
        free — no sign-in required. They exist independently of the AI generation features.
      </P>

      {/* ================================================================== */}
      {/* 6. CREATING AN ACCOUNT                                              */}
      {/* ================================================================== */}
      <H2 id="creating-an-account">6. Creating an Account</H2>
      <P>
        Sign in with GitHub — no password, no email form. Click <strong>Sign in</strong>
        in the top-right, authorise the GitHub OAuth app, and you&apos;re in.
      </P>
      <H3>What you get with a free account</H3>
      <UL>
        <LI>Unlimited Standard-quality generations across all studios</LI>
        <LI>Gallery storage for all your generations (no expiry)</LI>
        <LI>Up to 3 workspaces to organise projects</LI>
        <LI>Access to Eral 7c</LI>
        <LI>Project history and seed reproducibility</LI>
        <LI>API access with personal API key</LI>
      </UL>
      <H3>What requires credits</H3>
      <UL>
        <LI>HD-quality generations (premium model, sharper output)</LI>
        <LI>Multi-frame HD animations (charged per frame)</LI>
      </UL>
      <Callout type="info">
        WokGen does not impose generation limits on free accounts beyond anti-abuse rate
        limiting (30 requests/minute for authenticated users). There is no daily cap on
        Standard generations.
      </Callout>

      {/* ================================================================== */}
      {/* 7. API QUICKSTART                                                   */}
      {/* ================================================================== */}
      <H2 id="api-quickstart">7. API Quickstart</H2>
      <P>
        Every studio is accessible via the WokGen REST API. Authenticate with your personal
        API key from <Link href="/settings/api">Settings → API Keys</Link>.
      </P>

      <H3>Example — generate a Pixel asset</H3>
      <Pre>{`GET /api/generate
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "mode": "pixel",
  "prompt": "RPG warrior character sprite",
  "width": 64,
  "height": 64
}`}</Pre>

      <H3>Response</H3>
      <Pre>{`{
  "id": "gen_abc123",
  "status": "complete",
  "url": "https://cdn.wokgen.io/gen/gen_abc123.png",
  "seed": 4829103,
  "width": 64,
  "height": 64,
  "mode": "pixel",
  "preset": "rpg_character"
}`}</Pre>

      <P>
        See the full <Link href="/docs/api">API Reference</Link> for all endpoints,
        parameter schemas, and error codes.
      </P>

      {/* ================================================================== */}
      {/* 8. COMMUNITY                                                        */}
      {/* ================================================================== */}
      <H2 id="community">8. Joining the Community</H2>
      <UL>
        <LI>
          <strong>Gallery</strong> — browse and share public generations at{' '}
          <Link href="/gallery">wokgen.io/gallery</Link>. Like and save assets from
          other creators. All public gallery items include the full prompt and settings.
        </LI>
        <LI>
          <strong>Discord</strong> — join the WokGen Discord server for real-time help,
          showcases, and early feature previews. Link in the site footer.
        </LI>
        <LI>
          <strong>GitHub</strong> — WokGen is open source. File issues, submit PRs, or
          fork it for self-hosting at{' '}
          <a href="https://github.com/wokspec/WokGen" target="_blank" rel="noopener noreferrer">
            github.com/wokspec/WokGen
          </a>.
        </LI>
      </UL>

      {/* Footer */}
      <div className="docs-content-footer">
        <Link href="/docs" className="btn-ghost btn-sm">← Docs Hub</Link>
        <Link href="/docs/pixel" className="btn-ghost btn-sm">Pixel Docs →</Link>
      </div>
    </main>
  );
}
