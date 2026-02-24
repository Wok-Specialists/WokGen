// WokGen — Brand Wizard Prompt Builder (Cycle 21)
// Builds structured brand-generation prompts from BrandWizard form data.

export type VisualStyle =
  | 'modern_minimalist'
  | 'bold_dynamic'
  | 'elegant_premium'
  | 'playful_creative';

export type LayoutPreference =
  | 'horizontal'
  | 'vertical'
  | 'icon_only'
  | 'full_lockup';

export interface BrandWizardData {
  // Step 1
  brandName:    string;
  industry:     string;
  websiteUrl:   string;
  // Step 2
  visualStyle:  VisualStyle;
  layoutPreference: LayoutPreference;
  // Step 3
  primaryColor: string;  // hex e.g. "#2563eb"
  moods:        string[];
}

const STYLE_DESCRIPTORS: Record<VisualStyle, string> = {
  modern_minimalist: 'modern minimalist, clean lines, white space, subtle sans-serif typography',
  bold_dynamic:      'bold and dynamic, high contrast, strong geometric shapes, graphic poster style',
  elegant_premium:   'elegant premium, refined typography, luxury aesthetic, gold and neutral tones',
  playful_creative:  'playful and creative, vibrant palette, friendly curves, expressive composition',
};

const LAYOUT_DESCRIPTORS: Record<LayoutPreference, string> = {
  horizontal:  'horizontal layout, wide format, text right of mark',
  vertical:    'vertical stacked layout, mark above wordmark',
  icon_only:   'icon mark only, no wordmark, centered symbol',
  full_lockup: 'full logo lockup, mark plus wordmark plus tagline',
};

/**
 * Algorithmically derive a primary hue from a brand name string.
 * Used for the "Generate palette from brand name" button.
 */
export function colorFromBrandName(name: string): string {
  let hash = 0;
  for (const ch of name) hash = ((hash * 31) + ch.charCodeAt(0)) & 0xffffffff;
  const hue = Math.abs(hash) % 360;
  // Convert HSL (hue, 65%, 45%) → hex
  const c = (1 - Math.abs(2 * 0.45 - 1)) * 0.65;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = 0.45 - c / 2;
  let r = 0, g = 0, b = 0;
  if      (hue < 60)  { r = c; g = x; }
  else if (hue < 120) { r = x; g = c; }
  else if (hue < 180) { g = c; b = x; }
  else if (hue < 240) { g = x; b = c; }
  else if (hue < 300) { r = x; b = c; }
  else                { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Build a high-quality brand generation prompt from wizard inputs.
 * Produces prompts like:
 *   "Modern minimalist logo for 'TechCorp', technology industry, clean geometric
 *    sans-serif typography, primary color #2563eb, white background, vector-style,
 *    professional, trustworthy aesthetic, no gradients, no shadows"
 */
export function buildBrandPrompt(wizard: BrandWizardData): string {
  const style    = STYLE_DESCRIPTORS[wizard.visualStyle] ?? STYLE_DESCRIPTORS.modern_minimalist;
  const layout   = LAYOUT_DESCRIPTORS[wizard.layoutPreference] ?? LAYOUT_DESCRIPTORS.horizontal;
  const industry = wizard.industry && wizard.industry !== 'Other'
    ? `, ${wizard.industry.toLowerCase()} industry` : '';
  const moods    = wizard.moods.length > 0
    ? wizard.moods.map(m => m.toLowerCase()).join(', ')
    : 'professional';

  const parts = [
    `${style} logo for '${wizard.brandName}'${industry}`,
    layout,
    `clean geometric sans-serif typography`,
    `primary color ${wizard.primaryColor}`,
    `white background`,
    `vector-style`,
    `${moods} aesthetic`,
    `professional brand identity`,
    `no gradients, no shadows, no complex backgrounds`,
  ];

  return parts.join(', ');
}
