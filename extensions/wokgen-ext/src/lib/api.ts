import { getConfig } from './config';

export interface GenerateRequest {
  prompt: string;
  mode: 'pixel' | 'vector' | 'uiux' | 'business' | 'voice';
  model?: string;
}

export interface Job {
  id: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  outputUrl?: string;
  prompt: string;
  createdAt: string;
}

export async function generateAsset(req: GenerateRequest): Promise<Job> {
  const { apiKey, apiBase } = await getConfig();
  const res = await fetch(`${apiBase}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
  return res.json();
}

export async function getJob(jobId: string): Promise<Job> {
  const { apiKey, apiBase } = await getConfig();
  const res = await fetch(`${apiBase}/api/jobs/${jobId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Job fetch failed: ${res.status}`);
  return res.json();
}

export async function getRecentJobs(limit = 10): Promise<Job[]> {
  const { apiKey, apiBase } = await getConfig();
  const res = await fetch(`${apiBase}/api/jobs?limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.jobs || data || [];
}
