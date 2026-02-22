import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Reference · Docs',
  description: 'WokGen generation API reference for self-hosted deployments.',
};

export default function DocsAPI() {
  return (
    <div className="docs-page">
      <div className="docs-page-inner">

        {/* Sidebar */}
        <aside className="docs-sidebar">
          <Link href="/docs" className="docs-back">← Docs Hub</Link>
          <div className="docs-sidebar-mode">
            <span>⚡</span> API
          </div>
          <nav className="docs-toc">
            <a href="#overview" className="docs-toc-link">Overview</a>
            <a href="#generate" className="docs-toc-link">POST /api/generate</a>
            <a href="#gallery" className="docs-toc-link">GET /api/gallery</a>
            <a href="#providers" className="docs-toc-link">Providers</a>
            <a href="#modes" className="docs-toc-link">Modes</a>
            <a href="#errors" className="docs-toc-link">Errors</a>
          </nav>
        </aside>

        {/* Content */}
        <main className="docs-content">
          <div className="docs-content-header">
            <h1 className="docs-title">API Reference</h1>
            <p className="docs-subtitle">Internal API documentation for WokGen&apos;s generation endpoints. Primarily relevant for self-hosted deployments.</p>
          </div>

          <div className="docs-callout docs-callout--warn">
            <span className="docs-callout-icon">⚠</span>
            <span>The WokGen API is designed for self-hosted use. The hosted service at wokgen.wokspec.org is not a public API — it requires authentication and enforces rate limits.</span>
          </div>

          <section id="overview">
            <h2 className="docs-h2">Overview</h2>
            <p className="docs-p">WokGen exposes a simple REST API for asset generation. In self-hosted mode (<code className="docs-code">SELF_HOSTED=true</code>), the API accepts BYOK (bring-your-own-key) credentials and has no authentication requirements. In hosted mode, all endpoints require a valid session.</p>
          </section>

          <section id="generate">
            <h2 className="docs-h2">POST /api/generate</h2>
            <p className="docs-p">The primary generation endpoint. Accepts a JSON body and returns the generated image URL.</p>
            <h3 className="docs-h3">Request Body</h3>
            <pre className="docs-pre">{`{
  "tool":        "generate",          // generate | animate | rotate | inpaint | scene
  "mode":        "pixel",             // pixel | business | vector | emoji | uiux
  "prompt":      "RPG sword icon",    // required
  "negPrompt":   "blurry, watermark", // optional
  "width":       128,                 // 32–2048
  "height":      128,                 // 32–2048
  "seed":        42,                  // optional, for reproducibility
  "quality":     "standard",          // standard | hd
  "isPublic":    false,               // share to gallery
  "provider":    "pollinations",      // self-hosted: replicate | fal | together | comfyui
  "apiKey":      "...",               // self-hosted BYOK
  // Pixel-specific
  "stylePreset": "rpg_icon",
  "pixelEra":    "gba",
  "paletteSize": 16,
  // Business-specific (mode=business)
  "extra": {
    "businessTool":     "logo",
    "businessStyle":    "minimal_flat",
    "businessMood":     "professional",
    "businessPlatform": "og_image",
    "brandKitIndex":    1             // 1–4 for brand kit
  }
}`}</pre>
            <h3 className="docs-h3">Response</h3>
            <pre className="docs-pre">{`{
  "ok":          true,
  "resultUrl":   "https://...",       // generated image URL
  "resultUrls":  null,                // multi-image results (some tools)
  "job": {
    "id":        "cm...",
    "status":    "succeeded"
  },
  "durationMs":  1842,
  "resolvedSeed": 1234567890
}`}</pre>
          </section>

          <section id="gallery">
            <h2 className="docs-h2">GET /api/gallery</h2>
            <p className="docs-p">Fetches gallery assets with pagination and filtering.</p>
            <h3 className="docs-h3">Query Parameters</h3>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Param</th><th>Type</th><th>Description</th></tr>
                </thead>
                <tbody>
                  <tr><td><code className="docs-code">mode</code></td><td>string</td><td>Filter by mode: pixel, business, etc.</td></tr>
                  <tr><td><code className="docs-code">mine</code></td><td>boolean</td><td>Return only authenticated user&apos;s assets</td></tr>
                  <tr><td><code className="docs-code">tool</code></td><td>string</td><td>Filter by tool: generate, logo, etc.</td></tr>
                  <tr><td><code className="docs-code">cursor</code></td><td>string</td><td>Pagination cursor (asset ID)</td></tr>
                  <tr><td><code className="docs-code">limit</code></td><td>number</td><td>Page size, max 50</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="providers">
            <h2 className="docs-h2">Providers</h2>
            <p className="docs-p">WokGen supports multiple AI providers via a unified interface:</p>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Provider</th><th>Env Var</th><th>Free Tier</th><th>Quality</th></tr>
                </thead>
                <tbody>
                  <tr><td>Pollinations</td><td>—</td><td>✓ Always</td><td>Standard</td></tr>
                  <tr><td>HuggingFace</td><td>HF_TOKEN</td><td>✓ Limited</td><td>Standard+</td></tr>
                  <tr><td>Together.ai</td><td>TOGETHER_API_KEY</td><td>✓ Credits</td><td>High</td></tr>
                  <tr><td>fal.ai</td><td>FAL_KEY</td><td>✗</td><td>High</td></tr>
                  <tr><td>Replicate</td><td>REPLICATE_API_TOKEN</td><td>✗</td><td>HD/Best</td></tr>
                  <tr><td>ComfyUI</td><td>COMFYUI_HOST</td><td>✓ Self-hosted</td><td>Custom</td></tr>
                </tbody>
              </table>
            </div>
            <p className="docs-p">In hosted mode, the provider is selected automatically based on configured environment variables. In self-hosted mode, you choose the provider and supply your own key.</p>
          </section>

          <section id="modes">
            <h2 className="docs-h2">Modes</h2>
            <p className="docs-p">The <code className="docs-code">mode</code> parameter controls which prompt pipeline is used. Business mode automatically calls the business prompt builder to enrich your concept into a professional asset prompt with appropriate negative prompts and platform-correct dimensions.</p>
            <div className="docs-callout docs-callout--tip">
              <span className="docs-callout-icon">✦</span>
              <span>For business mode, pass <code className="docs-code">extra.businessTool</code>, <code className="docs-code">extra.businessStyle</code>, and <code className="docs-code">extra.businessMood</code> to get enriched prompts. Without these, the API will use sensible defaults.</span>
            </div>
          </section>

          <section id="errors">
            <h2 className="docs-h2">Error Responses</h2>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Status</th><th>Meaning</th></tr>
                </thead>
                <tbody>
                  <tr><td>400</td><td>Invalid request body or parameters</td></tr>
                  <tr><td>401</td><td>Not authenticated or missing provider key</td></tr>
                  <tr><td>429</td><td>Rate limit exceeded or no HD credits remaining</td></tr>
                  <tr><td>503</td><td>Provider unavailable</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="docs-content-footer">
            <Link href="/docs" className="btn-ghost btn-sm">← Docs Hub</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
