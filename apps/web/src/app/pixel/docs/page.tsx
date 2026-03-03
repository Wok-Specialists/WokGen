import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pixel Studio Docs — WokGen',
  description:
    'Complete guide to WokGen Pixel Studio: AI generation, browser pixel editor, palette studio, ' +
    'sprite atlas packer. Prompting tips, provider comparison, keyboard shortcuts.',
  openGraph: {
    title: 'Pixel Studio Docs — WokGen',
    description: 'Complete guide to WokGen Pixel Studio tools, AI generation tips, keyboard shortcuts.',
  },
};

export default function DocsPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-title-row">
            <h1 className="page-title">Documentation</h1>
            <Link href="/pixel/studio" className="btn-ghost btn-sm">Open Studio →</Link>
          </div>
          <p className="page-subtitle">
            Everything you need to know about WokGen Pixel Studio — tools, tips, providers, and shortcuts.
          </p>
        </div>
      </div>

      <div className="page-content docs-layout">
        {/* Sidebar nav */}
        <nav className="docs-nav">
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#ai-generator">AI Generator</a></li>
            <li><a href="#pixel-editor">Pixel Editor</a></li>
            <li><a href="#palette-studio">Palette Studio</a></li>
            <li><a href="#atlas-packer">Atlas Packer</a></li>
            <li><a href="#prompting">Prompting Tips</a></li>
            <li><a href="#providers">Providers</a></li>
            <li><a href="#shortcuts">Keyboard Shortcuts</a></li>
          </ul>
        </nav>

        {/* Content */}
        <article className="docs-content">
          {/* ---- Overview ---- */}
          <section id="overview">
            <h2>Overview</h2>
            <p>
              WokGen is a dedicated pixel art studio that combines AI-powered generation with hands-on
              browser tools. Everything runs in the browser — no downloads, no plugins.
            </p>
            <div className="docs-tool-grid">
              <Link href="/pixel/studio" className="docs-tool-card">
                <span className="docs-tool-icon">🤖</span>
                <strong>AI Generator</strong>
                <span>Generate sprites, tiles, animations with AI</span>
              </Link>
              <Link href="/editor" className="docs-tool-card">
                <span className="docs-tool-icon">✏️</span>
                <strong>Pixel Editor</strong>
                <span>Full-featured canvas editor with animation frames</span>
              </Link>
              <Link href="/pixel/palette" className="docs-tool-card">
                <span className="docs-tool-icon">🎨</span>
                <strong>Palette Studio</strong>
                <span>Browse, create, and extract color palettes</span>
              </Link>
              <Link href="/pixel/atlas" className="docs-tool-card">
                <span className="docs-tool-icon">📦</span>
                <strong>Atlas Packer</strong>
                <span>Pack sprites into texture atlases</span>
              </Link>
            </div>
          </section>

          {/* ---- AI Generator ---- */}
          <section id="ai-generator">
            <h2>AI Generator</h2>
            <p>
              The AI Generator creates pixel art from text prompts. It supports five generation modes:
            </p>
            <table className="docs-table">
              <thead><tr><th>Mode</th><th>What it does</th></tr></thead>
              <tbody>
                <tr><td><strong>Generate</strong></td><td>Create a new pixel art image from a text prompt</td></tr>
                <tr><td><strong>Animate</strong></td><td>Add animation frames to an existing sprite</td></tr>
                <tr><td><strong>Rotate</strong></td><td>Generate additional rotation angles of a sprite</td></tr>
                <tr><td><strong>Inpaint</strong></td><td>Redraw a selected region of an existing image</td></tr>
                <tr><td><strong>Scene</strong></td><td>Compose multiple sprites into a pixel art scene</td></tr>
              </tbody>
            </table>

            <h3>Style Presets</h3>
            <p>
              18 built-in style presets tune the generation toward specific aesthetics: NES, SNES, Game Boy,
              PICO-8, Isometric, RPG Tile, and more. Selecting a preset automatically enriches your prompt
              with the appropriate palette and resolution modifiers.
            </p>

            <h3>Canvas Size</h3>
            <p>
              Choose from 16×16 (icons), 32×32 (sprites), 64×64 (detailed), 128×128 (scenes), or custom sizes.
              Smaller canvases generate faster; larger canvases provide more detail.
            </p>
          </section>

          {/* ---- Pixel Editor ---- */}
          <section id="pixel-editor">
            <h2>Pixel Editor</h2>
            <p>
              A full-featured browser canvas editor for drawing, editing, and animating pixel art.
              No account required — works entirely in your browser.
            </p>
            <h3>Tools</h3>
            <table className="docs-table">
              <thead><tr><th>Tool</th><th>Key</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td>✏️ Pencil</td><td><kbd>B</kbd></td><td>Draw individual pixels</td></tr>
                <tr><td>⬜ Eraser</td><td><kbd>E</kbd></td><td>Erase pixels (set to transparent)</td></tr>
                <tr><td>🪣 Fill</td><td><kbd>G</kbd> or <kbd>F</kbd></td><td>Flood-fill a region with the current color</td></tr>
                <tr><td>🔬 Eyedropper</td><td><kbd>I</kbd></td><td>Pick a color from the canvas</td></tr>
                <tr><td>╱ Line</td><td><kbd>L</kbd></td><td>Draw a straight line (Bresenham)</td></tr>
                <tr><td>▭ Rectangle</td><td><kbd>R</kbd></td><td>Draw a rectangle outline or filled rect</td></tr>
                <tr><td>○ Circle</td><td><kbd>C</kbd></td><td>Draw a circle outline or filled ellipse</td></tr>
                <tr><td>✥ Move</td><td><kbd>V</kbd></td><td>Pan the canvas viewport</td></tr>
              </tbody>
            </table>

            <h3>Animation Frames</h3>
            <p>
              The Frames panel at the bottom lets you create multi-frame animations. Each frame is an
              independent canvas. You can:
            </p>
            <ul>
              <li>Add frames with <strong>+ Add Frame</strong></li>
              <li>Duplicate a frame by hovering it and clicking ⧉</li>
              <li>Delete a frame by hovering it and clicking ✕</li>
              <li>Preview the animation at 4–24 FPS with <strong>▶ Play</strong></li>
              <li>Export all frames as a GIF or a horizontal spritesheet PNG</li>
            </ul>

            <h3>Export Options</h3>
            <table className="docs-table">
              <thead><tr><th>Export</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td>PNG</td><td>Exports the current frame at the selected scale (1×–8×)</td></tr>
                <tr><td>Sheet</td><td>Exports all frames as a horizontal spritesheet PNG</td></tr>
                <tr><td>GIF</td><td>Exports all frames as an animated GIF at the current FPS</td></tr>
              </tbody>
            </table>

            <h3>Import</h3>
            <p>
              Click <strong>📥 Import</strong> to load a PNG, GIF, or WebP image onto the current canvas.
              The image is scaled to fit the current grid size.
            </p>

            <h3>Save / Load</h3>
            <p>
              Use <strong>💾 Save</strong> to download your project as a JSON file containing all frames and
              settings. Use <strong>📂 Load</strong> to restore a previously saved project.
            </p>
          </section>

          {/* ---- Palette Studio ---- */}
          <section id="palette-studio">
            <h2>Palette Studio</h2>
            <p>Browse, create, and extract pixel art color palettes.</p>
            <h3>Built-in Palettes</h3>
            <p>
              Includes 10 curated palettes: PICO-8, NES (2C02), Game Boy, Game Boy Color,
              CGA, Endesga 32, Sweetie 16, Resurrect 64, Lospec 500, and Grayscale.
            </p>
            <h3>Create Your Own</h3>
            <p>Use the color picker to add colors one by one and save as a named palette.</p>
            <h3>Extract from Image</h3>
            <p>
              Upload any image and WokGen will extract the most prominent colors (deduplicating
              colors that are too similar). You can configure how many colors to extract (8, 16, or 32).
            </p>
            <h3>Export</h3>
            <p>
              Export any palette as <strong>CSS variables</strong>, <strong>JSON</strong>,
              a <strong>hex list</strong>, or a plain <strong>text file</strong>. Sort swatches by
              original order, hue, or luminance.
            </p>
          </section>

          {/* ---- Atlas Packer ---- */}
          <section id="atlas-packer">
            <h2>Sprite Atlas Packer</h2>
            <p>
              Upload multiple PNG sprites and pack them into a single texture atlas for use in games
              and apps. Exports a PNG + a JSON manifest compatible with Phaser, Three.js, and TexturePacker.
            </p>
            <h3>Pack Modes</h3>
            <table className="docs-table">
              <thead><tr><th>Mode</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><strong>Rows</strong></td><td>Best-fit decreasing — packs sprites efficiently by height</td></tr>
                <tr><td><strong>Grid</strong></td><td>Equal-size cells in a square-ish grid layout</td></tr>
                <tr><td><strong>Strip</strong></td><td>All sprites in a single horizontal row</td></tr>
              </tbody>
            </table>
            <h3>Options</h3>
            <ul>
              <li><strong>Padding:</strong> Space between sprites (0–32px)</li>
              <li><strong>Power-of-2:</strong> Snap atlas dimensions to nearest power of 2 (required by some GPU APIs)</li>
              <li><strong>Export scale:</strong> Export at 1×, 2×, or 4× resolution</li>
            </ul>
          </section>

          {/* ---- Prompting Tips ---- */}
          <section id="prompting">
            <h2>Prompting Tips</h2>
            <p>These techniques help the AI produce better pixel art:</p>
            <ul>
              <li>Specify the subject clearly: <em>&quot;16×16 pixel art knight sprite, facing right&quot;</em></li>
              <li>Name the art style / era: <em>&quot;NES style&quot;</em>, <em>&quot;Game Boy palette&quot;</em>, <em>&quot;SNES RPG&quot;</em></li>
              <li>Describe the palette explicitly: <em>&quot;4-color green palette like Game Boy&quot;</em></li>
              <li>Add intended use: <em>&quot;for a top-down dungeon game&quot;</em>, <em>&quot;platformer tileset&quot;</em></li>
              <li>Use the <strong>Enhance</strong> button (⌘↑) to automatically enrich your prompt with pixel art style modifiers</li>
              <li>Try different style presets for the same prompt — results vary significantly by preset</li>
            </ul>

            <h3>Prompt Examples</h3>
            <table className="docs-table">
              <thead><tr><th>Goal</th><th>Example prompt</th></tr></thead>
              <tbody>
                <tr><td>Game icon</td><td>16×16 pixel art sword icon, simple, dark fantasy, black outline</td></tr>
                <tr><td>Character sprite</td><td>32×32 pixel art warrior front-facing idle, SNES RPG style, limited palette</td></tr>
                <tr><td>Tileset</td><td>pixel art grass/dirt tileset top-down, 16×16 tiles, NES palette</td></tr>
                <tr><td>Background</td><td>pixel art cyberpunk city skyline, 128×64, night, neon colors, SNES</td></tr>
                <tr><td>Enemy</td><td>pixel art slime monster idle, 16×16, 4 frames, Game Boy green palette</td></tr>
              </tbody>
            </table>
          </section>

          {/* ---- Providers ---- */}
          <section id="providers">
            <h2>AI Providers</h2>
            <p>WokGen routes generation to one of several AI providers. Each has different strengths:</p>
            <table className="docs-table">
              <thead><tr><th>Provider</th><th>Strengths</th><th>Speed</th><th>Cost</th></tr></thead>
              <tbody>
                <tr><td>Standard (free)</td><td>Good general pixel art, no credits needed</td><td>Medium</td><td>Free</td></tr>
                <tr><td>Eral HD</td><td>Highest quality, fine pixel detail</td><td>Slower</td><td>Credits</td></tr>
                <tr><td>Fast</td><td>Quick iterations for prototyping</td><td>Fast</td><td>Credits</td></tr>
                <tr><td>Stable Diffusion</td><td>Stylistic variety, LoRA support</td><td>Medium</td><td>Credits</td></tr>
                <tr><td>Flux</td><td>Photorealistic pixel art interpretation</td><td>Medium</td><td>Credits</td></tr>
              </tbody>
            </table>
          </section>

          {/* ---- Shortcuts ---- */}
          <section id="shortcuts">
            <h2>Keyboard Shortcuts</h2>
            <h3>Pixel Editor</h3>
            <table className="docs-table">
              <thead><tr><th>Key</th><th>Action</th></tr></thead>
              <tbody>
                <tr><td><kbd>B</kbd></td><td>Pencil tool</td></tr>
                <tr><td><kbd>E</kbd></td><td>Eraser tool</td></tr>
                <tr><td><kbd>G</kbd> / <kbd>F</kbd></td><td>Fill tool</td></tr>
                <tr><td><kbd>I</kbd></td><td>Eyedropper tool</td></tr>
                <tr><td><kbd>L</kbd></td><td>Line tool</td></tr>
                <tr><td><kbd>R</kbd></td><td>Rectangle tool</td></tr>
                <tr><td><kbd>C</kbd></td><td>Circle tool</td></tr>
                <tr><td><kbd>V</kbd></td><td>Move/Pan tool</td></tr>
                <tr><td><kbd>Ctrl+Z</kbd></td><td>Undo</td></tr>
                <tr><td><kbd>Ctrl+Shift+Z</kbd></td><td>Redo</td></tr>
                <tr><td><kbd>=</kbd> / <kbd>+</kbd></td><td>Zoom in</td></tr>
                <tr><td><kbd>-</kbd></td><td>Zoom out</td></tr>
              </tbody>
            </table>

            <h3>AI Studio</h3>
            <table className="docs-table">
              <thead><tr><th>Key</th><th>Action</th></tr></thead>
              <tbody>
                <tr><td><kbd>Enter</kbd></td><td>Generate (when prompt field focused)</td></tr>
                <tr><td><kbd>⌘↑</kbd> / <kbd>Ctrl↑</kbd></td><td>Enhance prompt</td></tr>
                <tr><td><kbd>R</kbd></td><td>Reroll (regenerate with same prompt)</td></tr>
                <tr><td><kbd>Escape</kbd></td><td>Cancel generation</td></tr>
              </tbody>
            </table>
          </section>
        </article>
      </div>
    </div>
  );
}
