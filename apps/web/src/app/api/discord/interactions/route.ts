// Discord Interactions Endpoint — Chopsticks bot
//
// Discord sends a POST here for every slash command interaction.
// We verify the Ed25519 signature, dispatch to command handlers, and return responses.
//
// Required env vars:
//   DISCORD_PUBLIC_KEY      — from Discord Developer Portal > Application > General
//   DISCORD_BOT_TOKEN       — from Discord Developer Portal > Bot > Token
//   DISCORD_APPLICATION_ID  — from Discord Developer Portal > Application > General

import { NextRequest, NextResponse } from 'next/server';
import { createPublicKey, verify as cryptoVerify } from 'crypto';
import { dispatchCommand, type DiscordInteraction } from '@/lib/discord/commands';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Interaction types
const INTERACTION_TYPE_PING              = 1;
const INTERACTION_TYPE_APPLICATION_COMMAND = 2;

// ---------------------------------------------------------------------------
// Ed25519 signature verification using Node.js crypto
// Discord provides the public key as a 32-byte hex string; we wrap it in a
// DER-encoded SubjectPublicKeyInfo header so Node.js can import it.
// ---------------------------------------------------------------------------
const ED25519_DER_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

function verifyDiscordSignature(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  rawBody: string,
): boolean {
  try {
    const keyBytes = Buffer.from(publicKeyHex, 'hex');
    const derKey   = Buffer.concat([ED25519_DER_PREFIX, keyBytes]);
    const keyObj   = createPublicKey({ key: derKey, format: 'der', type: 'spki' });
    const message  = Buffer.from(timestamp + rawBody, 'utf8');
    const signature = Buffer.from(signatureHex, 'hex');
    return cryptoVerify(null, message, keyObj, signature);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// POST /api/discord/interactions
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: 'DISCORD_PUBLIC_KEY not configured' }, { status: 500 });
  }

  // Read raw body (required for signature verification before JSON parsing)
  const rawBody = await req.text();

  const signature = req.headers.get('x-signature-ed25519') ?? '';
  const timestamp  = req.headers.get('x-signature-timestamp') ?? '';

  if (!signature || !timestamp) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
  }

  // Verify Discord signature — reject if invalid
  if (!verifyDiscordSignature(publicKey, signature, timestamp, rawBody)) {
    return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 });
  }

  // Parse verified body
  let interaction: DiscordInteraction;
  try {
    interaction = JSON.parse(rawBody) as DiscordInteraction;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Handle PING (Discord sends this to verify the endpoint)
  if (interaction.type === INTERACTION_TYPE_PING) {
    return NextResponse.json({ type: 1 });
  }

  // Handle slash commands
  if (interaction.type === INTERACTION_TYPE_APPLICATION_COMMAND) {
    try {
      const response = await dispatchCommand(interaction);
      return NextResponse.json(response);
    } catch (err) {
      console.error('[Chopsticks] Command dispatch error:', err);
      return NextResponse.json({
        type: 4,
        data: { content: '⚠️ An error occurred processing your command. Please try again.' },
      });
    }
  }

  // Unknown interaction type
  return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
}
