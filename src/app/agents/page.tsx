import path from 'node:path';
import { readAllAgents, ACTIVE_THRESHOLD_MINUTES } from '@/lib';
import { AgentCard } from '@/components/AgentCard';

export const dynamic = 'force-dynamic';

export default function AgentsPage() {
  const claudeDir = path.join(process.cwd(), '.claude');
  const profiles = readAllAgents(claudeDir);

  const activeCount = profiles.filter((p) => {
    if (!p.memory?.lastModified) return false;
    return Date.now() - p.memory.lastModified.getTime() < ACTIVE_THRESHOLD_MINUTES * 60_000;
  }).length;

  return (
    <div className="flex flex-1 flex-col p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Agents
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Team members, identities, and memory snapshots.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-vena-text">
            {profiles.length}
          </span>
          <span className="text-sm text-vena-text-secondary">
            Total Agents
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-vena-success" />
          <span className="text-2xl font-bold text-vena-text">
            {activeCount}
          </span>
          <span className="text-sm text-vena-text-secondary">Active</span>
        </div>
      </div>

      {/* Agent Grid */}
      {profiles.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-vena-border bg-vena-surface">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-vena-surface-raised">
              <svg
                className="h-5 w-5 text-vena-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm text-vena-text-muted">
              No agents found. Place identity files in .claude/ subdirectories.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <AgentCard key={profile.identity.name} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
