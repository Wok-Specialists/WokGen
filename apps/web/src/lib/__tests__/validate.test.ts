import { describe, it, expect } from 'vitest';
import { validateBody, validateQuery } from '../validate';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// validateBody
// ---------------------------------------------------------------------------

describe('validateBody', () => {
  const TestSchema = z.object({
    name: z.string().min(1),
    count: z.number().int().positive(),
  });

  it('returns data on valid JSON body', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'WokGen', count: 42 }),
    });
    const result = await validateBody(req, TestSchema);
    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ name: 'WokGen', count: 42 });
  });

  it('returns 400 error on invalid JSON', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const result = await validateBody(req, TestSchema);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(NextResponse);
    const body = await result.error!.json();
    expect(body.code).toBe('INVALID_JSON');
    expect(result.error!.status).toBe(400);
  });

  it('returns 400 error on schema validation failure', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', count: -1 }),
    });
    const result = await validateBody(req, TestSchema);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(NextResponse);
    const body = await result.error!.json();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(body.issues)).toBe(true);
    expect(body.issues.length).toBeGreaterThan(0);
    expect(result.error!.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// validateQuery
// ---------------------------------------------------------------------------

describe('validateQuery', () => {
  const QuerySchema = z.object({
    page: z.string().regex(/^\d+$/, 'Must be a number'),
    limit: z.string().optional(),
  });

  it('returns data on valid query params', () => {
    const params = new URLSearchParams({ page: '1', limit: '20' });
    const result = validateQuery(params, QuerySchema);
    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ page: '1', limit: '20' });
  });

  it('returns 400 on invalid query params', () => {
    const params = new URLSearchParams({ page: 'abc' });
    const result = validateQuery(params, QuerySchema);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(NextResponse);
    expect(result.error!.status).toBe(400);
  });
});
