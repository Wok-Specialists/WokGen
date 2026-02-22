import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  generate,
  resolveProviderConfig,
  assertKeyPresent,
  serializeError,
} from '@/lib/providers';
import type { ProviderName, Tool, GenerateParams } from '@/lib/providers';

// ---------------------------------------------------------------------------
// POST /api/generate
//
// Dual-mode:
//   SELF_HOSTED=true  → BYOK, no auth, no quota
//   SELF_HOSTED unset → requires session, enforces monthly quota
// ---------------------------------------------------------------------------

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const isSelfHosted = process.env.SELF_HOSTED === 'true';

  // --------------------------------------------------------------------------
  // 0. Auth + quota check (hosted mode only)
  // --------------------------------------------------------------------------
  let authedUserId: string | null = null;

  if (!isSelfHosted) {
    // Dynamically import to avoid loading auth in self-hosted builds
    const { auth } = await import('@/lib/auth');
    const { checkQuota, incrementUsage } = await import('@/lib/usage');

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    authedUserId = session.user.id;

    const quota = await checkQuota(authedUserId);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: 'Monthly generation limit reached. Upgrade your plan to continue.',
          quota: { used: quota.used, limit: quota.limit, planId: quota.planId },
        },
        { status: 429 },
      );
    }

    // Attach incrementUsage to run after successful generation
    // (we store the function reference and call it at step 5a)
    (req as NextRequest & { _incrementUsage?: () => Promise<number> })._incrementUsage =
      () => incrementUsage(authedUserId!);
  }


  // --------------------------------------------------------------------------
  // 1. Parse & validate request body
  // --------------------------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const {
    tool       = 'generate',
    provider   = detectProvider(),
    prompt,
    negPrompt,
    width      = 512,
    height     = 512,
    seed,
    steps,
    guidance,
    stylePreset,
    isPublic   = false,
    // BYOK fields — only used in self-hosted mode; stripped in hosted mode
    apiKey: byokKey,
    comfyuiHost: byokHost,
    modelOverride,
    extra,
  } = body;

  // In hosted mode: ignore any client-supplied provider keys
  const resolvedByokKey  = isSelfHosted ? (typeof byokKey  === 'string' ? byokKey  : null) : null;
  const resolvedByokHost = isSelfHosted ? (typeof byokHost === 'string' ? byokHost : null) : null;
  // In hosted mode: always use Together AI (server key)
  const resolvedProvider = isSelfHosted ? (provider as ProviderName) : 'together';

  // Validate required fields
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: 'prompt is required and must be a non-empty string' },
      { status: 400 },
    );
  }

  if (!isValidTool(tool)) {
    return NextResponse.json(
      {
        error: `Invalid tool "${tool}". Must be one of: generate, animate, rotate, inpaint, scene`,
      },
      { status: 400 },
    );
  }

  if (!isValidProvider(resolvedProvider)) {
    return NextResponse.json(
      {
        error: `Invalid provider "${resolvedProvider}". Must be one of: replicate, fal, together, comfyui`,
      },
      { status: 400 },
    );
  }

  // --------------------------------------------------------------------------
  // 2. Resolve provider config (env vars merged with BYOK overrides)
  // --------------------------------------------------------------------------
  const config = resolveProviderConfig(
    resolvedProvider,
    resolvedByokKey,
    resolvedByokHost,
  );

  try {
    assertKeyPresent(resolvedProvider, config);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 401 },
    );
  }

  // --------------------------------------------------------------------------
  // 3. Create the Job record in the database (status = "running")
  //    DB is optional — if DATABASE_URL is not configured or the schema has
  //    not been migrated yet, we skip job tracking and still run generation.
  // --------------------------------------------------------------------------
  const dbAvailable = Boolean(process.env.DATABASE_URL);
  let job: Awaited<ReturnType<typeof prisma.job.create>> | null = null;

  if (dbAvailable) {
    try {
      job = await prisma.job.create({
        data: {
          tool:       tool as Tool,
          status:     'running',
          provider:   resolvedProvider,
          prompt:     String(prompt).trim(),
          negPrompt:  typeof negPrompt === 'string' ? negPrompt.trim() || null : null,
          width:      clampSize(Number(width) || 512),
          height:     clampSize(Number(height) || 512),
          seed:       typeof seed === 'number' && seed > 0 ? seed : null,
          isPublic:   Boolean(isPublic),
          params:     extra ? JSON.stringify(extra) : null,
          ...(authedUserId ? { userId: authedUserId } : {}),
        },
      });
    } catch (dbErr) {
      // Non-fatal — log and continue without job tracking
      console.warn('[generate] DB unavailable, running without job tracking:', (dbErr as Error).message);
    }
  }

  // --------------------------------------------------------------------------
  // 4. Build GenerateParams and run the provider
  // --------------------------------------------------------------------------
  const genParams: GenerateParams = {
    tool:          tool as Tool,
    prompt:        String(prompt).trim(),
    negPrompt:     typeof negPrompt === 'string' ? negPrompt.trim() || undefined : undefined,
    width:         clampSize(Number(width) || 512),
    height:        clampSize(Number(height) || 512),
    seed:          typeof seed === 'number' && seed > 0 ? seed : undefined,
    steps:         typeof steps === 'number' ? steps : undefined,
    guidance:      typeof guidance === 'number' ? guidance : undefined,
    stylePreset:   isValidStylePreset(stylePreset) ? stylePreset : undefined,
    modelOverride: typeof modelOverride === 'string' ? modelOverride : undefined,
    extra:         extra as Record<string, unknown> | undefined,
  };

  try {
    const result = await generate(resolvedProvider, genParams, config);

    // ------------------------------------------------------------------------
    // 5a. Update Job as succeeded + increment usage (hosted)
    // ------------------------------------------------------------------------
    let creditsRemaining: number | null = null;

    if (job) {
      try {
        job = await prisma.job.update({
          where: { id: job.id },
          data: {
            status:         'succeeded',
            resultUrl:      result.resultUrl ?? null,
            resultUrls:     result.resultUrls ? JSON.stringify(result.resultUrls) : null,
            providerJobId:  result.providerJobId ?? null,
            seed:           result.resolvedSeed ?? job.seed,
          },
        });
      } catch (dbErr) {
        console.warn('[generate] Failed to update job record:', (dbErr as Error).message);
      }
    }

    // Increment usage counter for hosted mode
    if (!isSelfHosted && authedUserId) {
      try {
        const { incrementUsage } = await import('@/lib/usage');
        creditsRemaining = await incrementUsage(authedUserId);
      } catch (err) {
        console.warn('[generate] Failed to increment usage:', (err as Error).message);
      }
    }

    // ------------------------------------------------------------------------
    // 5b. If the generation succeeded and isPublic, also create a GalleryAsset
    // ------------------------------------------------------------------------
    if (job && Boolean(isPublic) && result.resultUrl) {
      await prisma.galleryAsset.create({
        data: {
          jobId:    job.id,
          imageUrl: result.resultUrl,
          thumbUrl: result.resultUrl,
          size:     clampSize(Number(width) || 512),
          tool:     tool as Tool,
          provider: resolvedProvider,
          prompt:   String(prompt).trim(),
          isPublic: true,
        },
      }).catch((err) => {
        console.error('[generate] GalleryAsset creation failed:', err);
      });
    }

    return NextResponse.json({
      ok:               true,
      job:              job ? serializeJob(job) : null,
      resultUrl:        result.resultUrl,
      resultUrls:       result.resultUrls,
      durationMs:       result.durationMs,
      resolvedSeed:     result.resolvedSeed,
      creditsRemaining,
    });
  } catch (err) {
    // ------------------------------------------------------------------------
    // 5c. Update Job as failed
    // ------------------------------------------------------------------------
    const serialized = serializeError(err);

    if (job) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error:  serialized.error,
        },
      }).catch(console.error); // best-effort — don't mask the original error
    }

    console.error(`[generate] Job ${job?.id ?? '(no-db)'} failed:`, err);

    const statusCode = serialized.statusCode ?? 500;

    return NextResponse.json(
      {
        ok:    false,
        jobId: job?.id ?? null,
        ...serialized,
      },
      { status: statusCode >= 400 ? statusCode : 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/generate — list recent jobs (lightweight history endpoint)
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit  = Math.min(Number(searchParams.get('limit')  ?? 20), 100);
  const cursor = searchParams.get('cursor') ?? undefined;
  const tool   = searchParams.get('tool')   ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  const where: Record<string, unknown> = {};
  if (tool   && isValidTool(tool))     where.tool   = tool;
  if (status)                          where.status = status;

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id:           true,
      tool:         true,
      status:       true,
      provider:     true,
      prompt:       true,
      width:        true,
      height:       true,
      seed:         true,
      resultUrl:    true,
      resultUrls:   true,
      isPublic:     true,
      createdAt:    true,
      updatedAt:    true,
    },
  });

  const hasMore  = jobs.length > limit;
  const trimmed  = hasMore ? jobs.slice(0, limit) : jobs;
  const nextCursor = hasMore ? trimmed[trimmed.length - 1].id : null;

  return NextResponse.json({
    jobs:       trimmed,
    nextCursor,
    hasMore,
  });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function detectProvider(): ProviderName {
  if (process.env.REPLICATE_API_TOKEN) return 'replicate';
  if (process.env.FAL_KEY)             return 'fal';
  if (process.env.TOGETHER_API_KEY)    return 'together';
  return 'comfyui';
}

