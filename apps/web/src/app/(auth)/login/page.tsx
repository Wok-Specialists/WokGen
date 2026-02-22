'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/studio';

  return (
    <main className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-badge">Early Preview</span>
          <h1 className="login-title">
            <span style={{ color: 'var(--text-muted)' }}>Wok</span>
            <span style={{ color: '#a78bfa' }}>Gen</span>
          </h1>
          <p className="login-sub">by Wok Specialists</p>
        </div>

        <p className="login-desc">
          Sign in to save your generations and access HD quality.
        </p>

        <div className="login-actions">
          <button
            className="login-btn login-btn--google"
            onClick={() => signIn('google', { callbackUrl })}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="login-divider">
          <span>or</span>
        </div>

        <a href="/studio" className="login-guest">
          Try without an account →
        </a>

        <p className="login-hint">
          Guest access supports standard generation only (no HD, no history).
        </p>

        <p className="login-footer">
          <a href="https://wokspec.org" className="login-back">← wokspec.org</a>
        </p>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg, #0d0d0d);
          padding: 2rem;
        }
        .login-card {
          width: 100%;
          max-width: 380px;
          background: var(--bg-surface, #141414);
          border: 1px solid var(--border, #2c2c2c);
          border-radius: 4px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .login-brand {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }
        .login-badge {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #a78bfa;
          background: rgba(167,139,250,.1);
          border: 1px solid rgba(167,139,250,.25);
          border-radius: 2px;
          padding: 2px 8px;
        }
        .login-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          font-family: var(--font-heading);
        }
        .login-sub {
          font-size: 0.78rem;
          color: var(--text-muted, #666);
          margin: 0;
        }
        .login-desc {
          font-size: 0.85rem;
          color: var(--text-muted, #888);
          text-align: center;
          margin: 0;
          line-height: 1.5;
        }
        .login-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 4px;
          border: 1px solid var(--border, #2c2c2c);
          background: var(--bg-elevated, #1c1c1c);
          color: var(--text, #ebebeb);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .login-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: #3a3a3a;
        }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-faint, #464646);
          font-size: 0.75rem;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border, #2c2c2c);
        }
        .login-guest {
          display: block;
          text-align: center;
          font-size: 0.85rem;
          color: #a78bfa;
          text-decoration: none;
          padding: 0.6rem;
          border-radius: 4px;
          border: 1px solid rgba(167,139,250,.25);
          transition: background 0.15s, border-color 0.15s;
        }
        .login-guest:hover {
          background: rgba(167,139,250,.08);
          border-color: rgba(167,139,250,.4);
        }
        .login-hint {
          font-size: 0.72rem;
          color: var(--text-faint, #464646);
          text-align: center;
          margin: -0.5rem 0 0;
          line-height: 1.5;
        }
        .login-footer {
          text-align: center;
          margin: 0;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border, #2c2c2c);
        }
        .login-back {
          font-size: 0.78rem;
          color: var(--text-faint, #464646);
          text-decoration: none;
          transition: color 0.15s;
        }
        .login-back:hover { color: var(--text-muted, #888); }
      `}</style>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
