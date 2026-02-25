/**
 * GET /api/v1/jobs/:id
 *
 * Poll the status of an async generation job.
 * Returns the job's current state, and resultUrl once succeeded.
 *
 * Authentication: Bearer API key
 */
import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey } from '@/lib/api-key-auth';
import { withErrorHandler, dbQuery } from '@/lib/api-handler';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export const GET = withErrorHandler(async (req: NextRequest, ctx) => {
  const jobId = ctx?.params?.id;
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400, headers: CORS });
  }

  const apiUser = await authenticateApiKey(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  const job = await dbQuery(
    prisma.job.findFirst({
      where: { id: jobId, userId: apiUser.userId },
      select: {
        id:         true,
        status:     true,
        tool:       true,
        prompt:     true,
        provider:   true,
        width:      true,
        height:     true,
        seed:       true,
        resultUrl:  true,
        resultUrls: true,
        error:      true,
        createdAt:  true,
        updatedAt:  true,
      },
    }),
    8000,
  );

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: CORS });
  }

  const response = {
    id:          job.id,
    status:      job.status,
    tool:        job.tool,
    prompt:      job.prompt,
    provider:    job.provider,
    width:       job.width,
    height:      job.height,
    seed:        job.seed,
    result_url:  job.status === 'succeeded' ? job.resultUrl   : null,
    result_urls: job.status === 'succeeded' ? (job.resultUrls ?? []) : [],
    error:       job.status === 'failed'    ? job.error       : null,
    created_at:  job.createdAt,
    updated_at:  job.updatedAt,
  };

  const cacheControl = (job.status === 'succeeded' || job.status === 'failed')
    ? 'public, max-age=300'
    : 'no-store';

  return NextResponse.json(response, {
    status: 200,
    headers: { ...CORS, 'Cache-Control': cacheControl },
  });
});
