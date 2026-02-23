'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// EralVoiceButton
//
// Floating mic button fixed to bottom-right of every page.
// Keyboard shortcut: Cmd+Shift+E / Ctrl+Shift+E
// ---------------------------------------------------------------------------

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

const PATH_MODE_MAP: Record<string, string> = {
  '/pixel':    'pixel',
  '/business': 'business',
  '/vector':   'vector',
  '/emoji':    'emoji',
  '/uiux':     'uiux',
};

function detectMode(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const path = window.location.pathname;
  for (const [prefix, mode] of Object.entries(PATH_MODE_MAP)) {
    if (path.startsWith(prefix)) return mode;
  }
  return undefined;
}

export function EralVoiceButton() {
  const [state, setState] = useState<VoiceState>('idle');
  const [errorText, setErrorText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Audio cleanup ──────────────────────────────────────────────────────────
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  // ── Show overlay with response text ───────────────────────────────────────
  const showResponse = useCallback((text: string) => {
    setResponseText(text);
    setShowOverlay(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => setShowOverlay(false), 8000);
  }, []);

  // ── Error handler ──────────────────────────────────────────────────────────
  const showError = useCallback((msg: string) => {
    setErrorText(msg);
    setState('error');
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setState('idle');
      setErrorText('');
    }, 3000);
  }, []);

  // ── Send transcript to /api/eral/speak ────────────────────────────────────
  const sendToEral = useCallback(async (transcript: string) => {
    setState('processing');
    const mode = detectMode();

    try {
      const res = await fetch('/api/eral/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          conversationId,
          context: mode ? { mode } : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        showError(data.error ?? 'Voice request failed');
        return;
      }

      // Capture headers before consuming body
      const respText = res.headers.get('X-Eral-Response-Text');
      const newConvId = res.headers.get('X-Eral-Conversation-Id');
      if (newConvId) setConversationId(newConvId);

      const displayText = respText ? decodeURIComponent(respText) : '';
      if (displayText) showResponse(displayText);

      const contentType = res.headers.get('Content-Type') ?? '';

      if (contentType.includes('audio/mpeg')) {
        // Play audio blob
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        setState('speaking');
        audio.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          setState('idle');
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          setState('idle');
        };
        await audio.play();
      } else {
        // Fallback: Web Speech API
        const data = await res.json() as { text?: string };
        const text = data.text ?? displayText;
        if (!text) { setState('idle'); return; }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.onend = () => setState('idle');
        utterance.onerror = () => setState('idle');
        setState('speaking');
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('[EralVoiceButton] sendToEral error:', err);
      showError('Something went wrong. Try again.');
    }
  }, [conversationId, showError, showResponse]);

  // ── Start speech recognition ───────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as Window & typeof globalThis & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ??
      (window as Window & typeof globalThis & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showError('Voice not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) sendToEral(transcript.trim());
      else setState('idle');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        setState('idle');
      } else {
        showError(`Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If still in listening state (no result), go back to idle
      setState((s) => s === 'listening' ? 'idle' : s);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState('listening');
  }, [sendToEral, showError]);

  // ── Click handler ──────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (state === 'idle') {
      startListening();
    } else if (state === 'listening') {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setState('idle');
    } else if (state === 'speaking') {
      stopAudio();
      window.speechSynthesis?.cancel();
      setState('idle');
    }
  }, [state, startListening, stopAudio]);

  // ── Keyboard shortcut: Cmd/Ctrl+Shift+E ───────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClick]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAudio();
      recognitionRef.current?.stop();
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [stopAudio]);

  // ── Derive button visuals ──────────────────────────────────────────────────
  const bgColor =
    state === 'listening'  ? '#dc2626' :
    state === 'speaking'   ? '#7c3aed' :
    state === 'processing' ? '#1e1b4b' :
    state === 'error'      ? '#b91c1c' :
    '#1a1a2e';

  const label =
    state === 'listening'  ? 'Listening…' :
    state === 'processing' ? 'Thinking…'  :
    state === 'speaking'   ? 'Speaking…'  :
    state === 'error'      ? (errorText.slice(0, 28) || 'Error') :
    null;

  const tooltip = state === 'idle' ? 'Talk to Eral (⌘⇧E)' : undefined;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 88,
        right: 24,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {/* Response overlay */}
      {showOverlay && responseText && (
        <div
          style={{
            background: 'rgba(17,17,34,0.95)',
            border: '1px solid rgba(129,140,248,0.3)',
            borderRadius: 12,
            padding: '8px 12px',
            color: '#c7d2fe',
            fontSize: 13,
            maxWidth: 260,
            lineHeight: 1.4,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            position: 'relative',
          }}
        >
          <button
            onClick={() => setShowOverlay(false)}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(199,210,254,0.5)',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>
          <span style={{ paddingRight: 16 }}>{responseText}</span>
        </div>
      )}

      {/* State label */}
      {label && (
        <div
          style={{
            background: 'rgba(17,17,34,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999,
            padding: '3px 10px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 11,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {label}
        </div>
      )}

      {/* Main button */}
      <div style={{ position: 'relative', pointerEvents: 'auto' }}>
        {/* Pulse rings when listening */}
        {state === 'listening' && (
          <>
            <span style={{
              position: 'absolute', inset: -8,
              borderRadius: '50%',
              border: '2px solid rgba(220,38,38,0.4)',
              animation: 'eral-pulse 1.5s ease-out infinite',
            }} />
            <span style={{
              position: 'absolute', inset: -16,
              borderRadius: '50%',
              border: '2px solid rgba(220,38,38,0.2)',
              animation: 'eral-pulse 1.5s ease-out 0.5s infinite',
            }} />
          </>
        )}

        <button
          onClick={handleClick}
          title={tooltip}
          aria-label={
            state === 'idle'       ? 'Talk to Eral' :
            state === 'listening'  ? 'Cancel listening' :
            state === 'speaking'   ? 'Stop speaking' :
            'Eral voice'
          }
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: bgColor,
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: state === 'processing' ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
            boxShadow: state === 'idle'
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 2px 20px rgba(129,140,248,0.3)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            if (state === 'idle') {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 20px rgba(129,140,248,0.4)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = state === 'idle'
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 2px 20px rgba(129,140,248,0.3)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {state === 'processing' ? (
            <Loader2 size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
          ) : state === 'speaking' ? (
            <SpeakingBars />
          ) : state === 'listening' ? (
            <MicOff size={20} color="white" />
          ) : (
            <Mic size={20} color="white" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes eral-pulse {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes eral-bar {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1.0); }
        }
      `}</style>
    </div>
  );
}

// ── Animated speaking bars ────────────────────────────────────────────────────

function SpeakingBars() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 20 }}>
      {[0, 0.2, 0.1].map((delay, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: 16,
            background: 'white',
            borderRadius: 2,
            transformOrigin: 'center',
            animation: `eral-bar 0.8s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
