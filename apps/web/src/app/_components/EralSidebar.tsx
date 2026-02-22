'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// EralSidebar — collapsible AI companion widget for studio pages
// ---------------------------------------------------------------------------

export interface EralSidebarProps {
  mode: string;
  tool?: string;
  prompt?: string;
  studioContext?: string;
}

type ModelVariant = 'eral-7c' | 'eral-mini';

interface SidebarMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

const MINI_MODEL_OPTIONS: { value: ModelVariant; label: string }[] = [
  { value: 'eral-7c',   label: 'Eral 7c'   },
  { value: 'eral-mini', label: 'Eral Mini' },
];

// Lightweight inline markdown for code blocks + bold/inline code
function renderSidebarMd(text: string): string {
  let out = text.replace(/```[\w]*\n?([\s\S]*?)```/g, (_m, code) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="esb-code"><code>${escaped.trimEnd()}</code></pre>`;
  });
  out = out.replace(/`([^`\n]+)`/g, (_m, c) => {
    const e = c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<code class="esb-inline-code">${e}</code>`;
  });
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Paragraphs
  return out
    .split('\n')
    .map((l) => {
      const t = l.trim();
      if (!t) return '';
      if (/^<(pre|h[1-6])/.test(t)) return t;
      return `<p>${t}</p>`;
    })
    .join('');
}

function SidebarBubble({ msg, isStreaming }: { msg: SidebarMessage; isStreaming?: boolean }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`esb-msg ${isUser ? 'esb-msg-user' : 'esb-msg-assistant'}`}>
      {isUser ? (
        <span style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{msg.content}</span>
      ) : (
        <div
          className="esb-prose"
          dangerouslySetInnerHTML={{ __html: renderSidebarMd(msg.content) }}
        />
      )}
      {isStreaming && <span className="esb-cursor" aria-hidden="true" />}
    </div>
  );
}

export function EralSidebar({ mode, tool, prompt, studioContext }: EralSidebarProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SidebarMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [model, setModel] = useState<ModelVariant>('eral-7c');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: SidebarMessage = {
      id: `sm-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setStreamingContent('');

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch('/api/eral/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abort.signal,
        body: JSON.stringify({
          message: text.trim(),
          modelVariant: model,
          context: { mode, tool, prompt, studioContext },
          stream: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              fullContent += parsed.token;
              setStreamingContent(fullContent);
            }
          } catch {}
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `sm-${Date.now()}`,
          role: 'assistant',
          content: fullContent,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        {
          id: `sm-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${(err as Error).message ?? 'Something went wrong.'}`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setStreamingContent('');
      abortRef.current = null;
    }
  }, [loading, model, mode, tool, prompt, studioContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const streamingMsg: SidebarMessage | null = streamingContent
    ? { id: 'esb-streaming', role: 'assistant', content: streamingContent, createdAt: Date.now() }
    : null;

  const displayedMessages = messages.slice(-10);

  return (
    <>
      {/* ── Collapsed pill button ─────────────────────────────────── */}
      {!open && (
        <button
          className="esb-toggle-btn"
          onClick={() => setOpen(true)}
          aria-label="Open Eral AI companion"
          title="Open Eral"
        >
          🧠 <span className="esb-toggle-label">Eral</span>
        </button>
      )}

      {/* ── Expanded drawer ───────────────────────────────────────── */}
      {open && (
        <div className="esb-drawer" role="complementary" aria-label="Eral AI companion">
          {/* Header */}
          <div className="esb-header">
            <div className="esb-header-left">
              <span className="esb-header-icon">🧠</span>
              <span className="esb-header-name">Eral</span>
              {mode && (
                <span className="esb-ctx-badge">{mode}</span>
              )}
            </div>
            <div className="esb-header-actions">
              <a href="/eral" className="esb-open-full" title="Open full Eral page">
                Open full ↗
              </a>
              <button
                className="esb-clear-btn"
                onClick={() => { setMessages([]); setStreamingContent(''); }}
                title="Clear chat"
              >
                Clear
              </button>
              <button
                className="esb-close-btn"
                onClick={() => setOpen(false)}
                aria-label="Close Eral"
              >
                ×
              </button>
            </div>
          </div>

          {/* Model mini-selector */}
          <div className="esb-model-bar">
            {MINI_MODEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`esb-model-pill ${model === opt.value ? 'esb-model-pill-active' : ''}`}
                onClick={() => setModel(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="esb-messages">
            {displayedMessages.length === 0 && !streamingMsg && (
              <div className="esb-empty">
                <p>Hi! I&apos;m Eral — your AI companion for WokGen.</p>
                {mode && (
                  <p style={{ marginTop: 6, fontSize: 11, color: 'var(--text-faint)' }}>
                    Context: {mode} Studio{tool ? ` · ${tool}` : ''}
                  </p>
                )}
              </div>
            )}
            {displayedMessages.map((msg) => (
              <SidebarBubble key={msg.id} msg={msg} />
            ))}
            {streamingMsg && <SidebarBubble msg={streamingMsg} isStreaming />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="esb-input-wrap">
            <textarea
              ref={inputRef}
              className="esb-textarea"
              placeholder="Ask Eral…"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <div className="esb-input-actions">
              {loading ? (
                <button
                  className="esb-stop-btn"
                  onClick={() => abortRef.current?.abort()}
                >
                  ■ Stop
                </button>
              ) : (
                <button
                  className="esb-send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                >
                  ↑
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ── Toggle button ─────────────────────────────────────────── */
        .esb-toggle-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #1c1c2e;
          border: 1px solid rgba(129,140,248,0.35);
          border-radius: 20px;
          color: #818cf8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(129,140,248,0.1);
          transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
        }
        .esb-toggle-btn:hover {
          background: #22223a;
          border-color: rgba(129,140,248,0.6);
          box-shadow: 0 4px 24px rgba(0,0,0,0.6), 0 0 20px rgba(129,140,248,0.2);
        }
        .esb-toggle-label { font-family: var(--font-heading, 'Space Grotesk', sans-serif); }

        /* ── Drawer ────────────────────────────────────────────────── */
        .esb-drawer {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 100;
          width: 360px;
          max-height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
          background: #111118;
          border: 1px solid rgba(129,140,248,0.2);
          border-radius: 10px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(129,140,248,0.08);
          overflow: hidden;
          animation: esb-slide-in 0.2s ease;
        }
        @keyframes esb-slide-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 480px) {
          .esb-drawer {
            bottom: 0; right: 0;
            width: 100%;
            border-radius: 10px 10px 0 0;
            max-height: 70vh;
          }
          .esb-toggle-btn { bottom: 16px; right: 16px; }
        }

        /* Header */
        .esb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(129,140,248,0.05);
          flex-shrink: 0;
        }
        .esb-header-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .esb-header-icon { font-size: 16px; }
        .esb-header-name {
          font-family: var(--font-heading, 'Space Grotesk', sans-serif);
          font-size: 14px;
          font-weight: 600;
          color: #818cf8;
        }
        .esb-ctx-badge {
          font-size: 10px;
          padding: 1px 6px;
          background: rgba(129,140,248,0.12);
          border: 1px solid rgba(129,140,248,0.2);
          border-radius: 10px;
          color: #818cf8;
          text-transform: capitalize;
        }
        .esb-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .esb-open-full {
          font-size: 11px;
          color: #818cf8;
          text-decoration: none;
          padding: 2px 6px;
          border-radius: 3px;
          transition: background 0.1s;
        }
        .esb-open-full:hover { background: rgba(129,140,248,0.1); }
        .esb-clear-btn {
          font-size: 11px;
          color: var(--text-faint, #464646);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 3px;
          transition: color 0.1s, background 0.1s;
        }
        .esb-clear-btn:hover { color: var(--text-muted, #888); background: rgba(255,255,255,0.04); }
        .esb-close-btn {
          font-size: 18px;
          line-height: 1;
          color: var(--text-faint, #464646);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 3px;
          transition: color 0.1s;
        }
        .esb-close-btn:hover { color: var(--text, #ebebeb); }

        /* Model bar */
        .esb-model-bar {
          display: flex;
          gap: 6px;
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          flex-shrink: 0;
        }
        .esb-model-pill {
          padding: 3px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: var(--text-muted, #888);
          font-size: 11px;
          cursor: pointer;
          transition: background 0.1s, border-color 0.1s, color 0.1s;
        }
        .esb-model-pill:hover { background: rgba(129,140,248,0.08); border-color: rgba(129,140,248,0.2); color: #818cf8; }
        .esb-model-pill-active {
          background: rgba(129,140,248,0.12) !important;
          border-color: rgba(129,140,248,0.3) !important;
          color: #818cf8 !important;
        }

        /* Messages */
        .esb-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 0;
        }
        .esb-empty {
          font-size: 12px;
          color: var(--text-muted, #888);
          text-align: center;
          padding: 20px 0;
        }
        .esb-empty p { margin: 0; }

        .esb-msg {
          max-width: 90%;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 12.5px;
          line-height: 1.55;
          word-break: break-word;
        }
        .esb-msg-user {
          align-self: flex-end;
          background: rgba(129,140,248,0.12);
          border: 1px solid rgba(129,140,248,0.18);
          color: var(--text, #ebebeb);
          border-radius: 6px 2px 6px 6px;
        }
        .esb-msg-assistant {
          align-self: flex-start;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: var(--text, #ebebeb);
          border-radius: 2px 6px 6px 6px;
        }

        .esb-cursor {
          display: inline-block;
          width: 2px; height: 12px;
          background: #818cf8;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: esb-blink 0.8s step-end infinite;
        }
        @keyframes esb-blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }

        /* Prose */
        .esb-prose p { margin: 0 0 4px; }
        .esb-prose p:last-child { margin-bottom: 0; }
        .esb-prose strong { font-weight: 600; }
        pre.esb-code {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px;
          padding: 8px 10px;
          overflow-x: auto;
          font-size: 11px;
          margin: 4px 0;
        }
        pre.esb-code code { color: #c9d1d9; font-family: monospace; }
        code.esb-inline-code {
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
          padding: 1px 4px;
          font-size: 11px;
          font-family: monospace;
          color: #c9d1d9;
        }

        /* Input */
        .esb-input-wrap {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 8px 10px;
          display: flex;
          gap: 8px;
          align-items: flex-end;
          flex-shrink: 0;
          background: rgba(0,0,0,0.2);
        }
        .esb-textarea {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 5px;
          color: var(--text, #ebebeb);
          font-size: 12.5px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          resize: none;
          padding: 7px 9px;
          line-height: 1.45;
          outline: none;
          transition: border-color 0.15s;
        }
        .esb-textarea:focus { border-color: rgba(129,140,248,0.35); }
        .esb-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .esb-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

        .esb-input-actions { display: flex; flex-direction: column; justify-content: flex-end; }
        .esb-send-btn {
          width: 28px; height: 28px;
          border-radius: 5px;
          border: none;
          background: #818cf8;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, opacity 0.15s;
        }
        .esb-send-btn:hover:not(:disabled) { background: #6366f1; }
        .esb-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .esb-stop-btn {
          padding: 5px 10px;
          border-radius: 5px;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .esb-stop-btn:hover { background: rgba(239,68,68,0.2); }
      `}</style>
    </>
  );
}
