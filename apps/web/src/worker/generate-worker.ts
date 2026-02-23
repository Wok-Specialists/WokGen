/**
 * BullMQ generation worker — processes async generation jobs.
 * Start with: node -r tsconfig-paths/register apps/web/src/worker/generate-worker.ts
 * 
 * NOTE: Only runs when REDIS_URL env var is set (ioredis-compatible URL, not Upstash REST).
 * In production: run as a separate Render Background Worker service.
 */

// Guard: only initialize when explicitly running as worker
if (process.env.NODE_ENV !== 'production' && !process.env.WORKER_MODE) {
  process.exit(0);
}

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.error('[worker] REDIS_URL not set — BullMQ worker cannot start');
  process.exit(1);
}

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export interface GenerateJobData {
  jobId: string;
  userId: string;
  prompt: string;
  mode: string;
  style?: string;
  width?: number;
  height?: number;
  seed?: number;
}

const worker = new Worker<GenerateJobData>(
  'generation',
  async (job: Job<GenerateJobData>) => {
    const { jobId, userId, prompt, mode, style } = job.data;
    console.log(`[worker] Processing job ${jobId} for user ${userId}`);

    // Delegate to the same generation logic via internal fetch
    // In a real deployment this would call the generation service directly
    const resp = await fetch(`${process.env.INTERNAL_API_URL ?? 'http://localhost:3000'}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Worker-Secret': process.env.WORKER_SECRET ?? '',
        'X-Job-Id': jobId,
      },
      body: JSON.stringify({ prompt, mode, style, jobId, userId }),
    });

    if (!resp.ok) {
      throw new Error(`Generation failed: ${resp.status} ${await resp.text()}`);
    }

    return resp.json();
  },
  { connection, concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10) }
);

worker.on('completed', job => {
  console.log(`[worker] Completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`[worker] Failed: ${job?.id}`, err.message);
});

console.log('[worker] BullMQ generation worker started');
