import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma, dbQuery } from '@/lib/db';
import { API_ERRORS } from '@/lib/api-response';
import { log } from '@/lib/logger';

// ---------------------------------------------------------------------------
// GET /api/metrics
//
// Prometheus-compatible metrics endpoint.
// Secured: admin session OR METRICS_SECRET header.
// Exposes: generation counts, error rates, quota usage, active users.
// ---------------------------------------------------------------------------

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function metric(name: string, help: string, type: string, value: number | Record<string, number>, labels?: Record<string, string>): string {
  const labelStr = labels ? '{' + Object.entries(labels).map(([k,v]) => `${k}="${v}"`).join(',') + '}' : '';
  if (typeof value === 'number') {
    return `# HELP ${name} ${help}\n# TYPE ${name} ${type}\n${name}${labelStr} ${value}\n`;
  }
  const lines = Object.entries(value).map(([k, v]) => `${name}{${Object.entries(labels ?? {}).map(([lk,lv]) => `${lk}="${lv}",`).join('')}status="${k}"} ${v}`);
  return `# HELP ${name} ${help}\n# TYPE ${name} ${type}\n${lines.join('\n')}\n`;
}

export async function GET(req: NextRequest) {
  try {
    // Auth: admin session OR secret header
    const secret = req.headers.get('x-metrics-secret');
    const session = await auth();
    const isAdmin = session?.user?.email && process.env.ADMIN_EMAIL?.split(',').includes(session.user.email);

    if (!isAdmin && secret !== process.env.METRICS_SECRET) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 86_400_000);
    const hourAgo = new Date(now.getTime() - 3_600_000);

    const [
      totalJobs,
      jobsToday,
      jobsHour,
      jobsByStatus,
      activeUsers,
      totalUsers,
    ] = await dbQuery(Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.job.count({ where: { createdAt: { gte: hourAgo } } }),
      prisma.job.groupBy({ by: ['status'], _count: true }),
      prisma.user.count({ where: { jobs: { some: { createdAt: { gte: dayAgo } } } } }),
      prisma.user.count(),
    ]));

    const statusMap: Record<string, number> = {};
    for (const g of jobsByStatus) statusMap[g.status] = g._count;

    let output = '';
    output += metric('wokgen_jobs_total',           'Total generation jobs ever',             'counter', totalJobs);
    output += metric('wokgen_jobs_24h',             'Generation jobs in last 24h',            'gauge',   jobsToday);
    output += metric('wokgen_jobs_1h',              'Generation jobs in last 1h',             'gauge',   jobsHour);
    output += metric('wokgen_jobs_by_status_total', 'Jobs broken down by status',             'gauge',   statusMap);
    output += metric('wokgen_active_users_24h',     'Users with a generation in last 24h',    'gauge',   activeUsers);
    output += metric('wokgen_users_total',          'Total registered users',                 'gauge',   totalUsers);
    output += metric('wokgen_scrape_timestamp',     'Unix timestamp of this scrape',          'gauge',   Math.floor(now.getTime() / 1000));

    // BullMQ queue depth (only when Redis-backed queue is enabled)
    if (process.env.BULL_MQ_ENABLED === 'true' && process.env.REDIS_URL) {
      try {
        const { Queue } = await import('bullmq');
        const IORedis = (await import('ioredis')).default;
        const conn = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });
        const q = new Queue('generation', { connection: conn });
        const counts = await q.getJobCounts('waiting', 'active', 'delayed', 'failed');
        await conn.quit();
        const depth = (counts.waiting ?? 0) + (counts.active ?? 0) + (counts.delayed ?? 0);
        output += metric('wokgen_job_queue_depth',    'Number of jobs waiting/active/delayed in BullMQ queue', 'gauge', depth);
        output += metric('wokgen_job_queue_failed',   'Number of failed jobs in BullMQ queue',                 'gauge', counts.failed ?? 0);
      } catch {
        // Non-fatal — queue may not be reachable
      }
    }

    return new NextResponse(output, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    log.error({ err }, 'GET /api/metrics failed');
    return API_ERRORS.INTERNAL();
  }
}
