// Standard API response helpers
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

export function apiError(message: string, code: string, status: number) {
  return Response.json({ error: message, code, status }, { status });
}

export const API_ERRORS = {
  UNAUTHORIZED: () => apiError('Authentication required', 'UNAUTHORIZED', 401),
  FORBIDDEN: () => apiError('Access denied', 'FORBIDDEN', 403),
  NOT_FOUND: (resource = 'Resource') => apiError(`${resource} not found`, 'NOT_FOUND', 404),
  BAD_REQUEST: (msg: string) => apiError(msg, 'BAD_REQUEST', 400),
  RATE_LIMITED: () => apiError('Too many requests', 'RATE_LIMITED', 429),
  INTERNAL: (msg = 'Internal server error') => apiError(msg, 'INTERNAL_ERROR', 500),
  VALIDATION: (msg: string) => apiError(msg, 'VALIDATION_ERROR', 422),
};
