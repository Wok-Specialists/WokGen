import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WokGen Eral — AI Director, Director Mode & Memory System',
  description:
    'Complete guide to Eral, the WokGen AI director. Covers Director Mode, the project ' +
    'memory system, Voice Mode, WAP commands, batch generation, and tips for best results.',
};

// ---------------------------------------------------------------------------
// Component helpers
// ---------------------------------------------------------------------------

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="docs-h2" style={{ scrollMarginTop: 80 }}>
      {children}
    </h2>
  );
}

function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="docs-h3" style={{ scrollMarginTop: 80 }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="docs-p">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="docs-code">{children}</code>;
}

function Pre({ children }: { children: React.ReactNode }) {
  return <pre className="docs-pre">{children}</pre>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="docs-ul">{children}</ul>;
}

function OL({ children }: { children: React.ReactNode }) {
  return <ol className="docs-ul" style={{ listStyleType: 'decimal', paddingLeft: '1.5rem' }}>{children}</ol>;
}

function LI({ children }: { children: React.ReactNode }) {
  return <li className="docs-li">{children}</li>;
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
// TOC
// ---------------------------------------------------------------------------

const TOC = [
  { id: 'overview',   label: '1. What is Eral?' },
  { id: 'director',   label: '2. Director Mode' },
  { id: 'plan-flow',  label: '3. Plan This Project' },
  { id: 'memory',     label: '4. Memory System' },
  { id: 'voice',      label: '5. Voice Mode' },
  { id: 'wap',        label: '6. WAP Commands' },
  { id: 'batch',      label: '7. Batch Generation' },
  { id: 'tips',       label: '8. Tips for Best Results' },
  { id: 'faq',        label: '9. FAQ' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EralDocs() {
  return (
    <main className="docs-main">

      <div className="docs-content-header">
        <div className="landing-badge">
          <span className="landing-badge-dot" style={{ background: '#38bdf8' }} />
          <span>AI Director</span>
        </div>
        <h1 className="docs-title">WokGen Eral</h1>
        <p className="docs-subtitle">
          Eral is the WokGen AI director. Use natural language or WAP commands to
          plan projects, run multi-step generation workflows, and control every studio
          from a single chat interface.
        </p>
      </div>

      {/* ================================================================== */}
      {/* 1. WHAT IS ERAL?                                                    */}
      {/* ================================================================== */}
      <H2 id="overview">1. What is Eral?</H2>
      <P>
        Eral is a conversational AI layer built on top of WokGen. It understands your
        creative intent and translates it into generation calls, project management
        actions, and platform navigation — all from a chat interface you can open in
        any studio.
      </P>
      <P>
        Unlike a simple chatbot, Eral operates with <em>agency</em>. When you ask it to
        &ldquo;create a full enemy character set for a dark fantasy RPG&rdquo;, it does
        not just respond with suggestions — it plans the asset list, runs each generation,
        tracks the results, and assembles them into a project. This is the core of
        Director Mode.
      </P>
      <P>
        Eral is powered by a selectable backend model (Groq / Gemini / Mistral) and has
        full awareness of your current project, selected studio mode, generation history,
        and saved palettes. It remembers context within a session and can be given
        persistent project context through the memory system.
      </P>

      <Callout type="tip">
        Open Eral from any Studio page by clicking the chat icon in the top-right corner,
        or press <Code>⌘K</Code> (macOS) / <Code>Ctrl+K</Code> (Windows/Linux).
      </Callout>

      {/* ================================================================== */}
      {/* 2. DIRECTOR MODE                                                    */}
      {/* ================================================================== */}
      <H2 id="director">2. Director Mode</H2>
      <P>
        Director Mode is Eral&apos;s most powerful feature. It lets you describe a complete
        asset set in plain English and have Eral automatically plan and execute every
        individual generation step.
      </P>

      <H3>How it works</H3>
      <OL>
        <LI>You describe what you want: <em>&ldquo;8-directional character sprite sheet for a fantasy RPG warrior, dark medieval style, consistent palette&rdquo;</em></LI>
        <LI>Eral analyses the request and creates a <strong>generation plan</strong> — a list of individual assets needed to fulfil the brief</LI>
        <LI>You review and approve (or edit) the plan</LI>
        <LI>Eral runs all generation jobs, parallelising where possible</LI>
        <LI>Completed assets stream back to your workspace as they finish</LI>
        <LI>Eral assembles the results and offers a single-click ZIP export</LI>
      </OL>

      <H3>Activating Director Mode</H3>
      <P>
        Eral will auto-detect multi-step requests. You can also explicitly activate it:
      </P>
      <Pre>{`/director create a complete UI icon set for a fintech app — 24 icons, line style, blue accent`}</Pre>
      <P>
        Or just describe a complex brief naturally and Eral will propose the Director
        workflow if appropriate.
      </P>

      <H3>Example Director session</H3>
      <Pre>{`You: Create a top-down RPG enemy set — 5 enemy types, consistent palette,
     front-facing 32×32 sprites.

Eral: I'll plan this as 5 individual Pixel generations:
      1. Skeleton warrior (rpg_enemy, 32×32)
      2. Goblin archer (rpg_enemy, 32×32)
      3. Cave troll (rpg_enemy, 32×32)
      4. Witch (rpg_enemy, 32×32)
      5. Shadow dragon (rpg_enemy, 32×32)
      
      Shall I apply your "dungeon_palette" to all five? [Yes / No / Edit plan]

You: Yes

Eral: Running 5 generations... ████████░░ 4/5 complete`}</Pre>

      <Callout type="info">
        Director Mode works best with a connected project — Eral will use the
        project&apos;s palette and style settings automatically.
      </Callout>

      {/* ================================================================== */}
      {/* 3. PLAN THIS PROJECT                                                */}
      {/* ================================================================== */}
      <H2 id="plan-flow">3. &ldquo;Plan this project&rdquo; Flow</H2>
      <P>
        The <strong>Plan this project</strong> command is a structured Director Mode entry
        point. It prompts Eral to ask a series of scoping questions, then produce a
        comprehensive asset plan for your project.
      </P>
      <Pre>{`/plan`}</Pre>
      <P>Eral will ask:</P>
      <UL>
        <LI>What type of project is this? (game, app, brand, website, etc.)</LI>
        <LI>What art style or aesthetic are you targeting?</LI>
        <LI>Which studios do you need? (Pixel, Business, Vector…)</LI>
        <LI>Do you have an existing palette or reference image?</LI>
        <LI>What is your delivery deadline / priority?</LI>
      </UL>
      <P>
        Based on your answers, Eral produces a prioritised asset list with suggested
        prompts, presets, and sizes for each item. You can run the full plan at once
        or step through it asset by asset.
      </P>
      <Callout type="tip">
        The richer the context you give Eral in the planning phase, the more consistent
        the output. Mention the colour palette, the target platform (mobile, PC, web),
        and any reference games or brands you want to evoke.
      </Callout>

      {/* ================================================================== */}
      {/* 4. MEMORY SYSTEM                                                    */}
      {/* ================================================================== */}
      <H2 id="memory">4. Memory System</H2>
      <P>
        Eral has two levels of memory: <strong>session memory</strong> (in-browser,
        lasts until page refresh) and <strong>project memory</strong> (persisted to your
        workspace, survives page loads).
      </P>

      <H3>Session memory</H3>
      <P>
        Within a single browser session, Eral remembers your entire conversation history,
        the last 20 generation results, and any palette or style changes you made. Session
        memory is cleared when you refresh or close the tab.
      </P>

      <H3>Project memory</H3>
      <P>
        When you connect Eral to a project with <Code>/project open {'{name}'}</Code>,
        it gains persistent memory for that project:
      </P>
      <UL>
        <LI><strong>Project brief</strong> — a short description you set with <Code>/memory set brief &quot;dark fantasy RPG, low-res 16-bit style&quot;</Code></LI>
        <LI><strong>Palette</strong> — saved colour palette applied to all generations</LI>
        <LI><strong>Style presets</strong> — default preset per asset category</LI>
        <LI><strong>Generation history</strong> — all past outputs with prompts and seeds</LI>
        <LI><strong>Asset checklist</strong> — Director-mode plans and their completion status</LI>
      </UL>

      <H3>Setting a project brief</H3>
      <Pre>{`/memory set brief "2D side-scroller, NES-style 8 colours, action-platformer, 1990s aesthetic"`}</Pre>
      <P>
        Eral reads the brief before every generation in this project and adjusts its
        prompting strategy accordingly — you no longer need to repeat the style context
        in every prompt.
      </P>

      <H3>Viewing and editing memory</H3>
      <Pre>{`/memory show       — display all stored project memory
/memory clear       — wipe session memory only
/memory clear all   — wipe session + project memory (irreversible)`}</Pre>

      {/* ================================================================== */}
      {/* 5. VOICE MODE                                                       */}
      {/* ================================================================== */}
      <H2 id="voice">5. Voice Mode</H2>
      <P>
        Voice Mode lets you talk to Eral using your microphone instead of typing. Click
        the microphone icon in the Eral chat panel (or press <Code>⌥V</Code> / <Code>Alt+V</Code>)
        to toggle it.
      </P>
      <P>
        Voice input is transcribed in real-time using browser-native speech recognition.
        Eral processes your spoken request identically to a typed one — you can trigger
        WAP commands, Director Mode, and generation entirely by voice.
      </P>

      <H3>Tips for voice input</H3>
      <UL>
        <LI>Speak the asset description naturally — Eral infers style presets and sizes from context</LI>
        <LI>Pause briefly before speaking to let the microphone activate cleanly</LI>
        <LI>You can say &ldquo;slash director&rdquo; to trigger <Code>/director</Code></LI>
        <LI>Voice Mode works best in Chrome and Edge; Firefox support is partial</LI>
      </UL>

      <Callout type="info">
        Voice Mode is designed for hands-free generation workflows — useful when you are
        sketching or working in another application simultaneously.
      </Callout>

      {/* ================================================================== */}
      {/* 6. WAP COMMANDS                                                     */}
      {/* ================================================================== */}
      <H2 id="wap">6. WAP Commands</H2>
      <P>
        WAP (WokGen Action Protocol) commands are slash-prefixed shortcuts for the Eral
        chat interface. Type them exactly as shown.
      </P>

      <H3>Navigation</H3>
      <UL>
        <LI><Code>/go pixel</Code> — switch to Pixel Studio</LI>
        <LI><Code>/go business</Code> — switch to Business Studio</LI>
        <LI><Code>/go vector</Code> — switch to Vector Studio</LI>
        <LI><Code>/go uiux</Code> — switch to UI/UX Studio</LI>
        <LI><Code>/go docs</Code> — open the Docs Hub</LI>
      </UL>

      <H3>Generation</H3>
      <UL>
        <LI><Code>/generate {'{prompt}'}</Code> — generate with current mode settings</LI>
        <LI><Code>/generate hd {'{prompt}'}</Code> — HD mode (uses credits)</LI>
        <LI><Code>/style {'{preset}'}</Code> — change active style preset</LI>
        <LI><Code>/negative {'{terms}'}</Code> — set negative prompt for next generation</LI>
        <LI><Code>/seed {'{number}'}</Code> — pin the seed for reproducible output</LI>
      </UL>

      <H3>Director</H3>
      <UL>
        <LI><Code>/director {'{brief}'}</Code> — activate Director Mode with a brief</LI>
        <LI><Code>/plan</Code> — enter the guided project planning flow</LI>
        <LI><Code>/plan status</Code> — show current plan progress</LI>
        <LI><Code>/plan export</Code> — export all completed plan assets as ZIP</LI>
      </UL>

      <H3>Batch</H3>
      <UL>
        <LI><Code>/batch {'{prompt}'} ×N</Code> — N variations (e.g. <Code>/batch robot ×4</Code>)</LI>
        <LI><Code>/batch csv</Code> — upload a CSV of prompts</LI>
        <LI><Code>/batch status</Code> — check last batch status</LI>
      </UL>

      <H3>Project &amp; memory</H3>
      <UL>
        <LI><Code>/project new {'{name}'}</Code> — create a project</LI>
        <LI><Code>/project open {'{name}'}</Code> — switch project</LI>
        <LI><Code>/project list</Code> — list all projects</LI>
        <LI><Code>/project export</Code> — download all project assets as ZIP</LI>
        <LI><Code>/memory set brief {'"…"'}</Code> — set project brief</LI>
        <LI><Code>/memory show</Code> — display project memory</LI>
        <LI><Code>/memory clear</Code> — clear session memory</LI>
      </UL>

      <H3>Utility</H3>
      <UL>
        <LI><Code>/help</Code> — list all WAP commands</LI>
        <LI><Code>/clear</Code> — clear Eral chat history (session only)</LI>
        <LI><Code>/model {'{name}'}</Code> — switch backend model (groq | gemini | mistral)</LI>
        <LI><Code>/voice</Code> — toggle Voice Mode</LI>
      </UL>

      {/* ================================================================== */}
      {/* 7. BATCH GENERATION                                                 */}
      {/* ================================================================== */}
      <H2 id="batch">7. Batch Generation</H2>
      <P>
        Batch mode generates multiple assets from a single command or a CSV file.
      </P>

      <H3>Inline variation batch</H3>
      <Pre>{`/batch Viking warrior sprite, front view ×6`}</Pre>
      <P>
        Enqueues 6 parallel generation jobs with varied seeds.
        Results stream back as they complete.
      </P>

      <H3>CSV batch</H3>
      <P>Type <Code>/batch csv</Code> and upload a CSV file:</P>
      <Pre>{`prompt,style,width,height,negative
fire sword,rpg_icon,32,32,blurry
ice staff,rpg_icon,32,32,blurry
poison dagger,rpg_icon,32,32,blurry`}</Pre>
      <P>
        Eral processes each row as an independent generation. Optional columns will
        override the current studio settings for that row only.
      </P>

      <Callout type="warn">
        Each item in a batch counts as one generation against your rate limit.
        Large CSV batches (50+ rows) are processed in queued waves, not all at once.
      </Callout>

      {/* ================================================================== */}
      {/* 8. TIPS FOR BEST RESULTS                                            */}
      {/* ================================================================== */}
      <H2 id="tips">8. Tips for Best Results</H2>

      <H3>Give Eral rich project context</H3>
      <P>
        The single biggest improvement you can make is to set a project brief before
        starting work. Include: the genre or domain, the visual style, target platform,
        colour constraints, and any reference touchstones.
      </P>
      <Pre>{`/memory set brief "Mobile endless runner, flat design, 3-colour palette (navy, orange, cream), inspired by Alto's Odyssey"`}</Pre>

      <H3>Be specific about what you want — not how to make it</H3>
      <P>
        Tell Eral <em>what</em> you need, not which tool to use. &ldquo;I need five enemy
        sprites for a dungeon level&rdquo; is more effective than &ldquo;use the Sprite tool
        with the rpg_enemy preset five times&rdquo;. Eral will select the right tool
        and settings.
      </P>

      <H3>Use Director Mode for sets, not singles</H3>
      <P>
        Director Mode has overhead (the planning phase takes a few seconds). For a single
        asset, just use the studio directly or type a plain <Code>/generate</Code> command.
        Director Mode pays off for 4+ related assets where consistency matters.
      </P>

      <H3>Review and edit the plan before running</H3>
      <P>
        Always review Eral&apos;s generation plan before approving it. The plan shows
        each prompt, preset, and size. Adjust anything that doesn&apos;t look right — it is
        much faster to edit the plan than to regenerate a misaligned asset after the fact.
      </P>

      <H3>Switch models for different tasks</H3>
      <UL>
        <LI><Code>/model groq</Code> — fastest, best for quick iterations and simple generation commands</LI>
        <LI><Code>/model gemini</Code> — best for complex planning, long project briefs, and Director Mode</LI>
        <LI><Code>/model mistral</Code> — strong at structured outputs and CSV batch planning</LI>
      </UL>

      <H3>Keep session memory clean</H3>
      <P>
        If Eral starts giving inconsistent responses mid-session, use <Code>/clear</Code>
        to reset session memory and restate the project brief. Long chat histories can
        cause model context drift.
      </P>

      {/* ================================================================== */}
      {/* 9. FAQ                                                              */}
      {/* ================================================================== */}
      <H2 id="faq">9. FAQ</H2>

      <H3>Which AI model does Eral use?</H3>
      <P>
        Eral defaults to the fastest available model for your plan. Switch with
        <Code>/model groq</Code>, <Code>/model gemini</Code>, or{' '}
        <Code>/model mistral</Code>. All three backends are compatible with the
        free tier.
      </P>

      <H3>Does Eral store my chat history?</H3>
      <P>
        Session chat history is stored in your browser only and is not sent to our
        servers beyond the active API request. Clearing your browser data clears
        Eral&apos;s session memory. Project memory (brief, palette, plan) is stored
        server-side in your workspace.
      </P>

      <H3>Can I use Eral in self-hosted mode?</H3>
      <P>
        Yes. Set <Code>GROQ_API_KEY</Code>, <Code>GOOGLE_AI_API_KEY</Code>, or{' '}
        <Code>MISTRAL_API_KEY</Code> in your <Code>.env.local</Code>. Eral will use
        whichever key is present. See the{' '}
        <Link href="/docs/api">API Reference</Link> for the{' '}
        <Code>/api/eral/chat</Code> endpoint specification.
      </P>

      <H3>Does Director Mode cost credits?</H3>
      <P>
        Director Mode itself is free — it is a planning layer that calls the generation
        API on your behalf. Credits are consumed exactly as if you had run each generation
        manually. If Director Mode runs 6 Standard generations, you use no credits.
        If it runs 6 HD generations, you use 6 HD credits.
      </P>

      <H3>Can Eral generate assets across multiple studios in one session?</H3>
      <P>
        Yes. Use <Code>/go {'{studio}'}</Code> to switch studios within an Eral session,
        or describe a multi-mode project in a Director brief and Eral will switch studios
        automatically as it works through the plan.
      </P>

      <div className="docs-content-footer">
        <Link href="/docs" className="btn-ghost btn-sm">← Docs Hub</Link>
        <Link href="/docs/api" className="btn-ghost btn-sm">API Reference →</Link>
      </div>

    </main>
  );
}

