// =============================================================================
// Agent Status — Shared status logic for agent cards and detail pages
// =============================================================================

import type { AgentProfile } from '@/types';

/** Minutes threshold: memory modified within this window = "Active" */
export const ACTIVE_THRESHOLD_MINUTES = 30;

/** Minutes threshold: memory modified within this window = "Recent" */
export const RECENT_THRESHOLD_MINUTES = 1440; // 24 hours

export type AgentStatus = {
  label: string;
  color: string;
  dotClass: string;
};

/** Agent names that map to the Orchestrator */
const ORCHESTRATOR_NAMES = new Set(['orchestrator', 'claude', 'the orchestrator']);

/**
 * Determine agent status from their memory file's last-modified timestamp.
 * Pass `now` to avoid impure Date.now() calls during render.
 */
export function getAgentStatus(lastModified: Date | undefined, now?: number): AgentStatus {
  if (!lastModified) {
    return { label: 'No data', color: 'text-vena-text-muted', dotClass: 'bg-vena-text-muted' };
  }

  const diffMinutes = ((now ?? Date.now()) - lastModified.getTime()) / 60_000;

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
 * Pass `now` to avoid impure Date.now() calls during render.
 */
export function formatLastSeen(lastModified: Date | undefined, now?: number): string {
  if (!lastModified) return 'Never';

  const diffMs = (now ?? Date.now()) - lastModified.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// -----------------------------------------------------------------------------
// Telemetry-Enhanced Status
// -----------------------------------------------------------------------------

interface TelemetryActivity {
  activeSessionCount: number;
  mostRecentSessionEnd: Date | null;
}

/**
 * Enhance agent profiles with telemetry session activity.
 * - Orchestrator: Active if any telemetry session is currently active.
 *   LastSeen derived from most recent session (not memory file).
 * - Other agents: keep existing memory-based status (no per-agent telemetry signal).
 */
export function enhanceAgentProfiles(
  profiles: AgentProfile[],
  activity: TelemetryActivity,
): AgentProfile[] {
  const now = Date.now();

  return profiles.map((profile) => {
    const nameLower = profile.identity.name.toLowerCase();

    if (!ORCHESTRATOR_NAMES.has(nameLower)) return profile;

    // Orchestrator: use telemetry session as primary signal
    if (activity.activeSessionCount > 0) {
      return {
        ...profile,
        status: { label: 'Active', color: 'text-vena-success', dotClass: 'bg-vena-success' },
        lastSeen: 'Just now',
      };
    }

    // No active session — derive from most recent session end time
    if (activity.mostRecentSessionEnd) {
      return {
        ...profile,
        status: getAgentStatus(activity.mostRecentSessionEnd, now),
        lastSeen: formatLastSeen(activity.mostRecentSessionEnd, now),
      };
    }

    return profile;
  });
}
