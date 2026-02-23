/**
 * Structured logger for WokGen.
 *
 * In production (Vercel): emits JSON lines to stdout — picked up by Vercel's
 * log drain and readable in the Vercel dashboard. Each line is a single JSON
 * object so log aggregators (Datadog, Axiom, etc.) can parse it automatically.
 *
 * In development: emits colorized human-readable output.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('generate', { userId, provider, durationMs });
 *   logger.error('billing', { error: err.message, planId });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

const IS_PROD = process.env.NODE_ENV === 'production';
const LOG_LEVEL = (process.env.LOG_LEVEL ?? (IS_PROD ? 'info' : 'debug')) as LogLevel;

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

function emit(level: LogLevel, tag: string, ctx: LogContext): void {
  if (!shouldLog(level)) return;

  if (IS_PROD) {
    // JSON line — Vercel captures stdout as structured logs
    process.stdout.write(
      JSON.stringify({ level, tag, ts: new Date().toISOString(), ...ctx }) + '\n',
    );
    return;
  }

  // Dev: colorized output
  const colors: Record<LogLevel, string> = {
    debug: '\x1b[90m', // gray
    info:  '\x1b[36m', // cyan
    warn:  '\x1b[33m', // yellow
    error: '\x1b[31m', // red
  };
  const reset = '\x1b[0m';
  const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  const ctxStr = Object.keys(ctx).length ? ' ' + JSON.stringify(ctx) : '';
  console[level === 'debug' ? 'debug' : level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
    `${colors[level]}[${ts}] ${level.toUpperCase()} [${tag}]${reset}${ctxStr}`,
  );
}

export const logger = {
  debug: (tag: string, ctx: LogContext = {}) => emit('debug', tag, ctx),
  info:  (tag: string, ctx: LogContext = {}) => emit('info',  tag, ctx),
  warn:  (tag: string, ctx: LogContext = {}) => emit('warn',  tag, ctx),
  error: (tag: string, ctx: LogContext = {}) => emit('error', tag, ctx),
};

/**
 * Wrap a Next.js route handler with request/response logging.
 *
 * Usage (in route.ts):
 *   export const POST = withLogging('generate', async (req) => { ... });
 */
export function withLogging<T extends Response>(
  tag: string,
  handler: (req: Request, ...args: unknown[]) => Promise<T>,
) {
  return async (req: Request, ...args: unknown[]): Promise<T> => {
    const start = Date.now();
    const method = req.method;
    const url = new URL(req.url);

    try {
      const res = await handler(req, ...args);
      const durationMs = Date.now() - start;
      const level: LogLevel = res.status >= 500 ? 'error' : res.status >= 400 ? 'warn' : 'info';
      emit(level, tag, {
        method,
        path: url.pathname,
        status: res.status,
        durationMs,
      });
      return res;
    } catch (err) {
      logger.error(tag, {
        method,
        path: url.pathname,
        durationMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  };
}
