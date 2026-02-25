/**
 * GET /api/v1/jobs
 *
 * List recent generation jobs for the authenticated API key holder.
 * Useful for checking job statuses after batch generation.
 *
 * Query params:
 *   status  - filter: pending | running | succeeded | failed
 *   limit   - default 20, max 100
 *   offset  - pagination offset
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

export const GET = withErrorHandler(async (req: NextRequest) => {
  const apiUser = await authenticateApiKey(req);
  if (!apiUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? undefined;
  const limit  = Math.min(parseInt(url.searchParams.get('limit')  ?? '20', 10), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0',  10), 0);

  const where = {
    userId: apiUser.userId,
    ...(status ? { status } : {}),
  };

  const [jobs, total] = await dbQuery(
    Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id:        true,
          status:    true,
          tool:      true,
          prompt:    true,
          provider:  true,
          width:     true,
          height:    true,
          resultUrl: true,
          error:     true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.job.count({ where }),
    ]),
    8000,
  );

  return NextResponse.json(
    {
      jobs: jobs.map(j => ({
        id:         j.id,
        status:     j.status,
        tool:       j.tool,
        prompt:     j.prompt,
        provider:   j.provider,
        width:      j.width,
        height:     j.height,
        result_url: j.status === 'succeeded' ? j.resultUrl : null,
        error:      j.status === 'failed'    ? j.error     : null,
        created_at: j.createdAt,
        updated_at: j.updatedAt,
      })),
      total,
      limit,
      offset,
    },
    { status: 200, headers: CORS },
  );
});
