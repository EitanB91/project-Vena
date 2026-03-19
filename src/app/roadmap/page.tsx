export default function RoadmapPage() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Roadmap
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Phase tracker, plans, and milestone progress.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-vena-border bg-vena-surface">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-vena-surface-raised">
            <svg className="h-5 w-5 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
          </div>
          <p className="text-sm text-vena-text-muted">
            Roadmap viewer — coming in Phase 4
          </p>
        </div>
      </div>
    </div>
  );
}
