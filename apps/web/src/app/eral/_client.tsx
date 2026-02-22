'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ModelVariant = 'eral-7c' | 'eral-mini' | 'eral-code' | 'eral-creative';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  durationMs?: number;
  createdAt: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODEL_OPTIONS: { value: ModelVariant; label: string; desc: string }[] = [
  { value: 'eral-7c',       label: 'Eral 7c',       desc: 'Best overall · 70B · all 7 capabilities' },
  { value: 'eral-mini',     label: 'Eral Mini',     desc: 'Fast · 8B · quick answers & chat' },
  { value: 'eral-code',     label: 'Eral Code',     desc: 'DeepSeek · code, debugging, scaffolding' },
  { value: 'eral-creative', label: 'Eral Creative', desc: 'Mixtral · copywriting, creative writing' },
];

const SUGGESTED_PROMPTS: { icon: string; text: string }[] = [
  { icon: '🔥', text: 'Write a pixel art prompt for a fire mage character' },
  { icon: '💳', text: 'Generate a pricing page component for a SaaS app' },
  { icon: '✦',  text: "What's the best way to create a cohesive icon set?" },
  { icon: '📝', text: 'Write a product description for a minimal SaaS tool' },
  { icon: '🎮', text: 'How do I export game assets for Unity?' },
  { icon: '🔍', text: 'Critique my logo prompt: [paste your prompt]' },
  { icon: '😄', text: 'Generate a Discord emoji pack theme for a gaming community' },
  { icon: '🚀', text: 'Help me write a hero section headline for a startup' },
];

const LS_KEY = 'eral_conversations';

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(convs));
  } catch {}
}

