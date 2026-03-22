// =============================================================================
// Smart Formatting Utilities (F19)
// =============================================================================

/**
 * Format a token count for human display.
 * Examples: 0 → "0", 842 → "842", 48700 → "48.7K", 238027794 → "238M"
 */
export function formatTokens(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1_000) return String(Math.round(n));
  if (n < 1_000_000) {
    const k = n / 1_000;
    return k >= 100 ? `${Math.round(k)}K` : `${parseFloat(k.toFixed(1))}K`;
  }
  if (n < 1_000_000_000) {
    const m = n / 1_000_000;
    return m >= 100 ? `${Math.round(m)}M` : `${parseFloat(m.toFixed(1))}M`;
  }
  const b = n / 1_000_000_000;
  return b >= 100 ? `${Math.round(b)}B` : `${parseFloat(b.toFixed(1))}B`;
}

/**
 * Format a duration in minutes for human display.
 * Examples: 0.3 → "< 1m", 23 → "23m", 91 → "1h 31m", 1500 → "1d 1h"
 */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return '0m';
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${Math.round(minutes)}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Format a Date as a relative time string.
 * Examples: "just now", "30s ago", "5m ago", "2h ago", "3d ago"
 */
export function formatRelativeTime(date: Date, now?: number): string {
  const diffMs = (now ?? Date.now()) - date.getTime();
  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1_000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Format a Date or ISO string as DD-MM-YYYY.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!Number.isFinite(d.getTime())) return 'Invalid date';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format a Date or ISO string as DD-MM (for chart axis labels).
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!Number.isFinite(d.getTime())) return '--';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}`;
}
