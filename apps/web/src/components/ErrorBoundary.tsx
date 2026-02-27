'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  /** If provided, shown in the error UI */
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-[var(--bg)] rounded border border-white/10">
          <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm font-medium text-[var(--text)]/80 mb-1">
            {this.props.context ? `${this.props.context} encountered an error` : 'Something went wrong'}
          </p>
          <p className="text-xs text-[var(--text)]/40 mb-4 max-w-xs">
            An unexpected error occurred. Try refreshing this section.
          </p>
          {this.state.error?.message && (
            <details className="mb-4 max-w-sm text-left">
              <summary className="text-xs text-[var(--text)]/30 cursor-pointer select-none">Error details</summary>
              <p className="mt-1 text-xs text-[var(--text)]/25 font-mono break-all">{this.state.error.message}</p>
            </details>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-[var(--text)]/60 hover:text-[var(--text)]/80 hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