function newConversation(): Conversation {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: 'New conversation',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Markdown renderer (lightweight, no deps)
// ---------------------------------------------------------------------------

function renderMarkdown(text: string): string {
  // Code blocks
  let out = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="eral-code-block" data-lang="${lang || 'text'}"><code>${escaped.trimEnd()}</code></pre>`;
  });

  // Inline code
  out = out.replace(/`([^`\n]+)`/g, (_m, c) => {
    const escaped = c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<code class="eral-inline-code">${escaped}</code>`;
  });

  // Bold
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Headers
  out = out.replace(/^### (.+)$/gm, '<h3 class="eral-h3">$1</h3>');
  out = out.replace(/^## (.+)$/gm, '<h2 class="eral-h2">$1</h2>');
  out = out.replace(/^# (.+)$/gm, '<h1 class="eral-h1">$1</h1>');

  // Unordered lists
  out = out.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  out = out.replace(/(<li>[\s\S]*?<\/li>)(\n(?=<li>)|(?!\n))/g, '$1');
  out = out.replace(/(<li>.*<\/li>)/gs, '<ul class="eral-ul">$1</ul>');

  // Numbered lists
  out = out.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs — wrap lines not already in block tags
  const lines = out.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('');
      continue;
    }
    const isBlock = /^<(h[1-6]|pre|ul|ol|li|blockquote|div)/.test(trimmed);
    result.push(isBlock ? trimmed : `<p>${trimmed}</p>`);
  }
  return result.join('\n');
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

function MessageBubble({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`eral-msg-row ${isUser ? 'eral-msg-user' : 'eral-msg-assistant'}`}>
      {!isUser && (
        <div className="eral-avatar">
          <span style={{ fontSize: 14 }}>🧠</span>
        </div>
      )}
      <div className="eral-bubble-wrap">
        <div className={`eral-bubble ${isUser ? 'eral-bubble-user' : 'eral-bubble-assistant'}`}>
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          ) : (
            <div
              className="eral-prose"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          )}
          {isStreaming && (
            <span className="eral-cursor" aria-hidden="true" />
          )}
        </div>
        {!isUser && !isStreaming && (
          <div className="eral-bubble-meta">
            {msg.modelUsed && (
              <span className="eral-model-tag">{msg.modelUsed.split('/').pop()}</span>
            )}
            {msg.durationMs != null && (
              <span className="eral-time-tag">{(msg.durationMs / 1000).toFixed(1)}s</span>
            )}
            <button className="eral-copy-btn" onClick={handleCopy} title="Copy message">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="eral-avatar eral-avatar-user">
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>You</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar conversation item
// ---------------------------------------------------------------------------

function ConvItem({
  conv,
  active,
  onSelect,
  onDelete,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`eral-conv-item ${active ? 'eral-conv-item-active' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <span className="eral-conv-title">{conv.title}</span>
      <button
        className="eral-conv-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Delete conversation"
        aria-label="Delete conversation"
      >
        ×
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Eral page client component
// ---------------------------------------------------------------------------

export function EralPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [model, setModel] = useState<ModelVariant>('eral-7c');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadConversations();
    if (saved.length > 0) {
      setConversations(saved);
      setActiveId(saved[0].id);
    } else {
      const conv = newConversation();
      setConversations([conv]);
      setActiveId(conv.id);
    }
  }, []);

  // Persist to localStorage whenever conversations change
  useEffect(() => {
    if (conversations.length > 0) saveConversations(conversations);
  }, [conversations]);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, streamingContent, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
  }, [input]);

  // ── Conversation management ────────────────────────────────────────────────

  const createNewConv = useCallback(() => {
    const conv = newConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setInput('');
    setStreamingContent('');
    inputRef.current?.focus();
  }, []);

  const deleteConv = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh = newConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  const updateConv = useCallback((id: string, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => c.id === id ? updater(c) : c));
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading || !activeId) return;

    const currentConvId = activeId;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      createdAt: Date.now(),
    };

    updateConv(currentConvId, (c) => ({
      ...c,
      messages: [...c.messages, userMsg],
      title: c.messages.length === 0 ? text.trim().slice(0, 60) : c.title,
      updatedAt: Date.now(),
    }));

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
          conversationId: undefined, // use local-only for now
          modelVariant: model,
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
      const start = Date.now();

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

      const durationMs = Date.now() - start;
      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        modelUsed: model,
        durationMs,
        createdAt: Date.now(),
      };

      updateConv(currentConvId, (c) => ({
        ...c,
        messages: [...c.messages, assistantMsg],
        updatedAt: Date.now(),
      }));
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      const errMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${(err as Error).message ?? 'Something went wrong. Please try again.'}`,
        createdAt: Date.now(),
      };
      updateConv(currentConvId, (c) => ({
        ...c,
        messages: [...c.messages, errMsg],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
      setStreamingContent('');
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [loading, activeId, model, updateConv]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const activeModel = MODEL_OPTIONS.find((m) => m.value === model)!;
  const isEmpty = !activeConv || activeConv.messages.length === 0;

  // ── Streaming assembly for display ────────────────────────────────────────

  const streamingMsg: Message | null = streamingContent
    ? { id: 'streaming', role: 'assistant', content: streamingContent, createdAt: Date.now() }
    : null;

  return (
    <div className="eral-root">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`eral-sidebar ${sidebarOpen ? 'eral-sidebar-open' : 'eral-sidebar-closed'}`}>
        <div className="eral-sidebar-header">
          <div className="eral-brand">
            <span className="eral-brand-name">Eral</span>
            <span className="eral-brand-by">by WokSpec</span>
          </div>
          <button
            className="eral-sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <button className="eral-new-chat-btn" onClick={createNewConv}>
              <span>+</span> New chat
            </button>

            <div className="eral-conv-list">
              {conversations.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeId}
                  onSelect={() => { setActiveId(conv.id); setStreamingContent(''); }}
                  onDelete={() => deleteConv(conv.id)}
                />
              ))}
            </div>

            <div className="eral-sidebar-footer">
              <a
                href="https://wokgen.wokspec.org"
                target="_blank"
                rel="noopener noreferrer"
                className="eral-footer-link"
              >
                wokgen.wokspec.org ↗
              </a>
            </div>
          </>
        )}
      </aside>

      {/* ── Main area ──────────────────────────────────────────────── */}
      <div className="eral-main">
        {/* Top bar */}
        <div className="eral-topbar">
          {!sidebarOpen && (
            <button
              className="eral-sidebar-toggle-inline"
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              ☰
            </button>
          )}

          {/* Model selector */}
          <div className="eral-model-selector" style={{ position: 'relative' }}>
            <button
              className="eral-model-pill"
              onClick={() => setModelPickerOpen((v) => !v)}
            >
              <span className="eral-model-dot" />
              {activeModel.label}
              <span style={{ opacity: 0.5, fontSize: 10 }}>▾</span>
            </button>

            {modelPickerOpen && (
              <div className="eral-model-dropdown">
                {MODEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`eral-model-option ${model === opt.value ? 'eral-model-option-active' : ''}`}
                    onClick={() => { setModel(opt.value); setModelPickerOpen(false); }}
                  >
                    <span className="eral-model-option-label">{opt.label}</span>
                    <span className="eral-model-option-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Share (future) */}
          <button className="eral-share-btn" disabled title="Share (coming soon)">
            Share
          </button>
        </div>

        {/* Messages */}
        <div className="eral-messages">
          {isEmpty ? (
            <div className="eral-empty">
              <div className="eral-empty-logo">
                <span className="eral-empty-icon">🧠</span>
                <h1 className="eral-empty-title">Eral 7c</h1>
                <p className="eral-empty-sub">AI companion for creative work · by WokSpec</p>
              </div>

              <div className="eral-suggestions">
                {SUGGESTED_PROMPTS.map((s) => (
                  <button
                    key={s.text}
                    className="eral-suggestion"
                    onClick={() => sendMessage(s.text)}
                  >
                    <span className="eral-suggestion-icon">{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeConv.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {streamingMsg && (
                <MessageBubble msg={streamingMsg} isStreaming />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="eral-input-area">
          <div className="eral-input-box">
            <textarea
              ref={inputRef}
              className="eral-textarea"
              placeholder="Ask Eral anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            {loading ? (
              <button className="eral-send-btn eral-stop-btn" onClick={handleStop} title="Stop">
                ■ Stop
              </button>
            ) : (
              <button
                className="eral-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                title="Send (Enter)"
              >
                ↑
              </button>
            )}
          </div>
          <p className="eral-input-hint">
            Enter to send · Shift+Enter for newline · Eral can make mistakes — verify important info
          </p>
        </div>
      </div>

      {/* ── Styles ─────────────────────────────────────────────────── */}
      <style>{`
        /* Layout */
        .eral-root {
          display: flex;
          height: calc(100vh - var(--nav-height, 56px) - var(--mode-switcher-height, 41px));
          background: var(--bg);
          color: var(--text);
          overflow: hidden;
          position: relative;
        }

        /* Sidebar */
        .eral-sidebar {
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          transition: width 0.2s ease;
          overflow: hidden;
          flex-shrink: 0;
        }
        .eral-sidebar-open  { width: 220px; }
        .eral-sidebar-closed { width: 44px; }

        .eral-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 10px;
          border-bottom: 1px solid var(--border);
          min-height: 48px;
        }
        .eral-brand {
          display: flex;
          align-items: baseline;
          gap: 5px;
          overflow: hidden;
        }
        .eral-brand-name {
          font-family: var(--font-heading, 'Space Grotesk', sans-serif);
          font-size: 15px;
          font-weight: 600;
          color: #818cf8;
          white-space: nowrap;
        }
        .eral-brand-by {
          font-size: 10px;
          color: var(--text-faint);
          white-space: nowrap;
        }
        .eral-sidebar-toggle {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px 6px;
          font-size: 13px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .eral-sidebar-toggle:hover { color: var(--text); background: rgba(255,255,255,0.05); }

        .eral-new-chat-btn {
          margin: 10px 10px 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          background: rgba(129,140,248,0.12);
          border: 1px solid rgba(129,140,248,0.25);
          border-radius: 4px;
          color: #818cf8;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .eral-new-chat-btn:hover {
          background: rgba(129,140,248,0.2);
          border-color: rgba(129,140,248,0.4);
        }

        .eral-conv-list {
          flex: 1;
          overflow-y: auto;
          padding: 4px 6px;
        }
        .eral-conv-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          gap: 6px;
          transition: background 0.1s;
        }
        .eral-conv-item:hover { background: rgba(255,255,255,0.04); }
        .eral-conv-item-active { background: rgba(129,140,248,0.1) !important; }
        .eral-conv-title {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        .eral-conv-item-active .eral-conv-title { color: var(--text); }
        .eral-conv-delete {
          background: none;
          border: none;
          color: var(--text-faint);
          cursor: pointer;
          font-size: 14px;
          padding: 0 2px;
          opacity: 0;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }
        .eral-conv-item:hover .eral-conv-delete { opacity: 1; }
        .eral-conv-delete:hover { color: var(--danger); }

        .eral-sidebar-footer {
          padding: 10px 10px 12px;
          border-top: 1px solid var(--border);
        }
        .eral-footer-link {
          font-size: 11px;
          color: var(--text-faint);
          text-decoration: none;
        }
        .eral-footer-link:hover { color: var(--text-muted); }

        /* Main */
        .eral-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        /* Top bar */
        .eral-topbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          min-height: 48px;
          flex-shrink: 0;
        }
        .eral-sidebar-toggle-inline {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 16px;
          padding: 4px 6px;
          border-radius: 3px;
        }
        .eral-sidebar-toggle-inline:hover { color: var(--text); }

        .eral-model-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(129,140,248,0.08);
          border: 1px solid rgba(129,140,248,0.2);
          border-radius: 20px;
          color: #818cf8;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .eral-model-pill:hover { background: rgba(129,140,248,0.15); }
        .eral-model-dot {
          width: 6px; height: 6px;
          background: #818cf8;
          border-radius: 50%;
        }

        .eral-model-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 6px;
          width: 280px;
          z-index: 50;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }
        .eral-model-option {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text);
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
        }
        .eral-model-option:last-child { border-bottom: none; }
        .eral-model-option:hover { background: rgba(255,255,255,0.04); }
        .eral-model-option-active { background: rgba(129,140,248,0.08) !important; }
        .eral-model-option-label { font-size: 13px; font-weight: 500; color: #818cf8; }
        .eral-model-option-desc  { font-size: 11px; color: var(--text-muted); }

        .eral-share-btn {
          padding: 4px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-muted);
          font-size: 12px;
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* Messages area */
        .eral-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Empty state */
        .eral-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 40px 16px;
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
        }
        .eral-empty-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        .eral-empty-icon { font-size: 40px; }
        .eral-empty-title {
          font-family: var(--font-heading, 'Space Grotesk', sans-serif);
          font-size: 28px;
          font-weight: 600;
          color: #818cf8;
          margin: 0;
        }
        .eral-empty-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .eral-suggestions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          width: 100%;
        }
        @media (max-width: 540px) {
          .eral-suggestions { grid-template-columns: 1fr; }
        }
        .eral-suggestion {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          line-height: 1.4;
        }
        .eral-suggestion:hover {
          border-color: rgba(129,140,248,0.3);
          background: rgba(129,140,248,0.06);
          color: var(--text);
        }
        .eral-suggestion-icon { font-size: 14px; flex-shrink: 0; }

        /* Message rows */
        .eral-msg-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 20px;
          max-width: 780px;
          width: 100%;
        }
        .eral-msg-assistant { align-self: flex-start; }
        .eral-msg-user {
          align-self: flex-end;
          flex-direction: row-reverse;
          margin-left: auto;
        }
        .eral-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(129,140,248,0.15);
          border: 1px solid rgba(129,140,248,0.2);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .eral-avatar-user {
          background: rgba(255,255,255,0.05);
          border-color: var(--border);
        }

        .eral-bubble-wrap { display: flex; flex-direction: column; gap: 4px; min-width: 0; max-width: 100%; }

        .eral-bubble {
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.65;
          word-break: break-word;
        }
        .eral-bubble-user {
          background: rgba(129,140,248,0.12);
          border: 1px solid rgba(129,140,248,0.2);
          color: var(--text);
          border-radius: 8px 2px 8px 8px;
        }
        .eral-bubble-assistant {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: var(--text);
          border-radius: 2px 8px 8px 8px;
        }

        /* Streaming cursor */
        .eral-cursor {
          display: inline-block;
          width: 2px;
          height: 14px;
          background: #818cf8;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: eral-blink 0.8s step-end infinite;
        }
        @keyframes eral-blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }

        /* Bubble meta */
        .eral-bubble-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 2px 2px;
        }
        .eral-model-tag, .eral-time-tag {
          font-size: 10px;
          color: var(--text-faint);
          background: rgba(255,255,255,0.04);
          border-radius: 3px;
          padding: 1px 5px;
        }
        .eral-copy-btn {
          font-size: 10px;
          color: var(--text-faint);
          background: none;
          border: none;
          cursor: pointer;
          padding: 1px 5px;
          border-radius: 3px;
          transition: color 0.1s, background 0.1s;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .eral-bubble-wrap:hover .eral-copy-btn { opacity: 1; }
        .eral-copy-btn:hover { color: var(--text); background: rgba(255,255,255,0.06); }

        /* Markdown prose */
        .eral-prose p        { margin: 0 0 8px; }
        .eral-prose p:last-child { margin-bottom: 0; }
        .eral-prose h1.eral-h1 { font-size: 18px; font-weight: 600; margin: 14px 0 6px; color: #818cf8; }
        .eral-prose h2.eral-h2 { font-size: 15px; font-weight: 600; margin: 12px 0 4px; }
        .eral-prose h3.eral-h3 { font-size: 13px; font-weight: 600; margin: 10px 0 4px; color: var(--text-muted); }
        .eral-prose ul.eral-ul { margin: 6px 0 6px 16px; padding: 0; }
        .eral-prose li  { margin: 2px 0; list-style: disc; }
        .eral-prose strong { color: var(--text); font-weight: 600; }
        .eral-prose em { color: var(--text-muted); font-style: italic; }

        pre.eral-code-block {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 12px 14px;
          overflow-x: auto;
          font-size: 12.5px;
          line-height: 1.55;
          margin: 8px 0;
          position: relative;
        }
        pre.eral-code-block::before {
          content: attr(data-lang);
          position: absolute;
          top: 6px; right: 10px;
          font-size: 10px;
          color: var(--text-faint);
          font-family: monospace;
        }
        pre.eral-code-block code { color: #c9d1d9; font-family: 'JetBrains Mono', 'Fira Code', monospace; }
        code.eral-inline-code {
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
          padding: 1px 5px;
          font-size: 12px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #c9d1d9;
        }

        /* Input area */
        .eral-input-area {
          padding: 12px 16px 16px;
          border-top: 1px solid var(--border);
          background: var(--bg);
          flex-shrink: 0;
        }
        .eral-input-box {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 10px 10px 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .eral-input-box:focus-within {
          border-color: rgba(129,140,248,0.4);
          box-shadow: 0 0 0 3px rgba(129,140,248,0.08);
        }
        .eral-textarea {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          resize: none;
          line-height: 1.55;
          min-height: 22px;
          max-height: 200px;
        }
        .eral-textarea::placeholder { color: var(--text-faint); }
        .eral-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

        .eral-send-btn {
          flex-shrink: 0;
          width: 32px; height: 32px;
          border-radius: 6px;
          border: none;
          background: #818cf8;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, opacity 0.15s;
        }
        .eral-send-btn:hover:not(:disabled) { background: #6366f1; }
        .eral-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .eral-stop-btn {
          width: auto;
          padding: 0 10px;
          font-size: 12px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
        }
        .eral-stop-btn:hover { background: rgba(239,68,68,0.25) !important; }

        .eral-input-hint {
          margin: 6px 0 0;
          font-size: 10px;
          color: var(--text-faint);
          text-align: center;
        }

        /* Mobile */
        @media (max-width: 640px) {
          .eral-sidebar-open { width: 100%; position: absolute; top: 0; left: 0; bottom: 0; z-index: 40; }
          .eral-msg-row { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
