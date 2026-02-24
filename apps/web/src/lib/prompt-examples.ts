/**
 * WokGen — Prompt Example Library (Cycle 8)
 *
 * High-quality example prompts per mode/tool.
 * These are shown as clickable starters in idle studio state.
 */

export interface PromptExample {
  prompt: string;
  tool?: string;
  label: string;
}

const PIXEL_EXAMPLES: PromptExample[] = [
  { label: 'Warrior hero sprite', prompt: 'armored warrior hero, 64x64, pixel art, 16-bit SNES palette, idle stance, transparent background', tool: 'sprite' },
  { label: 'Forest tileset', prompt: 'dense forest ground tiles, pixel art, 16x16 tile grid, top-down RPG style, earth tones palette, seamless', tool: 'tile' },
  { label: 'Space ship', prompt: 'retro space fighter ship, top-down view, 32x32 sprite, neon palette, pixel art, transparent background', tool: 'sprite' },
  { label: 'Game icon set', prompt: 'RPG inventory items — sword, shield, potion, key, gem, 16x16 each, flat pixel art, bright palette', tool: 'icon' },
  { label: 'Platformer background', prompt: 'side-scrolling cyberpunk city night background, layered parallax, neon blues and purples, pixel art, 16-bit', tool: 'background' },
  { label: 'Fantasy character', prompt: 'mage wizard character, casting fire spell, 64x64, pixel art, warm orange glow, transparent background', tool: 'sprite' },
  { label: 'Dungeon tileset', prompt: 'stone dungeon floor and wall tiles, 16x16, top-down RPG, dark grey palette, pixel art, seamless edges', tool: 'tile' },
  { label: 'Explosion animation', prompt: '8-frame explosion sprite sheet, 32x32, bright orange and yellow, pixel art, row layout', tool: 'animation' },
  { label: 'Retro UI frame', prompt: 'retro game HUD frame, health bar, score display, 8-bit style, dark blue border, pixel art', tool: 'ui' },
  { label: 'Isometric building', prompt: 'isometric small cottage house, pixel art, green grass base, warm lighting, 64x64', tool: 'sprite' },
];

const BUSINESS_EXAMPLES: PromptExample[] = [
  { label: 'Tech startup logo', prompt: 'minimal tech startup logo, abstract geometric mark, deep blue and white, clean modern sans-serif', tool: 'logo' },
  { label: 'LinkedIn banner', prompt: 'professional LinkedIn banner for software agency, gradient blue background, abstract code pattern overlay, bold headline space', tool: 'banner' },
  { label: 'Product launch email', prompt: 'product launch email header graphic, SaaS dashboard screenshot mockup, clean gradient, modern tech style', tool: 'banner' },
  { label: 'Brand color palette', prompt: 'brand color palette card, 6 swatches, modern fintech style, navy blue primary, gold accent, clean typography labels', tool: 'palette' },
  { label: 'Instagram post frame', prompt: 'Instagram post background for software product announcement, dark mode, glowing code accent, minimal modern', tool: 'social' },
  { label: 'Agency pitch deck slide', prompt: 'pitch deck background slide, dark navy gradient, subtle geometric pattern, premium business consulting brand', tool: 'slide' },
  { label: 'YouTube thumbnail', prompt: 'YouTube thumbnail background for tech tutorial, bold orange accent, dark bg, space for text and face cutout', tool: 'social' },
  { label: 'Podcast cover art', prompt: 'podcast cover art, tech interview show, microphone silhouette, deep purple and gold gradient, bold modern type', tool: 'banner' },
  { label: 'Email signature visual', prompt: 'email signature banner, real estate agency, clean white and forest green, 600x150px, professional headshot space', tool: 'banner' },
  { label: 'App store screenshot bg', prompt: 'iOS app store screenshot background, productivity app, clean gradient, soft blue and white, minimal UI frames', tool: 'social' },
];

const VECTOR_EXAMPLES: PromptExample[] = [
  { label: 'App icon set', prompt: 'set of 6 app navigation icons — home, search, profile, settings, notifications, bookmark — flat vector, single weight line, minimal', tool: 'icon' },
  { label: 'Abstract logo mark', prompt: 'abstract vector logo mark, interlocking geometric shapes, primary blue, transparent background, scalable', tool: 'logo' },
  { label: 'Character illustration', prompt: 'friendly cartoon developer character, flat vector illustration, laptop in hand, warm skin tone, minimal style', tool: 'character' },
  { label: 'Infographic element', prompt: 'data flow diagram vector elements, arrows and nodes, clean flat style, blue and grey color scheme', tool: 'illustration' },
  { label: 'Social media icon pack', prompt: 'unified social media icon set — LinkedIn, Twitter, GitHub, YouTube — flat vector, rounded square style, grey scale', tool: 'icon' },
  { label: 'Onboarding illustration', prompt: 'onboarding step illustration, person using laptop with floating UI elements, flat vector, friendly warm tones', tool: 'illustration' },
  { label: 'Status icons', prompt: 'status indicator icon set — success, warning, error, info, pending — flat vector, colored circles, 24px', tool: 'icon' },
  { label: 'Abstract background', prompt: 'abstract wavy gradient vector background, deep blue to purple, smooth organic shapes, no text', tool: 'background' },
];

