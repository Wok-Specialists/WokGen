'use client';

import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Admin — Notification Routing
// Configure which Discord channel receives each event type notification.
// Config is stored server-side in the admin user's preferences.
// ---------------------------------------------------------------------------

type EventType = 'levelUp' | 'jobComplete' | 'newGalleryAsset' | 'errorAlert';

interface ChannelConfig {
  webhookUrl: string;
  enabled: boolean;
}

interface NotifyConfig {
  levelUp:         ChannelConfig;
  jobComplete:     ChannelConfig;
  newGalleryAsset: ChannelConfig;
  errorAlert:      ChannelConfig;
}

const DEFAULT_CONFIG: NotifyConfig = {
  levelUp:         { webhookUrl: '', enabled: false },
  jobComplete:     { webhookUrl: '', enabled: false },
  newGalleryAsset: { webhookUrl: '', enabled: false },
  errorAlert:      { webhookUrl: '', enabled: false },
};

const EVENT_META: Record<EventType, { label: string; desc: string; icon: string }> = {
  levelUp:         { label: 'Level Up',          desc: 'XP gains and user achievement unlocks',     icon: '⭐' },
  jobComplete:     { label: 'Job Complete',       desc: 'Generation jobs that finish successfully',  icon: '✅' },
  newGalleryAsset: { label: 'New Gallery Asset',  desc: 'Newly published public gallery assets',     icon: '🖼️' },
  errorAlert:      { label: 'Error Alert',        desc: 'System errors and failed generation jobs',  icon: '🚨' },
};

const EVENT_TYPES: EventType[] = ['levelUp', 'jobComplete', 'newGalleryAsset', 'errorAlert'];

export default function AdminNotificationsPage() {
  const [config, setConfig]         = useState<NotifyConfig>(DEFAULT_CONFIG);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [testState, setTestState]   = useState<Record<EventType, 'idle' | 'sending' | 'ok' | 'error'>>(
    { levelUp: 'idle', jobComplete: 'idle', newGalleryAsset: 'idle', errorAlert: 'idle' },
  );
  const [saveResult, setSaveResult] = useState<'ok' | 'error' | null>(null);

  // Fetch current config on mount
  useEffect(() => {
    fetch('/api/admin/notifications')
      .then((r) => r.json())
      .then((data: { config?: NotifyConfig }) => {
        if (data.config) setConfig(data.config);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateChannel = useCallback((type: EventType, field: keyof ChannelConfig, value: string | boolean) => {
    setConfig((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch('/api/admin/notifications', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ config }),
      });
      setSaveResult(res.ok ? 'ok' : 'error');
    } catch {
      setSaveResult('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveResult(null), 4000);
    }
  };

  const handleTest = async (type: EventType) => {
    const webhookUrl = config[type].webhookUrl;
    if (!webhookUrl) return;
    setTestState((prev) => ({ ...prev, [type]: 'sending' }));
    try {
      const res = await fetch('/api/admin/notifications', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ test: true, type, webhookUrl }),
      });
      setTestState((prev) => ({ ...prev, [type]: res.ok ? 'ok' : 'error' }));
    } catch {
      setTestState((prev) => ({ ...prev, [type]: 'error' }));
    } finally {
      setTimeout(() => setTestState((prev) => ({ ...prev, [type]: 'idle' })), 3500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-400">Loading notification config…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Routing</h1>
          <p className="mt-1 text-zinc-400 text-sm">
            Configure which Discord channel receives each system event. Paste a Discord Webhook URL for each event type.
          </p>
        </div>

        {/* Event channel cards */}
        <div className="space-y-4">
          {EVENT_TYPES.map((type) => {
            const meta   = EVENT_META[type];
            const ch     = config[type];
            const ts     = testState[type];
            const canTest = !!ch.webhookUrl && ts === 'idle';

            return (
              <div
                key={type}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta.icon}</span>
                      <span className="font-semibold text-zinc-100">{meta.label}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{meta.desc}</p>
                  </div>

                  {/* Enabled toggle */}
                  <button
                    type="button"
                    onClick={() => updateChannel(type, 'enabled', !ch.enabled)}
                    className={`
                      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                      transition-colors duration-200 focus:outline-none
                      ${ch.enabled ? 'bg-indigo-500' : 'bg-zinc-700'}
                    `}
                    aria-label={ch.enabled ? 'Disable' : 'Enable'}
                  >
                    <span
                      className={`
                        inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200
                        ${ch.enabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>

                {/* Webhook URL input + test button */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={ch.webhookUrl}
                    onChange={(e) => updateChannel(type, 'webhookUrl', e.target.value)}
                    className="
                      flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm
                      text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500
                      focus:ring-1 focus:ring-indigo-500 transition
                    "
                  />
                  <button
                    type="button"
                    disabled={!canTest}
                    onClick={() => handleTest(type)}
                    className={`
                      shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition
                      ${canTest
                        ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                      ${ts === 'sending' ? 'animate-pulse' : ''}
                    `}
                  >
                    {ts === 'sending' ? 'Sending…'
                      : ts === 'ok'   ? '✅ Sent!'
                      : ts === 'error'? '❌ Failed'
                      :                 'Test'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className={`
              rounded-lg px-6 py-2.5 text-sm font-semibold transition
              ${saving
                ? 'bg-indigo-700 text-indigo-200 animate-pulse cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'}
            `}
          >
            {saving ? 'Saving…' : 'Save Configuration'}
          </button>
          {saveResult === 'ok'    && <span className="text-sm text-emerald-400">✅ Saved successfully</span>}
          {saveResult === 'error' && <span className="text-sm text-red-400">❌ Save failed — check console</span>}
        </div>

        {/* Usage hint */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-500 space-y-1">
          <p className="font-semibold text-zinc-400">How to create a Discord Webhook URL:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Open Discord → go to the channel you want notifications in</li>
            <li>Channel Settings → Integrations → Webhooks → New Webhook</li>
            <li>Copy the Webhook URL and paste it above</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
