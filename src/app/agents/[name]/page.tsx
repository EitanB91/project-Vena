import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readAllAgents, slugify, getAgentStatus } from '@/lib';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface AgentDetailProps {
  params: Promise<{ name: string }>;
}

export default async function AgentDetailPage({ params }: AgentDetailProps) {
  const { name } = await params;

  const claudeDir = path.join(process.cwd(), '.claude');
  const profiles = readAllAgents(claudeDir);

  const profile = profiles.find(
    (p) => slugify(p.identity.name) === name.toLowerCase(),
  );

  if (!profile) {
    notFound();
  }

  const { identity, memory, colorToken } = profile;
  const status = getAgentStatus(memory?.lastModified);

  const identitySections = Object.entries(identity.sections);
  const memorySections = memory ? Object.entries(memory.sections) : [];

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Back link */}
      <Link
        href="/agents"
        className="mb-6 inline-flex w-fit items-center gap-1 text-sm text-vena-text-secondary transition-colors hover:text-vena-text"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back to Agents
      </Link>

      {/* Agent Header */}
      <div className="mb-8 flex items-start gap-4">
        <div
          className="h-14 w-14 shrink-0 rounded-full"
          style={{ backgroundColor: `var(--${colorToken})` }}
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
            {identity.name}
          </h1>
          {identity.role && (
            <p className="mt-0.5 text-sm text-vena-text-secondary">
              {identity.role}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${status.dotClass}`}
            />
            <span className={`text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
            {memory?.lastModified && (
              <span className="ml-2 text-xs text-vena-text-muted">
                Memory updated{' '}
                {memory.lastModified.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      {identity.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-vena-text-muted">
            Active Projects
          </h2>
          <div className="flex flex-wrap gap-2">
            {identity.projects.map((project) => (
              <div
                key={project.name}
                className="rounded-lg border border-vena-border bg-vena-surface px-3 py-2"
              >
                <span className="text-sm font-medium text-vena-text">
                  {project.name}
                </span>
                <span className="ml-2 text-xs text-vena-text-secondary">
                  {project.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Phrases */}
      {identity.keyPhrases.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-vena-text-muted">
            Signature Lines
          </h2>
          <div className="space-y-1.5">
            {identity.keyPhrases.map((phrase, i) => (
              <p key={i} className="text-sm italic text-vena-text-secondary">
                &ldquo;{phrase}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Identity & Memory panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Identity Sections */}
        {identitySections.length > 0 && (
          <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
            <h2 className="mb-4 text-lg font-semibold text-vena-text">
              Identity
            </h2>
            <div className="space-y-4">
              {identitySections.map(([heading, content]) => (
                <div key={heading}>
                  <h3 className="mb-1 text-sm font-semibold text-vena-text-secondary">
                    {heading}
                  </h3>
                  <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-vena-text-muted">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memory Sections */}
        {memorySections.length > 0 ? (
          <div className="rounded-lg border border-vena-border bg-vena-surface p-5">
            <h2 className="mb-4 text-lg font-semibold text-vena-text">
              Memory
            </h2>
            <div className="space-y-4">
              {memorySections.map(([heading, content]) => (
                <div key={heading}>
                  <h3 className="mb-1 text-sm font-semibold text-vena-text-secondary">
                    {heading}
                  </h3>
                  <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-vena-text-muted">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-vena-border bg-vena-surface p-5">
            <p className="text-sm text-vena-text-muted">
              No memory file found for this agent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
