'use client';
import { useState } from 'react';
import ToolShell from '@/components/tools/ToolShell';

function formatSrtTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ms3 = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms3).padStart(3, '0')}`;
}

export default function TranscribePage() {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
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
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function downloadBlob(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function exportTranscript(format: 'txt' | 'srt' | 'json') {
    if (!result) return;
    if (format === 'txt') {
      const text = result.utterances?.map((u: any) => `${u.speaker}: ${u.text}`).join('\n') || result.text || '';
      downloadBlob(text, 'transcript.txt', 'text/plain');
    } else if (format === 'srt') {
      const srt = result.words?.map((w: any, i: number) =>
        `${i + 1}\n${formatSrtTime(w.start)} --> ${formatSrtTime(w.end)}\n${w.text}\n`
      ).join('\n') || '';
      downloadBlob(srt, 'transcript.srt', 'text/plain');
    } else if (format === 'json') {
      downloadBlob(JSON.stringify(result, null, 2), 'transcript.json', 'application/json');
    }
  }

  return (
    <ToolShell id="transcribe" label="Audio Transcription" description="Transcribe audio with speaker labels, entity detection, and sentiment analysis — powered by AssemblyAI Universal-2." icon="TR">
      <div className="tool-page-root">
      <div className="tool-page-header">
        <h1 className="tool-page-title">Audio Transcription</h1>
        <p className="tool-page-desc">Transcribe audio with speaker labels, entity detection, and sentiment analysis — powered by AssemblyAI Universal-2.</p>
      </div>
      <div className="tool-section">
        <label className="tool-field-label">Audio URL (MP3, WAV, M4A, FLAC, WebM)</label>
        <input
          value={audioUrl}
          onChange={e => setAudioUrl(e.target.value)}
          placeholder="https://example.com/audio.mp3"
          className="tool-field-input"
        />
        <div className="tool-options-row">
          {[
            { key: 'speakerLabels', label: 'Speaker labels' },
            { key: 'entityDetection', label: 'Entity detection' },
            { key: 'sentimentAnalysis', label: 'Sentiment analysis' },
            { key: 'autoChapters', label: 'Auto chapters' },
          ].map(o => (
            <label key={o.key} className="tool-option-label">
              <input type="checkbox" checked={(options as any)[o.key]} onChange={e => setOptions(prev => ({ ...prev, [o.key]: e.target.checked }))} />
              {o.label}
            </label>
          ))}
        </div>
        <button type="button" onClick={transcribe} disabled={loading || !audioUrl.trim()} className="btn btn-primary tool-submit-btn">
          {loading ? 'Transcribing... (~30–60s)' : 'Transcribe Audio'}
        </button>

        {error && <p className="tool-error">{error}</p>}

        {result && (
          <div className="tool-result">
            {audioUrl && (
              <div className="tool-audio-preview">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls className="tool-audio-player" src={audioUrl}>
                  Your browser does not support audio.
                </audio>
              </div>
            )}
            <div className="tool-result-header">
              <div className="tool-result-meta">
                {result.audioDuration ? `${Math.round(result.audioDuration)}s audio` : ''} · {Math.round((result.confidence || 0) * 100)}% confidence
              </div>
              <div className="tool-result-actions">
                <button type="button" onClick={copyText} className="btn btn-secondary tool-action-btn">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button type="button" onClick={() => exportTranscript('txt')} className="btn btn-secondary tool-action-btn">TXT</button>
                {result.words?.length > 0 && (
                  <button type="button" onClick={() => exportTranscript('srt')} className="btn btn-secondary tool-action-btn">SRT</button>
                )}
                <button type="button" onClick={() => exportTranscript('json')} className="btn btn-secondary tool-action-btn">JSON</button>
              </div>
            </div>
            <div className="tool-transcript-body">
              {result.words?.length > 0 ? (
                <>
                  {result.words.map((word: any, i: number) => (
                    <span
                      key={i}
                      className={word.confidence < 0.7 ? 'tool-word--low-conf' : undefined}
                      title={`Confidence: ${Math.round((word.confidence ?? 1) * 100)}%`}
                    >
                      {word.text}{' '}
                    </span>
                  ))}
                </>
              ) : (
                <span className="tool-transcript-text">{result.text}</span>
              )}
            </div>
            {result.utterances?.length > 0 && (
              <div className="tool-subsection">
                <div className="tool-subsection-label">Speaker Breakdown</div>
                {result.utterances.slice(0, 8).map((u: any, i: number) => (
                  <div key={i} className="tool-speaker-row">
                    <span className="tool-speaker-name">Speaker {u.speaker}</span>
                    <span className="tool-speaker-text">{u.text}</span>
                  </div>
                ))}
              </div>
            )}
            {result.entities?.length > 0 && (
              <div className="tool-subsection">
                <div className="tool-subsection-label">Entities Detected</div>
                <div className="tool-entities">
                  {result.entities.map((e: any, i: number) => (
                    <span key={i} className="tool-entity">
                      {e.text} <span className="tool-entity-type">{e.entity_type}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </ToolShell>
  );
}
