export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Chat
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          CLI passthrough — embedded terminal for Claude interaction.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-vena-border bg-vena-surface">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-vena-surface-raised">
            <svg className="h-5 w-5 text-vena-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <p className="text-sm text-vena-text-muted">
            xterm.js terminal — coming in Phase 5
          </p>
        </div>
      </div>
    </div>
  );
}
