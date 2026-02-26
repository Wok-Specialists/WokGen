export interface PageAsset {
  type: 'image' | 'svg' | 'video' | 'font' | 'stylesheet';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface PageLink {
  href: string;
  text: string;
  isExternal: boolean;
  isDownload: boolean;
}

export interface PagePalette {
  colors: string[];
  backgrounds: string[];
  texts: string[];
}

export interface PageFonts {
  families: string[];
  details: Array<{ family: string; weight: string; style: string }>;
}

export interface ScrapedPage {
  url: string;
  title: string;
  assets: PageAsset[];
  links: PageLink[];
  palette: PagePalette;
  fonts: PageFonts;
  scrapedAt: string;
}

/** Injected into page via content script */
export function scrapePage(): ScrapedPage {
  const assets: PageAsset[] = [];
  const links: PageLink[] = [];

  // Collect images
  document.querySelectorAll('img').forEach(img => {
    if (img.src) {
      assets.push({
        type: 'image',
        url: img.src,
        alt: img.alt,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        format: img.src.split('.').pop()?.split('?')[0] || 'unknown',
      });
    }
  });

  // Collect SVGs
  document.querySelectorAll('svg').forEach(svg => {
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: 'image/svg+xml' });
    assets.push({ type: 'svg', url: URL.createObjectURL(blob), format: 'svg' });
  });

  // Collect links
  document.querySelectorAll('a[href]').forEach(a => {
    const anchor = a as HTMLAnchorElement;
    const href = anchor.href;
    if (!href || href.startsWith('javascript:') || href === '#') return;
    links.push({
      href,
      text: anchor.textContent?.trim() || '',
      isExternal: !href.startsWith(window.location.origin),
      isDownload: anchor.hasAttribute('download'),
    });
  });

  // Extract color palette from computed styles
  const colorSet = new Set<string>();
  const bgSet = new Set<string>();
  const textSet = new Set<string>();

  document.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    const color = style.color;
    const bg = style.backgroundColor;
    if (color && color !== 'rgba(0, 0, 0, 0)') textSet.add(color);
    if (bg && bg !== 'rgba(0, 0, 0, 0)') bgSet.add(bg);
  });

  // Extract fonts
  const fontSet = new Map<string, Set<string>>();
  document.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    const family = style.fontFamily;
    const weight = style.fontWeight;
    if (family) {
      if (!fontSet.has(family)) fontSet.set(family, new Set());
      fontSet.get(family)!.add(weight);
    }
  });

  const fontDetails: PageFonts['details'] = [];
  fontSet.forEach((weights, family) => {
    weights.forEach(weight => {
      fontDetails.push({ family, weight, style: 'normal' });
    });
  });

  return {
    url: window.location.href,
    title: document.title,
    assets,
    links,
    palette: {
      colors: Array.from(colorSet).slice(0, 50),
      backgrounds: Array.from(bgSet).slice(0, 50),
      texts: Array.from(textSet).slice(0, 50),
    },
    fonts: {
      families: Array.from(fontSet.keys()),
      details: fontDetails.slice(0, 100),
    },
    scrapedAt: new Date().toISOString(),
  };
}
