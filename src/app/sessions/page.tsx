export default function SessionsPage() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Sessions
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Session history, timeline, and usage categories.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-vena-border bg-vena-surface">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-vena-surface-raised">
            <svg className="h-5 w-5 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-sm text-vena-text-muted">
            Session timeline — coming in Phase 4
          </p>
        </div>
      </div>
    </div>
  );
}
