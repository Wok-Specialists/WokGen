'use client';

import { useState, useEffect, useCallback } from 'react';

interface ServiceDef {
  key: string;
  label: string;
  hint: string;
  link: string;
  linkLabel: string;
  placeholder: string;
}

const SERVICES: ServiceDef[] = [
  {
    key: 'CEREBRAS_API_KEY',
    label: 'Cerebras (Ultra-fast Llama)',
    hint: 'Blazing fast Llama inference',
    link: 'https://cerebras.ai',
    linkLabel: 'cerebras.ai',
    placeholder: 'csk-...',
  },
  {
    key: 'GEMINI_API_KEY',
    label: 'Google Gemini Flash 2.0',
    hint: 'Google\'s multimodal AI',
    link: 'https://aistudio.google.com',
    linkLabel: 'aistudio.google.com',
    placeholder: 'AIza...',
  },
  {
    key: 'OPENROUTER_API_KEY',
    label: 'OpenRouter (Free Models)',
    hint: 'Access 100+ free AI models',
    link: 'https://openrouter.ai',
    linkLabel: 'openrouter.ai',
    placeholder: 'sk-or-...',
  },
  {
    key: 'FREESOUND_API_KEY',
    label: 'Freesound (SFX Library)',
    hint: '600K+ CC-licensed sounds',
    link: 'https://freesound.org',
    linkLabel: 'freesound.org',
    placeholder: 'Enter API key',
  },
  {
    key: 'PIXABAY_API_KEY',
    label: 'Pixabay (Asset Library)',
    hint: '5M+ free CC0 images & videos',
    link: 'https://pixabay.com/api/docs/',
    linkLabel: 'pixabay.com/api/docs',
    placeholder: 'Enter API key',
  },
];

function ApiKeyRow({ service, isSet, onSave }: {
  service: ServiceDef;
  isSet: boolean;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(service.key, value);
      setSaved(true);
      setValue('');
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await onSave(service.key, '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="api-key-row">
      <div className="api-key-row__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className={`api-key-row__dot${isSet ? ' api-key-row__dot--set' : ''}`}
            title={isSet ? 'Key is set' : 'Key not set'}
          />
          <span className="api-key-row__label">{service.label}</span>
        </div>
        <a
          href={service.link}
          target="_blank"
          rel="noopener noreferrer"
          className="api-key-row__link"
        >
          Free signup → {service.linkLabel}
        </a>
      </div>
      <div className="api-key-row__input-group">
        <input
          type="password"
          className="input"
          placeholder={isSet ? '••••••••••••••••' : service.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn--primary"
          style={{ fontSize: 13, padding: '6px 14px', flexShrink: 0 }}
          onClick={handleSave}
          disabled={saving || !value.trim()}
        >
          {saving ? '…' : saved ? '✓ Saved' : 'Save'}
        </button>
        {isSet && (
          <button
            type="button"
            className="btn"
            style={{ fontSize: 13, padding: '6px 10px', flexShrink: 0, color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent' }}
            onClick={handleClear}
            disabled={saving}
            title="Remove key"
          >
            ×
          </button>
        )}
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{service.hint}</span>
    </div>
  );
}

export function AiServicesSettings() {
  const [keyStatus, setKeyStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/user/api-keys')
      .then((r) => r.json())
      .then((d: { keys?: Record<string, boolean> }) => { if (d.keys) setKeyStatus(d.keys); })
      .catch(() => setError('Failed to load key status'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async (key: string, value: string) => {
    const res = await fetch('/api/user/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error('Save failed');
    setKeyStatus((prev) => ({ ...prev, [key]: !!value }));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Loading…</div>;

  return (
    <div className="settings-api-keys">
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Bring your own API keys to unlock premium features. Your keys are stored securely server-side
          and take precedence over platform defaults. Keys are never returned in plaintext.
        </p>
      </div>
      {error && <div className="tool-page__error" style={{ marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SERVICES.map((svc) => (
          <ApiKeyRow
            key={svc.key}
            service={svc}
            isSet={keyStatus[svc.key] ?? false}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
