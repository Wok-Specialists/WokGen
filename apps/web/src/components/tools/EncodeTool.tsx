'use client';

import { useState } from 'react';

const MORSE: Record<string, string> = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',
  K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',
  U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
  '6':'-....','7':'--...','8':'---..','9':'----.',' ':'/',
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v,k]));

type Op = 'base64-enc' | 'base64-dec' | 'url-enc' | 'url-dec' | 'html-enc' | 'html-dec' | 'morse-enc' | 'morse-dec' | 'rot13' | 'jwt';

const OPS: { id: Op; label: string }[] = [
  { id: 'base64-enc', label: 'Base64 Encode' },
  { id: 'base64-dec', label: 'Base64 Decode' },
  { id: 'url-enc',    label: 'URL Encode' },
  { id: 'url-dec',    label: 'URL Decode' },
  { id: 'html-enc',   label: 'HTML Encode' },
  { id: 'html-dec',   label: 'HTML Decode' },
  { id: 'morse-enc',  label: 'Morse Encode' },
  { id: 'morse-dec',  label: 'Morse Decode' },
  { id: 'rot13',      label: 'ROT-13' },
  { id: 'jwt',        label: 'JWT Decode' },
];

function htmlEncode(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function htmlDecode(s: string) {
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'");
}
function rot13(s: string) {
  return s.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function transform(op: Op, input: string): string {
  try {
    switch (op) {
      case 'base64-enc': return btoa(unescape(encodeURIComponent(input)));
      case 'base64-dec': return decodeURIComponent(escape(atob(input)));
      case 'url-enc':    return encodeURIComponent(input);
      case 'url-dec':    return decodeURIComponent(input);
      case 'html-enc':   return htmlEncode(input);
      case 'html-dec':   return htmlDecode(input);
      case 'morse-enc':
        return input.toUpperCase().split('').map(c => MORSE[c] ?? '?').join(' ');
      case 'morse-dec':
        return input.split(' ').map(code => MORSE_REV[code] ?? '?').join('').toLowerCase();
      case 'rot13':      return rot13(input);
      case 'jwt': {
        const parts = input.trim().split('.');
        if (parts.length !== 3) return 'Invalid JWT (expected 3 parts)';
        const dec = (s: string) => {
          const pad = s.length % 4 === 0 ? s : s + '='.repeat(4 - (s.length % 4));
          return JSON.parse(decodeURIComponent(escape(atob(pad.replace(/-/g,'+').replace(/_/g,'/')))));
        };
        return JSON.stringify({ header: dec(parts[0]), payload: dec(parts[1]), signature: parts[2] }, null, 2);
      }
    }
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

export default function EncodeTool() {
  const [input, setInput] = useState('');
  const [op, setOp] = useState<Op>('base64-enc');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const run = () => setOutput(transform(op, input));
  const swap = () => { setInput(output); setOutput(''); };
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="encode-tool">
      {/* Op selector */}
      <div className="encode-ops-grid">
        {OPS.map(o => (
          <button
            key={o.id}
            className={`json-mode-btn${op === o.id ? ' active' : ''}`}
            onClick={() => { setOp(o.id); setOutput(''); }}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="json-tool-panels">
        <div className="json-panel">
          <div className="json-panel-header">
            <span className="json-panel-label">Input</span>
            <button className="btn-ghost-xs" onClick={() => { setInput(''); setOutput(''); }}>Clear</button>
          </div>
          <textarea className="json-textarea" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to encode/decode…" rows={6} />
        </div>

        <div className="json-panel-separator">
          <button className="btn-primary json-run-btn" onClick={run}>→ Run</button>
          {output && <button className="btn-ghost json-run-btn" onClick={swap}>⇄ Swap</button>}
        </div>

        <div className="json-panel">
          <div className="json-panel-header">
            <span className="json-panel-label">Output</span>
            {output && <button className="btn-ghost-xs" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>}
          </div>
          <textarea className="json-textarea output" value={output} readOnly placeholder="Output will appear here…" rows={6} />
        </div>
      </div>
    </div>
  );
}
