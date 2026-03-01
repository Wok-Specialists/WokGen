'use client';
import { WarningIcon } from '@/app/_components/icons';
import type { StudioError } from '@/lib/studio-errors';

interface Props {
  error: StudioError | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function StudioErrorBanner({ error, onDismiss, onRetry }: Props) {
  if (!error) return null;

  return (
    <div className="studio-error-banner">
      <WarningIcon size={16} />
      <div className="studio-error-banner__body">
        <p className="studio-error-banner__msg">{error.message}</p>
        {error.hint && <p className="studio-error-banner__hint">{error.hint}</p>}
      </div>
      <div className="studio-error-banner__actions">
        {error.retryable && onRetry && (
          <button type="button" onClick={onRetry} className="studio-error-banner__retry">Retry</button>
        )}
        <button type="button" onClick={onDismiss} className="studio-error-banner__dismiss">×</button>
      </div>
    </div>
  );
}
