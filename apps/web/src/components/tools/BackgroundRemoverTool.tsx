'use client';

import { useState, useRef, useCallback } from 'react';

type Status = 'idle' | 'loading-model' | 'processing' | 'done' | 'error';

export default function BackgroundRemoverTool() {
  const [status, setStatus] = useState<Status>('idle');
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP, etc.)');
      return;
    }

    setError(null);
    setResultUrl(null);
    setProgress(0);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setStatus('loading-model');

    try {
      // Dynamic import so WASM only loads when tool is used
      const { removeBackground } = await import('@imgly/background-removal');
      setStatus('processing');
      setProgress(30);

      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (total > 0) setProgress(Math.round((current / total) * 70) + 30);
        },
      });

      setProgress(100);
      setResultUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Background removal failed. Try a different image.'
      );
      setStatus('error');
    }
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const reset = () => {
    setStatus('idle');
    setOriginalUrl(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="bgr-tool">
      {/* Upload Zone */}
      {status === 'idle' && (
        <div
          className="tool-dropzone"
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div className="tool-dropzone-icon">✂️</div>
          <p className="tool-dropzone-text">Drop an image here or click to browse</p>
          <p className="tool-dropzone-sub">PNG · JPG · WebP · AVIF · BMP · TIFF</p>
          <p className="tool-dropzone-private">🔒 Processed entirely in your browser — nothing uploaded</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="tool-file-input-hidden"
            onChange={onFileChange}
          />
        </div>
      )}

      {/* Loading / Processing */}
      {(status === 'loading-model' || status === 'processing') && (
        <div className="tool-processing">
          <div className="tool-processing-icon">✂️</div>
          <p className="tool-processing-label">
            {status === 'loading-model'
              ? 'Loading AI model (one-time download ~3MB)…'
              : 'Removing background…'}
          </p>
          <div className="tool-progress-bar">
            <div className="tool-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="tool-processing-sub">{progress}%</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="tool-error-state">
          <p className="tool-error-text">⚠️ {error}</p>
          <button className="btn-primary" onClick={reset}>Try Again</button>
        </div>
      )}

      {/* Result */}
      {status === 'done' && resultUrl && originalUrl && (
        <div className="bgr-result">
          <div className="bgr-compare">
            <div className="bgr-compare-item">
              <p className="bgr-compare-label">Original</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={originalUrl} alt="Original" className="bgr-img" />
            </div>
            <div className="bgr-compare-divider" aria-hidden="true">→</div>
            <div className="bgr-compare-item">
              <p className="bgr-compare-label">Background Removed</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl}
                alt="Background removed"
                className="bgr-img bgr-img-result"
              />
            </div>
          </div>

          <div className="bgr-actions">
            <a
              href={resultUrl}
              download="background-removed.png"
              className="btn-primary"
            >
              ↓ Download PNG
            </a>
            <button className="btn-ghost" onClick={reset}>
              Process Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
