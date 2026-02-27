import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

interface MemFact { key: string; value: string; savedAt: string }

// GET /api/eral/memory — return user's Eral memory facts
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ facts: [] });

  const pref = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
    select: { eralMemory: true, eralContext: true },
  });

  let facts: MemFact[] = [];
  if (pref?.eralMemory) {
    try { facts = JSON.parse(pref.eralMemory); } catch { /* ignore */ }
  }
  let context = null;
  if (pref?.eralContext) {
    try { context = JSON.parse(pref.eralContext); } catch { /* ignore */ }
  }

  return NextResponse.json({ facts, context });
}

const saveSchema = z.object({
  action: z.enum(['remember', 'forget', 'set_context']),
  key:    z.string().min(1).max(100).optional(),
  value:  z.string().min(1).max(500).optional(),
  context: z.object({
    projectType:     z.string().max(100).optional(),
    mainTool:        z.string().max(100).optional(),
    stylePreference: z.string().max(100).optional(),
  }).optional(),
});

// POST /api/eral/memory — save or forget a memory fact
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { action, key, value, context } = parsed.data;
  const userId = session.user.id;

  const pref = await prisma.userPreference.findUnique({
    where:  { userId },
    select: { eralMemory: true },
  });

  let facts: MemFact[] = [];
  if (pref?.eralMemory) {
    try { facts = JSON.parse(pref.eralMemory); } catch { /* ignore */ }
  }

  if (action === 'remember' && key && value) {
    const existing = facts.findIndex(f => f.key.toLowerCase() === key.toLowerCase());
    const fact: MemFact = { key, value, savedAt: new Date().toISOString() };
    if (existing >= 0) {
      facts[existing] = fact;
    } else {
      facts = [...facts.slice(-29), fact]; // max 30 facts
    }
    await prisma.userPreference.upsert({
      where:  { userId },
      update: { eralMemory: JSON.stringify(facts) },
      create: { userId, eralMemory: JSON.stringify(facts) },
    });
    return NextResponse.json({ ok: true, facts });
  }

  if (action === 'forget' && key) {
    facts = facts.filter(f => f.key.toLowerCase() !== key.toLowerCase());
    await prisma.userPreference.upsert({
      where:  { userId },
      update: { eralMemory: JSON.stringify(facts) },
      create: { userId, eralMemory: JSON.stringify(facts) },
    });
    return NextResponse.json({ ok: true, facts });
  }

  if (action === 'set_context' && context) {
    await prisma.userPreference.upsert({
      where:  { userId },
      update: { eralContext: JSON.stringify(context) },
      create: { userId, eralContext: JSON.stringify(context) },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
