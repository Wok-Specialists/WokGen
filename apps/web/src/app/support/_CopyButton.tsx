'use client';

import { useState } from 'react';

export function CopyButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <button type="button"
      onClick={handleCopy}
      className="btn-ghost btn-sm support-wallet-copy-btn"
      aria-label="Copy wallet address"
    >
      {copied ? '✓ Copied!' : 'Copy address'}
    </button>
  );
}
