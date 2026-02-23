/**
 * WokGen Generation Queue — p-queue based concurrency control.
 *
 * Prevents thundering-herd: when many users trigger generation simultaneously,
 * this limits in-flight provider calls per process (not per user — that's
 * handled by checkConcurrent in lib/quota.ts).
 *
 * This is a process-local queue. On Vercel, each serverless instance has its
 * own queue — that's intentional. The per-user concurrent limit in quota.ts
 * is the shared (Redis-backed) authoritative guard.
 *
 * Usage:
 *   const result = await genQueue.add(() => generate(params));
 */

import PQueue from 'p-queue';

// Max 10 simultaneous AI provider calls per serverless instance.
// Adjust via GENERATION_CONCURRENCY env var.
const CONCURRENCY = parseInt(process.env.GENERATION_CONCURRENCY || '10', 10);

// Queue with timeout — if a job is waiting more than 45s it's dropped.
const genQueue = new PQueue({
  concurrency: CONCURRENCY,
  timeout: 45_000,
});

genQueue.on('error', () => {
  // Errors are handled by the caller — just prevent unhandled rejection
});

export async function enqueueGeneration(data: {
  jobId: string;
  userId: string;
  prompt: string;
  mode: string;
  style?: string;
}): Promise<void> {
  // Only enqueue if REDIS_URL and BullMQ are available
  if (!process.env.REDIS_URL) return; // fall through to sync path
  try {
    const { Queue } = await import('bullmq');
    const IORedis = (await import('ioredis')).default;
    const conn = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });
    const q = new Queue('generation', { connection: conn });
    await q.add('generate', data, { jobId: data.jobId, removeOnComplete: 100, removeOnFail: 50 });
    await conn.quit();
  } catch (err) {
    console.warn('[gen-queue] Failed to enqueue, falling back to sync:', err);
  }
}

export { genQueue };
export default genQueue;
