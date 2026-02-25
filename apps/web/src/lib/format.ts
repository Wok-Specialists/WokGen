// ---------------------------------------------------------------------------
// WokGen — formatting utilities
// ---------------------------------------------------------------------------

import { formatDistanceToNow, format } from 'date-fns';

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-US').format(n);

export const formatCompact = (n: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

export const relativeTime = (date: Date | string): string =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDate = (date: Date | string): string =>
  format(new Date(date), 'MMM d, yyyy');
