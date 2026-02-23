/**
 * POST /api/voice/clone
 *
 * Create a cloned voice via ElevenLabs using one or more audio samples.
 * Requires authentication and a Plus+ subscription.
 *
 * Request (multipart/form-data):
 *   name      string   — display name for the cloned voice
 *   files[]   File[]   — 1–25 audio files (mp3/wav/ogg, ≤10MB each)
 *   description? string
 *
 * Response:
 *   { voiceId, name }
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 55;
export const dynamic = 'force-dynamic';

const MAX_FILES = 25;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const ALLOWED_MIME = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/wave']);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const userId = session.user.id;

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Voice cloning is not configured on this server.' }, { status: 503 });
  }

  // Only paid plans can clone voices
  const subscription = await prisma.subscription.findUnique({
    where:  { userId },
    select: { planId: true, status: true },
  });
  const planId = subscription?.status === 'active' ? (subscription.planId ?? 'free') : 'free';
  if (planId === 'free') {
    return NextResponse.json(
      { error: 'Voice cloning requires a Plus plan or higher.', code: 'PLAN_REQUIRED' },
      { status: 402 },
    );
  }

  // Rate limit: 3 clones per hour per user
  const rl = await checkRateLimit(`voice-clone:${userId}`, 3, 3600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit. Retry in ${rl.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 3600) } },
    );
  }

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data.' }, { status: 400 });
  }

  const name = (formData.get('name') as string | null)?.trim();
  if (!name || name.length > 64) {
    return NextResponse.json({ error: 'name is required and must be ≤64 chars.' }, { status: 422 });
  }

  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const files = formData.getAll('files[]') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'At least one audio file is required.' }, { status: 422 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Maximum ${MAX_FILES} audio files allowed.` }, { status: 422 });
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File ${file.name} exceeds 10MB limit.` }, { status: 413 });
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: `Unsupported audio format: ${file.type}. Use MP3, WAV, or OGG.` }, { status: 422 });
    }
  }

  // Forward to ElevenLabs
  const elForm = new FormData();
  elForm.append('name', name);
  elForm.append('description', description);
  for (const file of files) {
    elForm.append('files', file, file.name);
  }

  let elRes: Response;
  try {
    elRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method:  'POST',
      headers: { 'xi-api-key': key },
      body:    elForm,
      signal:  AbortSignal.timeout(45_000),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'ElevenLabs request failed', details: (err as Error).message },
      { status: 502 },
    );
  }

  if (!elRes.ok) {
    const errText = await elRes.text().catch(() => '');
    return NextResponse.json(
      { error: `ElevenLabs error ${elRes.status}`, details: errText.slice(0, 300) },
      { status: elRes.status >= 400 && elRes.status < 500 ? 422 : 502 },
    );
  }

  const { voice_id: voiceId } = await elRes.json() as { voice_id: string };

  return NextResponse.json({ ok: true, voiceId, name }, { status: 201 });
}
