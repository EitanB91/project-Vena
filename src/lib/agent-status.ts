// =============================================================================
// Agent Status — Shared status logic for agent cards and detail pages
// =============================================================================

/** Minutes threshold: memory modified within this window = "Active" */
export const ACTIVE_THRESHOLD_MINUTES = 30;

/** Minutes threshold: memory modified within this window = "Recent" */
export const RECENT_THRESHOLD_MINUTES = 1440; // 24 hours

export type AgentStatus = {
  label: string;
  color: string;
  dotClass: string;
};

/**
 * Determine agent status from their memory file's last-modified timestamp.
 */
export function getAgentStatus(lastModified: Date | undefined): AgentStatus {
  if (!lastModified) {
    return { label: 'No data', color: 'text-vena-text-muted', dotClass: 'bg-vena-text-muted' };
  }

  const diffMinutes = (Date.now() - lastModified.getTime()) / 60_000;

  if (diffMinutes < ACTIVE_THRESHOLD_MINUTES) {
    return { label: 'Active', color: 'text-vena-success', dotClass: 'bg-vena-success' };
  }
  if (diffMinutes < RECENT_THRESHOLD_MINUTES) {
    return { label: 'Recent', color: 'text-vena-warning', dotClass: 'bg-vena-warning' };
  }
  return { label: 'Idle', color: 'text-vena-text-muted', dotClass: 'bg-vena-text-muted' };
}

/**
 * Format a last-modified timestamp as a relative time string.
 */
export function formatLastSeen(lastModified: Date | undefined): string {
  if (!lastModified) return 'Never';

  const diffMs = Date.now() - lastModified.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
