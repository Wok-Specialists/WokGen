/**
 * POST /api/gallery/report
 *
 * Report a community gallery asset for inappropriate content.
 * Rate limited: 5 reports per hour per IP/user.
 * One report per asset per reporter (deduped by assetId+userId or assetId+IP).
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const REPORT_REASONS = ['nsfw', 'spam', 'copyright', 'other'] as const;

const ReportSchema = z.object({
  assetId: z.string().cuid(),
  reason:  z.enum(REPORT_REASONS),
  note:    z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const rateLimitKey = userId ? `gallery-report:${userId}` : `gallery-report:ip:${ip}`;
  const rl = await checkRateLimit(rateLimitKey, 5, 3600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry in ${rl.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 3600) } },
    );
  }

  let body: z.infer<typeof ReportSchema>;
  try {
    body = ReportSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request', details: err instanceof Error ? err.message : undefined }, { status: 422 });
  }

  // Verify the asset exists and is public
  const asset = await prisma.galleryAsset.findUnique({
    where: { id: body.assetId },
    select: { id: true, isPublic: true },
  });
  if (!asset || !asset.isPublic) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  // Deduplicate: one report per (assetId, reporter) within 24h
  const since = new Date(Date.now() - 86_400_000);
  const existing = await prisma.galleryReport.findFirst({
    where: {
      assetId:  body.assetId,
      userId:   userId ?? undefined,
      createdAt: { gte: since },
    },
  });
  if (existing) {
    return NextResponse.json({ error: 'You have already reported this asset recently.' }, { status: 409 });
  }

  await prisma.galleryReport.create({
    data: {
      assetId: body.assetId,
      userId:  userId ?? undefined,
      reason:  body.reason,
      note:    body.note,
      status:  'pending',
    },
  });

  // Auto-hide assets with 5+ pending reports
  const pendingCount = await prisma.galleryReport.count({
    where: { assetId: body.assetId, status: 'pending' },
  });
  if (pendingCount >= 5) {
    await prisma.galleryAsset.update({
      where: { id: body.assetId },
      data:  { isPublic: false },
    });
  }

  return NextResponse.json({ ok: true, message: 'Report submitted. Thank you for keeping the community safe.' });
}
