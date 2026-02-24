'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'wokgen-donation-strip-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function DonationStrip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setVisible(true);
        return;
      }
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts > DISMISS_DURATION_MS) {
        setVisible(true);
      }
    } catch {
      // localStorage not available (SSR / private browsing)
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="donation-strip" role="banner" aria-label="Support WokGen">
      <p className="donation-strip-text">
        WokGen is free forever.{' '}
        If it helps you create, consider{' '}
        <Link href="/support" onClick={dismiss}>supporting the project →</Link>
      </p>
      <button
        className="donation-strip-close"
        onClick={dismiss}
        aria-label="Dismiss"
        title="Dismiss for 7 days"
      >
        ×
      </button>
    </div>
  );
}
