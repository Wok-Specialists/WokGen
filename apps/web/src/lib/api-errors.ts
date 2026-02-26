/**
 * Centralised API error helpers — consistent error envelope across all routes.
 *
 * Error envelope shape:
 *   { error: string, code: string, status: number, requestId?: string }
 *
 * All standard error factories are re-exported from api-response.ts so that
 * existing imports (`import { API_ERRORS } from '@/lib/api-response'`) keep working.
 * Routes that need request-scoped IDs should import from this file instead.
 */

import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

// Re-export the shared constants so callers can import from one place.
export { API_ERRORS, apiError, apiSuccess } from '@/lib/api-response';

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export const ERROR_CODES = {
  UNAUTHORIZED:     'UNAUTHORIZED',
  FORBIDDEN:        'FORBIDDEN',
  NOT_FOUND:        'NOT_FOUND',
  BAD_REQUEST:      'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED:     'RATE_LIMITED',
  INTERNAL_ERROR:   'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ---------------------------------------------------------------------------
// Request-ID-aware error factory
// ---------------------------------------------------------------------------

function errWithId(
  { message, code, status }: { message: string; code: string; status: number },
  requestId?: string,
) {
  const body: Record<string, unknown> = { error: message, code, status };
  if (requestId) body.requestId = requestId;
  return NextResponse.json(body, { status });
}

/**
 * Same surface as API_ERRORS but every factory accepts an optional requestId.
 *
 * Usage:
 *   const reqId = randomUUID();
 *   return API_ERRORS_WITH_ID.UNAUTHORIZED(reqId);
 */
export const API_ERRORS_WITH_ID = {
  UNAUTHORIZED:  (requestId?: string) => errWithId({ message: 'Authentication required',  code: 'UNAUTHORIZED',     status: 401 }, requestId),
  FORBIDDEN:     (requestId?: string) => errWithId({ message: 'Access denied',            code: 'FORBIDDEN',        status: 403 }, requestId),
  NOT_FOUND:     (resource = 'Resource', requestId?: string) =>
                   errWithId({ message: `${resource} not found`, code: 'NOT_FOUND', status: 404 }, requestId),
  BAD_REQUEST:   (msg: string, requestId?: string) => errWithId({ message: msg, code: 'BAD_REQUEST',      status: 400 }, requestId),
  VALIDATION:    (msg: string, requestId?: string) => errWithId({ message: msg, code: 'VALIDATION_ERROR', status: 422 }, requestId),
  RATE_LIMITED:  (requestId?: string) => errWithId({ message: 'Too many requests',        code: 'RATE_LIMITED',     status: 429 }, requestId),
  INTERNAL:      (msg = 'Internal server error', requestId?: string) =>
                   errWithId({ message: msg, code: 'INTERNAL_ERROR', status: 500 }, requestId),
};

/** Generate a short request ID suitable for logging and error responses. */
export function newRequestId(): string {
  return randomUUID();
}

// ---------------------------------------------------------------------------
// NOTE: Per-API-key rate limiting (separate from per-user) is not yet
// implemented. Currently `checkRateLimit` keys on userId for authenticated
// routes. A future improvement should key on `keyId` in v1 routes so that
// individual keys can be throttled independently of the owning user account.
// Example key pattern: `v1:key:${apiUser.keyId}:generate`
// ---------------------------------------------------------------------------
