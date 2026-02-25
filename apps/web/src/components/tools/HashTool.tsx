'use client';

import { useState, useRef } from 'react';

type HashAlgo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
const ALGOS: HashAlgo[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

async function hashText(algo: HashAlgo, text: string): Promise<string> {
  // Use Web Crypto API for secure hashing (MD5 removed since it's not available in SubtleCrypto)
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest(algo, enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashFile(algo: HashAlgo, file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashTool() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [input, setInput] = useState('');
  const [algo, setAlgo] = useState<HashAlgo>('SHA-256');
  const [result, setResult] = useState<Record<HashAlgo, string>>({} as Record<HashAlgo, string>);
  const [loading, setLoading] = useState(false);
  const [verifyHash, setVerifyHash] = useState('');
  const [filename, setFilename] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const hashAll = async (text?: string, file?: File) => {
    setLoading(true);
    setResult({} as Record<HashAlgo, string>);
    const out: Partial<Record<HashAlgo, string>> = {};
    for (const a of ALGOS) {
      try {
        out[a] = file ? await hashFile(a, file) : await hashText(a, text ?? input);
      } catch {
        out[a] = 'error';
      }
    }
    setResult(out as Record<HashAlgo, string>);
    setLoading(false);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFilename(f.name);
    await hashAll(undefined, f);
  };

  const copy = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 1500);
  };

  const verifyStatus = verifyHash && result[algo]
    ? result[algo].toLowerCase() === verifyHash.toLowerCase().trim()
      ? 'match'
      : 'mismatch'
    : null;

  return (
    <div className="hash-tool">
      {/* Mode */}
      <div className="json-tool-modes">
        <button className={`json-mode-btn${mode === 'text' ? ' active' : ''}`} onClick={() => setMode('text')}>Text / String</button>
        <button className={`json-mode-btn${mode === 'file' ? ' active' : ''}`} onClick={() => setMode('file')}>File Checksum</button>
      </div>

      {mode === 'text' ? (
        <div className="hash-input-wrap">
          <textarea
            className="json-textarea"
            rows={4}
            placeholder="Enter text to hash…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="btn-primary hash-run-btn" onClick={() => hashAll()} disabled={!input || loading}>
            {loading ? 'Hashing…' : '→ Hash'}
          </button>
        </div>
      ) : (
        <div
          className="tool-dropzone tool-dropzone-sm"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={async e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { setFilename(f.name); await hashAll(undefined, f); }}}
        >
          {filename ? <p className="tool-dropzone-text">{filename}</p> : <>
            <p className="tool-dropzone-text">Drop file here or click to browse</p>
            <p className="tool-dropzone-sub">Any file type — all processing in browser</p>
          </>}
          <input ref={fileRef} type="file" className="tool-file-input-hidden" onChange={onFileChange} />
        </div>
      )}

      {/* Results */}
      {Object.keys(result).length > 0 && (
        <div className="hash-results">
          {ALGOS.map(a => (
            <div key={a} className="hash-result-row">
              <span className="hash-algo-label">{a}</span>
              <code className="hash-value">{result[a]}</code>
              <button className="btn-ghost-xs" onClick={() => copy(result[a])}>
                {copied === result[a] ? '✓' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Verify */}
      {Object.keys(result).length > 0 && (
        <div className="hash-verify">
          <div className="hash-verify-header">
            <span className="json-panel-label">Verify Hash</span>
            <div className="hash-verify-algo">
              {ALGOS.map(a => (
                <button key={a} className={`json-mode-btn xs${algo === a ? ' active' : ''}`} onClick={() => setAlgo(a)}>{a}</button>
              ))}
            </div>
          </div>
          <div className="hash-verify-row">
            <input
              className={`tool-input${verifyStatus === 'match' ? ' success' : verifyStatus === 'mismatch' ? ' error' : ''}`}
              placeholder={`Paste expected ${algo} hash to verify…`}
              value={verifyHash}
              onChange={e => setVerifyHash(e.target.value)}
            />
            {verifyStatus && (
              <span className={`hash-verify-badge ${verifyStatus}`}>
                {verifyStatus === 'match' ? 'Match' : 'Mismatch'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
