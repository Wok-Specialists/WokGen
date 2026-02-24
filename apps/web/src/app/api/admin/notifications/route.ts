// GET  /api/admin/notifications — Return current Discord notification routing config
// POST /api/admin/notifications — Save config OR send a test webhook
//
// Config is stored as a JSON blob in the admin user's UserPreference.stats field
// under the key "discordNotifyConfig", avoiding schema changes.
//
// Event types:
//   levelUp         — XP / achievement notifications
//   jobComplete     — Job completion notifications
//   newGalleryAsset — New public gallery asset notifications
//   errorAlert      — Error/system alert notifications

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdminResponse } from '@/lib/admin';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export type NotifyEventType = 'levelUp' | 'jobComplete' | 'newGalleryAsset' | 'errorAlert';

export interface DiscordNotifyConfig {
  levelUp:         { webhookUrl: string; enabled: boolean };
  jobComplete:     { webhookUrl: string; enabled: boolean };
  newGalleryAsset: { webhookUrl: string; enabled: boolean };
  errorAlert:      { webhookUrl: string; enabled: boolean };
}

const DEFAULT_CONFIG: DiscordNotifyConfig = {
  levelUp:         { webhookUrl: '', enabled: false },
  jobComplete:     { webhookUrl: '', enabled: false },
  newGalleryAsset: { webhookUrl: '', enabled: false },
  errorAlert:      { webhookUrl: '', enabled: false },
};

const EVENT_LABELS: Record<NotifyEventType, string> = {
  levelUp:         'Level Up',
  jobComplete:     'Job Complete',
  newGalleryAsset: 'New Gallery Asset',
  errorAlert:      'Error Alert',
};

// ---------------------------------------------------------------------------
// Helper: read config from the admin user's stats field
// ---------------------------------------------------------------------------
async function readConfig(userId: string): Promise<DiscordNotifyConfig> {
  const prefs = await prisma.userPreference.findUnique({
    where:  { userId },
    select: { stats: true },
  });
  if (!prefs?.stats) return DEFAULT_CONFIG;
  try {
    const stats = JSON.parse(prefs.stats) as Record<string, unknown>;
    return (stats.discordNotifyConfig as DiscordNotifyConfig) ?? DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

// ---------------------------------------------------------------------------
// Helper: send a test Discord webhook message
// ---------------------------------------------------------------------------
async function sendTestWebhook(webhookUrl: string, eventType: NotifyEventType): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: `WokGen Test — ${EVENT_LABELS[eventType]}`,
            description: `This is a test notification for the **${EVENT_LABELS[eventType]}** event type.`,
            color: 0x5865f2,
            footer: { text: 'WokGen Admin Notifications' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      return { ok: false, error: `Discord returned ${res.status}: ${errText}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Request failed' };
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/notifications
// ---------------------------------------------------------------------------
export async function GET() {
  const adminResult = await requireAdmin();
  if (isAdminResponse(adminResult)) return adminResult;

  const config = await readConfig(adminResult.userId);
  return NextResponse.json({ config });
}

// ---------------------------------------------------------------------------
// POST /api/admin/notifications
// ---------------------------------------------------------------------------
const TestSchema = z.object({
  test:       z.literal(true),
  type:       z.enum(['levelUp', 'jobComplete', 'newGalleryAsset', 'errorAlert']),
  webhookUrl: z.string().url(),
});

const SaveSchema = z.object({
  config: z.object({
    levelUp:         z.object({ webhookUrl: z.string(), enabled: z.boolean() }),
    jobComplete:     z.object({ webhookUrl: z.string(), enabled: z.boolean() }),
    newGalleryAsset: z.object({ webhookUrl: z.string(), enabled: z.boolean() }),
    errorAlert:      z.object({ webhookUrl: z.string(), enabled: z.boolean() }),
  }),
});

export async function POST(req: NextRequest) {
  const adminResult = await requireAdmin();
  if (isAdminResponse(adminResult)) return adminResult;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Test webhook path
  const testParsed = TestSchema.safeParse(body);
  if (testParsed.success) {
    const { type, webhookUrl } = testParsed.data;
    const result = await sendTestWebhook(webhookUrl, type);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json({ success: true, message: 'Test webhook sent successfully' });
  }

  // Save config path
  const saveParsed = SaveSchema.safeParse(body);
  if (!saveParsed.success) {
    return NextResponse.json(
      { error: saveParsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 },
    );
  }

  const { config } = saveParsed.data;

  // Read existing stats to preserve other fields
  const existingPrefs = await prisma.userPreference.findUnique({
    where:  { userId: adminResult.userId },
    select: { stats: true },
  });

  let existingStats: Record<string, unknown> = {};
  if (existingPrefs?.stats) {
    try { existingStats = JSON.parse(existingPrefs.stats) as Record<string, unknown>; } catch { /* noop */ }
  }

  const updatedStats = JSON.stringify({ ...existingStats, discordNotifyConfig: config });

  await prisma.userPreference.upsert({
    where:  { userId: adminResult.userId },
    update: { stats: updatedStats },
    create: { userId: adminResult.userId, stats: updatedStats },
  });

  return NextResponse.json({ success: true });
}

// ---------------------------------------------------------------------------
// Exported helper: send a Discord notification for a given event type
// (used by other API routes to trigger notifications)
// ---------------------------------------------------------------------------
export async function sendDiscordNotification(
  eventType: NotifyEventType,
  adminUserId: string,
  embed: {
    title: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  },
): Promise<void> {
  const config = await readConfig(adminUserId);
  const channelConfig = config[eventType];
  if (!channelConfig.enabled || !channelConfig.webhookUrl) return;

  try {
    await fetch(channelConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ ...embed, timestamp: new Date().toISOString(), footer: { text: 'WokGen' } }],
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Non-fatal — notification delivery is best-effort
  }
}
