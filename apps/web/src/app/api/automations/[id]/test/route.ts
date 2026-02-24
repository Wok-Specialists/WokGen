import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkSsrf } from '@/lib/ssrf-check';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auto = await prisma.automation.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true, targetType: true, targetValue: true, name: true },
  });

  if (!auto) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // For webhooks: fire the webhook URL and return the HTTP status
  if (auto.targetType === 'webhook') {
    if (!auto.targetValue) {
      return NextResponse.json({ error: 'No webhook URL configured' }, { status: 400 });
    }
    const guard = checkSsrf(auto.targetValue);
    if (!guard.ok) {
      return NextResponse.json({ ok: false, error: guard.reason }, { status: 422 });
    }
    try {
      const res = await fetch(auto.targetValue, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'WokGen-Webhook/1.0' },
        body: JSON.stringify({
          event: 'test',
          automation: auto.name,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(8000),
      });
      await prisma.automation.update({
        where: { id: auto.id },
        data: { lastRunAt: new Date(), lastRunStatus: res.ok ? 'ok' : 'error' },
      });
      return NextResponse.json({ ok: res.ok, status: res.status, message: res.ok ? 'Automation ran successfully' : 'Webhook returned error' });
    } catch (err) {
      return NextResponse.json({ ok: false, error: String(err) });
    }
  }

  // Update lastRunAt for email / in_app automations
  await prisma.automation.update({
    where: { id: auto.id },
    data: { lastRunAt: new Date(), lastRunStatus: 'ok' },
  });
  return NextResponse.json({ ok: true, message: 'Automation ran successfully' });
}
