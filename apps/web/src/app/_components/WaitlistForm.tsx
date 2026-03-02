'use client';

import { useState } from 'react';

interface Props {
  mode: string;
  accent?: string;
}

export function WaitlistForm({ mode, accent = 'var(--accent)' }: Props) {
  const [email,     setEmail]     = useState('');
  const [honeypot,  setHoneypot]  = useState('');
  const [status,    setStatus]    = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg,  setErrorMsg]  = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;
    if (honeypot) return; // silently discard bot submissions
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), mode }),
      });
      if (res.ok) {
        setStatus('done');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? 'Something went wrong. Try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="waitlist-success">
        <span>✓</span>
        <span>You&apos;re on the list! We&apos;ll notify you when {mode} launches.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="waitlist-form">
      {/* Honeypot: hidden from humans, visible to bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={e => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="waitlist-honeypot"
      />
      <div className="waitlist-row">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="waitlist-input"
          onFocus={e => { e.currentTarget.style.borderColor = accent; }}
          onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="waitlist-submit"
          style={{ background: accent, opacity: status === 'loading' ? 0.7 : 1, cursor: status === 'loading' ? 'wait' : 'pointer' }}
        >
          {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
        </button>
      </div>
      {status === 'error' && (
        <p className="waitlist-error">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
