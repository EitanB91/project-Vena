import Link from 'next/link';
import type { AgentProfile } from '@/types';
import { slugify } from '@/lib';

// ---------------------------------------------------------------------------
// AgentCard
// ---------------------------------------------------------------------------

interface AgentCardProps {
  profile: AgentProfile;
}

export function AgentCard({ profile }: AgentCardProps) {
  const { identity, memory, colorToken, status, lastSeen } = profile;
  const slug = slugify(identity.name);

  return (
    <Link
      href={`/agents/${slug}`}
      className="group block rounded-lg border border-vena-border bg-vena-surface p-5 transition-colors hover:border-vena-text-muted hover:bg-vena-surface-raised"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 h-10 w-10 shrink-0 rounded-full"
          style={{ backgroundColor: `var(--${colorToken})` }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-vena-text group-hover:text-white">
            {identity.name}
          </h3>
          {identity.role && (
            <p className="text-sm text-vena-text-secondary">{identity.role}</p>
          )}
        </div>
      </div>

      {/* Key Phrases */}
      {identity.keyPhrases.length > 0 && (
        <div className="mt-3 space-y-1">
          {identity.keyPhrases.slice(0, 2).map((phrase, i) => (
            <p key={i} className="truncate text-xs italic text-vena-text-muted">
              &ldquo;{phrase}&rdquo;
            </p>
          ))}
        </div>
      )}

      {/* Projects */}
      {identity.projects.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {identity.projects.map((project) => (
            <span
              key={project.name}
              className="rounded-full bg-vena-surface-overlay px-2 py-0.5 text-xs text-vena-text-secondary"
            >
              {project.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Status + Last Seen */}
      <div className="mt-4 flex items-center justify-between border-t border-vena-border pt-3">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${status.dotClass}`} />
          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
        </div>
        <span className="text-xs text-vena-text-muted">
          {memory ? `Last seen ${lastSeen}` : 'No memory file'}
        </span>
      </div>
    </Link>
  );
}
