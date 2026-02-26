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
 *
 * BullMQ async path (requires Redis + workers):
 *   When BULL_MQ_ENABLED=true and REDIS_URL is set, queueGeneration() pushes
 *   jobs to BullMQ for async processing by a separate worker process.
 */

import PQueue from 'p-queue';
import { log } from '@/lib/logger';

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

/** True when BullMQ async workers are enabled (requires Redis). */
export const QUEUE_ENABLED =
  process.env.BULL_MQ_ENABLED === 'true' && !!process.env.REDIS_URL;

export interface QueueGenerationParams {
  jobId: string;
  userId: string;
  prompt: string;
  mode: string;
  style?: string;
}

/**
 * Push a generation job to the BullMQ queue.
 * Throws if QUEUE_ENABLED is false so callers know to use the sync path.
 */
export async function queueGeneration(params: QueueGenerationParams): Promise<void> {
  if (!QUEUE_ENABLED) {
    throw new Error('[gen-queue] BullMQ queue is not enabled — use sync generation path');
  }
  const { Queue } = await import('bullmq');
  const IORedis = (await import('ioredis')).default;
  const conn = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null, lazyConnect: true });
  const q = new Queue('generation', { connection: conn });
  try {
    await q.add('generate', params, { jobId: params.jobId, attempts: 3, removeOnComplete: { count: 100 }, removeOnFail: { count: 100 } });
  } finally {
    await conn.quit();
  }
}

export interface QueuedJobStatus {
  jobId: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';
  progress?: number;
  failedReason?: string;
}

/**
 * Retrieve the BullMQ status of a queued job.
 * Returns state 'unknown' if the queue is not enabled or the job is not found.
 */
export async function getQueuedJobStatus(jobId: string): Promise<QueuedJobStatus> {
  if (!QUEUE_ENABLED) return { jobId, state: 'unknown' };
  try {
    const { Queue } = await import('bullmq');
    const IORedis = (await import('ioredis')).default;
    const conn = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null, lazyConnect: true });
    const q = new Queue('generation', { connection: conn });
    const job = await q.getJob(jobId);
    await conn.quit();
    if (!job) return { jobId, state: 'unknown' };
    const state = await job.getState();
    return {
      jobId,
      state: state as QueuedJobStatus['state'],
      progress: typeof job.progress === 'number' ? job.progress : undefined,
      failedReason: job.failedReason ?? undefined,
    };
  } catch {
    return { jobId, state: 'unknown' };
  }
}

export async function enqueueGeneration(data: QueueGenerationParams): Promise<void> {
  // Only enqueue if REDIS_URL and BullMQ are available
  if (!process.env.REDIS_URL) return; // fall through to sync path
  try {
    const { Queue } = await import('bullmq');
    const IORedis = (await import('ioredis')).default;
    const conn = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });
    const q = new Queue('generation', { connection: conn });
    await q.add('generate', data, { jobId: data.jobId, attempts: 3, removeOnComplete: { count: 100 }, removeOnFail: { count: 100 } });
    await conn.quit();
  } catch (err) {
    log.error({ err }, '[gen-queue] Failed to enqueue, falling back to sync');
  }
}

export { genQueue };
export default genQueue;
