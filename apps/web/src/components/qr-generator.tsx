'use client';

import { useState, useCallback } from 'react';
import QRCode from 'qrcode';

interface Props {
  resultUrl?: string | null;
}

export function QrGenerator({ resultUrl }: Props) {
  const [text, setText] = useState('');
  const [useLogo, setUseLogo] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async () => {
    if (!text.trim()) return;
    setGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(text.trim(), {
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });

      if (useLogo && resultUrl) {
        // Overlay logo in center using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setQrDataUrl(dataUrl); return; }

        const qrImg = new Image();
        await new Promise<void>((resolve) => { qrImg.onload = () => resolve(); qrImg.src = dataUrl; });
        ctx.drawImage(qrImg, 0, 0, 512, 512);

        // Load logo
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = () => reject();
          logoImg.src = resultUrl;
        }).catch(() => null);

        if (logoImg.complete && logoImg.naturalWidth > 0) {
          const logoSize = 512 * 0.2;
          const logoX = (512 - logoSize) / 2;
          const logoY = (512 - logoSize) / 2;

          // White circle background
          ctx.beginPath();
          ctx.arc(256, 256, logoSize / 2 + 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Clip circle for logo
          ctx.save();
          ctx.beginPath();
          ctx.arc(256, 256, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        }

        setQrDataUrl(canvas.toDataURL('image/png'));
      } else {
        setQrDataUrl(dataUrl);
      }
    } catch {
      setQrDataUrl(null);
    } finally {
      setGenerating(false);
    }
  }, [text, useLogo, resultUrl]);

  const downloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  const downloadSvg = async () => {
    if (!text.trim()) return;
    try {
      const svg = await QRCode.toString(text.trim(), { type: 'svg' });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.svg';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <input
        type="text"
        className="studio-input"
        placeholder="Enter URL or text…"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') generate(); }}
        style={{ marginBottom: 8 }}
      />

      {resultUrl && (
        <div className="studio-row studio-row--spaced" style={{ marginBottom: 8 }}>
          <label className="studio-label" style={{ margin: 0, fontSize: '0.75rem' }}>
            Use generated image as logo
          </label>
          <button
            className={`toggle-track${useLogo ? ' on' : ''}`}
            onClick={() => setUseLogo(v => !v)}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      )}

      <button
        className="btn-primary btn-sm"
        style={{ width: '100%', marginBottom: 8 }}
        onClick={generate}
        disabled={!text.trim() || generating}
      >
        {generating ? 'Generating…' : 'Generate QR'}
      </button>

      {qrDataUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code"
            style={{ width: 128, height: 128, imageRendering: 'pixelated', borderRadius: 4, border: '1px solid var(--surface-border)' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost btn-xs" onClick={downloadPng}>↓ PNG</button>
            <button className="btn-ghost btn-xs" onClick={downloadSvg}>↓ SVG</button>
          </div>
        </div>
      )}
    </div>
  );
}