const VALID_TOOLS    = new Set(['generate', 'animate', 'rotate', 'inpaint', 'scene']);
const VALID_PROVIDERS = new Set(['replicate', 'fal', 'together', 'comfyui']);
const VALID_PRESETS  = new Set(['rpg_icon', 'emoji', 'tileset', 'sprite_sheet', 'raw', 'game_ui']);

function isValidTool(v: unknown): v is Tool {
  return typeof v === 'string' && VALID_TOOLS.has(v);
}

function isValidProvider(v: unknown): v is ProviderName {
  return typeof v === 'string' && VALID_PROVIDERS.has(v);
}

function isValidStylePreset(v: unknown): v is import('@/lib/providers').StylePreset {
  return typeof v === 'string' && VALID_PRESETS.has(v);
}

/** Clamp a pixel size between 32 and 2048 */
function clampSize(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 512;
  return Math.max(32, Math.min(2048, n));
}

/** Strip sensitive fields before returning job data to client */
function serializeJob(job: {
  id: string;
  tool: string;
  status: string;
  provider: string;
  prompt: string;
  negPrompt: string | null;
  width: number;
  height: number;
  seed: number | null;
  resultUrl: string | null;
  resultUrls: string | null;
  error: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id:         job.id,
    tool:       job.tool,
    status:     job.status,
    provider:   job.provider,
    prompt:     job.prompt,
    width:      job.width,
    height:     job.height,
    seed:       job.seed,
    resultUrl:  job.resultUrl,
    resultUrls: job.resultUrls ? JSON.parse(job.resultUrls) : null,
    isPublic:   job.isPublic,
    createdAt:  job.createdAt.toISOString(),
    updatedAt:  job.updatedAt.toISOString(),
  };
}
