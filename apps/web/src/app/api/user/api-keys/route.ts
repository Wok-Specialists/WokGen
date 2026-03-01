import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Allowed BYOK key names
const ALLOWED_KEYS = new Set([
  'CEREBRAS_API_KEY',
  'GEMINI_API_KEY',
  'OPENROUTER_API_KEY',
  'FREESOUND_API_KEY',
  'PIXABAY_API_KEY',
]);

type ByokRecord = Record<string, string>;

/** GET /api/user/api-keys — returns which keys are set (masked) */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prefs = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
    select: { byokKeys: true },
  });

  const stored: ByokRecord = safeParseJson(prefs?.byokKeys);
  const result: Record<string, boolean> = {};
  for (const key of ALLOWED_KEYS) {
    result[key] = !!stored[key];
  }
  return NextResponse.json({ keys: result });
}

/** POST /api/user/api-keys — save or delete a key */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { key?: string; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { key, value } = body;
  if (!key || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: 'Invalid key name' }, { status: 400 });
  }

  const prefs = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
    select: { byokKeys: true },
  });

  const stored: ByokRecord = safeParseJson(prefs?.byokKeys);

  if (value) {
    stored[key] = value.trim();
  } else {
    delete stored[key];
  }

  await prisma.userPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, byokKeys: JSON.stringify(stored) },
    update: { byokKeys: JSON.stringify(stored) },
  });

  return NextResponse.json({ ok: true, set: !!value });
}

function safeParseJson(raw: string | null | undefined): ByokRecord {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as ByokRecord;
    }
  } catch {}
  return {};
}