const VOICE_EXAMPLES: PromptExample[] = [
  { label: 'Product demo intro', prompt: 'Welcome to WokGen — the fastest way to generate professional assets for your project. Try it free today.', tool: 'narration' },
  { label: 'Podcast opener', prompt: 'You\'re listening to Building Products, the show where founders share what actually works. I\'m your host, and today\'s guest built three startups from zero.', tool: 'narration' },
  { label: 'Explainer script', prompt: 'Most teams waste hours searching for the right image, the right icon, the right tone. WokGen fixes that in one prompt. Here\'s how it works.', tool: 'narration' },
  { label: 'IVR greeting', prompt: 'Thank you for calling Acme Support. To speak with a specialist, press one. For billing, press two. To hear these options again, press zero.', tool: 'ivr' },
  { label: 'Ad spot script', prompt: 'Tired of generic stock photos? WokGen generates exactly what you need — from brand logos to pixel sprites — in seconds. Start free.', tool: 'ad' },
];

const TEXT_EXAMPLES: PromptExample[] = [
  { label: 'Landing page hero', prompt: 'Hero headline and subheadline for a developer productivity tool. Audience: senior engineers. Tone: direct, confident, no fluff.', tool: 'copy' },
  { label: 'Product description', prompt: 'Write a product description for a mechanical keyboard. Audience: developers and writers. Highlight tactile feedback, durability, and clean aesthetics.', tool: 'copy' },
  { label: 'Email subject lines', prompt: 'Write 10 subject line variations for a product launch email. Product: AI image generation tool. Tone: bold and curious.', tool: 'copy' },
  { label: 'Feature announcement', prompt: 'Write a changelog-style feature announcement for dark mode being added to a SaaS dashboard. Tone: friendly and technical.', tool: 'copy' },
  { label: 'LinkedIn post', prompt: 'Write a LinkedIn post about launching a side project. Authentic voice. Mention the process, one failure, and one insight. Under 200 words.', tool: 'social' },
  { label: 'Cold email', prompt: 'Write a cold outreach email to a startup CTO offering API integration services. Problem-first. No fluff. Under 100 words.', tool: 'email' },
  { label: 'Onboarding tooltip', prompt: 'Write microcopy for 5 product onboarding tooltips for a design tool. Each under 15 words. Tone: helpful, not patronizing.', tool: 'copy' },
];

const UIUX_EXAMPLES: PromptExample[] = [
  { label: 'Pricing table', prompt: 'React pricing table component, 3-tier plan comparison, dark mode, toggle monthly/annual, highlighted recommended plan, Tailwind-styled', tool: 'component' },
  { label: 'Navigation bar', prompt: 'Responsive nav bar component, logo left, links center, CTA button right, mobile hamburger menu, clean light theme', tool: 'component' },
  { label: 'Stats dashboard', prompt: 'Analytics dashboard stats grid component, 4 KPI cards with trend arrows, dark theme, recharts sparklines, React', tool: 'dashboard' },
  { label: 'Form with validation', prompt: 'Contact form component with real-time validation, name, email, message fields, clean error states, accessible labels', tool: 'component' },
  { label: 'Product card', prompt: 'E-commerce product card component, image, title, price, rating stars, add to cart button, hover elevation, minimal white design', tool: 'component' },
  { label: 'Modal dialog', prompt: 'Confirmation modal dialog component, centered overlay, title, description, confirm and cancel buttons, focus trap, dark bg overlay', tool: 'component' },
  { label: 'Empty state', prompt: 'Empty state illustration component, centered layout, SVG icon, title, helper text, primary CTA button, light and dark mode', tool: 'component' },
];

export const PROMPT_EXAMPLES: Record<string, PromptExample[]> = {
  pixel:    PIXEL_EXAMPLES,
  business: BUSINESS_EXAMPLES,
  vector:   VECTOR_EXAMPLES,
  voice:    VOICE_EXAMPLES,
  text:     TEXT_EXAMPLES,
  uiux:     UIUX_EXAMPLES,
};

export function getExamplesForMode(mode: string, tool?: string, count = 6): PromptExample[] {
  const examples = PROMPT_EXAMPLES[mode] ?? [];
  if (!tool) return examples.slice(0, count);
  const toolExamples = examples.filter(e => e.tool === tool);
  const others = examples.filter(e => e.tool !== tool);
  return [...toolExamples, ...others].slice(0, count);
}
