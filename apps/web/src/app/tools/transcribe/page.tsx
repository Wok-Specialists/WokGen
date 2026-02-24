'use client';
import { useState } from 'react';

export default function TranscribePage() {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({ speakerLabels: true, entityDetection: true, sentimentAnalysis: false, autoChapters: false });

  async function transcribe() {
    if (!audioUrl.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tools/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, ...options }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Transcription failed'); return; }
      setResult(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyText() {
    if (result?.text) navigator.clipboard.writeText(result.text);
  }

  return (
    <div className="tool-page-root">
      <div className="tool-page-header">
        <h1 className="tool-page-title">Audio Transcription</h1>
        <p className="tool-page-desc">Transcribe audio with speaker labels, entity detection, and sentiment analysis — powered by AssemblyAI Universal-2.</p>
      </div>
      <div className="tool-section">
        <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Audio URL (MP3, WAV, M4A, FLAC, WebM)</label>
        <input
          value={audioUrl}
          onChange={e => setAudioUrl(e.target.value)}
          placeholder="https://example.com/audio.mp3"
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.9375rem', outline: 'none', marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {[
            { key: 'speakerLabels', label: 'Speaker labels' },
            { key: 'entityDetection', label: 'Entity detection' },
            { key: 'sentimentAnalysis', label: 'Sentiment analysis' },
            { key: 'autoChapters', label: 'Auto chapters' },
          ].map(o => (
            <label key={o.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={(options as any)[o.key]} onChange={e => setOptions(prev => ({ ...prev, [o.key]: e.target.checked }))} />
              {o.label}
            </label>
          ))}
        </div>
        <button onClick={transcribe} disabled={loading || !audioUrl.trim()} className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
          {loading ? 'Transcribing... (~30–60s)' : 'Transcribe Audio'}
        </button>

        {error && <p style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.875rem' }}>{error}</p>}

        {result && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {result.audioDuration ? `${Math.round(result.audioDuration)}s audio` : ''} · {Math.round((result.confidence || 0) * 100)}% confidence
              </div>
              <button onClick={copyText} className="btn btn-secondary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}>Copy</button>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', maxHeight: '300px', overflowY: 'auto', fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {result.text}
            </div>
            {result.utterances?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Speaker Breakdown</div>
                {result.utterances.slice(0, 8).map((u: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.875rem' }}>
                    <span style={{ color: '#a78bfa', fontWeight: 700, flexShrink: 0, width: '60px' }}>Speaker {u.speaker}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{u.text}</span>
                  </div>
                ))}
              </div>
            )}
            {result.entities?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entities Detected</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {result.entities.map((e: any, i: number) => (
                    <span key={i} style={{ padding: '0.2rem 0.625rem', border: '1px solid var(--border)', borderRadius: '999px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {e.text} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{e.entity_type}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
