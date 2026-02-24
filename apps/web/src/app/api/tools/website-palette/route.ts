import { NextRequest } from 'next/server';
import { checkSsrf } from '@/lib/ssrf-check';

function normalizeHex(raw: string): string | null {
  const hex = raw.replace('#', '');
  if (hex.length === 3) {
    const r = hex[0] + hex[0], g = hex[1] + hex[1], b = hex[2] + hex[2];
    return `#${r}${g}${b}`.toUpperCase();
  }
  if (hex.length === 6) return `#${hex}`.toUpperCase();
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }
    const ssrf = checkSsrf(url);
    if (!ssrf.ok) return Response.json({ error: ssrf.reason }, { status: 403 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let html: string;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'WokGen-WebsitePalette/1.0' },
      });
      html = await res.text();
    } finally {
      clearTimeout(timeout);
    }

    const colors = new Set<string>();

    // Hex colors
    const hexRe = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
    let m: RegExpExecArray | null;
    while ((m = hexRe.exec(html)) !== null) {
      const n = normalizeHex(m[0]);
      if (n) colors.add(n);
    }

    // rgb() colors
    const rgbRe = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g;
    while ((m = rgbRe.exec(html)) !== null) {
      colors.add(rgbToHex(parseInt(m[1]), parseInt(m[2]), parseInt(m[3])));
    }

    // Filter near-black, near-white, and very common greys
    const filtered = [...colors].filter(c => {
      const hex = c.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const lum = (r + g + b) / 3;
      return lum > 15 && lum < 240 && !(r === g && g === b);
    });

    return Response.json({ colors: filtered.slice(0, 80) });
  } catch {
    return Response.json({ error: 'Failed to fetch URL' }, { status: 500 });
  }
}
