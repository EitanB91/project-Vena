import path from 'node:path';
import { readAllAgents, getProjectSlug, getProjectTelemetry, enhanceAgentProfiles } from '@/lib';
import { AgentCard } from '@/components/AgentCard';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const projectPath = process.cwd();
  const claudeDir = path.join(projectPath, '.claude');
  const rawProfiles = readAllAgents(claudeDir);

  const slug = getProjectSlug(projectPath);
  const telemetry = await getProjectTelemetry(slug);
  const mostRecentSession = telemetry.sessions[0] ?? null;

  const profiles = enhanceAgentProfiles(rawProfiles, {
    activeSessionCount: telemetry.activeSessionCount,
    mostRecentSessionEnd: mostRecentSession?.endTime ?? null,
  });

  const activeCount = profiles.filter((p) => p.status.label === 'Active').length;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Agents
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Team members, identities, and memory snapshots.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 flex flex-wrap gap-4 md:gap-6">
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
        <EmptyState
          icon={<UsersEmptyIcon />}
          message="No agents found."
          hint="Place identity files in .claude/ subdirectories."
        />
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

function UsersEmptyIcon() {
  return (
    <svg className="h-5 w-5 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
