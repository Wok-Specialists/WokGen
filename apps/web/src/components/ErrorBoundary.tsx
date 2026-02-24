'use client';
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <DefaultErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: undefined })} />
      );
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error, onReset }: { error?: Error; onReset?: () => void }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '2rem',
    }}>
      <div style={{
        background: 'var(--bg-surface, #111)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }} aria-hidden="true">⚠️</div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary, #f5f5f5)', margin: '0 0 0.5rem' }}>
          Something went wrong
        </h2>
        {error?.message && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #888)', margin: '0 0 1.5rem', fontFamily: 'monospace', wordBreak: 'break-word' }}>
            {error.message}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {onReset && (
            <button
              onClick={onReset}
              style={{
                padding: '0.5rem 1.25rem',
                background: 'var(--bg-elevated, #1a1a2e)',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                borderRadius: '6px',
                color: 'var(--text-primary, #f5f5f5)',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--accent, #7c3aed)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}
