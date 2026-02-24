'use client';
import { useState } from 'react';

export default function VectorizePage() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  async function vectorize() {
    if (!imageUrl.trim()) return;
    setLoading(true); setError(''); setSvg('');
    try {
      const res = await fetch('/api/tools/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message || 'Vectorization failed'); return; }
      setSvg(data.data.svg);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadSvg() {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vectorized.svg'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-page-root">
      <div className="tool-page-header">
        <h1 className="tool-page-title">Raster to SVG</h1>
        <p className="tool-page-desc">Convert PNG, JPG, and GIF images into clean, scalable SVG vectors using Vectorizer.AI.</p>
      </div>
      <div className="tool-section">
        <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Image URL</label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && vectorize()}
            placeholder="https://example.com/logo.png"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.625rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.9375rem', outline: 'none' }}
          />
          <button onClick={vectorize} disabled={loading || !imageUrl.trim()} className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', whiteSpace: 'nowrap' }}>
            {loading ? 'Converting...' : 'Vectorize'}
          </button>
        </div>
        {error && <p style={{ marginTop: '0.875rem', color: '#f87171', fontSize: '0.875rem' }}>{error}</p>}
        {svg && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>SVG output ({Math.round(svg.length / 1024)}KB)</span>
              <button onClick={downloadSvg} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Download SVG</button>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <textarea readOnly value={svg} style={{ marginTop: '1rem', width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', resize: 'none', outline: 'none' }} />
          </div>
        )}
      </div>
    </div>
  );
}
