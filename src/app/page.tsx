export default function Home() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vena-text">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-vena-text-secondary">
          Project overview and status at a glance.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatusCard label="Phase" value="1" sub="Shell & Navigation" />
        <StatusCard label="Agents" value="4" sub="Orchestrator, Nova, Viktor, Silas" />
        <StatusCard label="API Budget" value="$4.87" sub="Normal" color="text-vena-success" />
        <StatusCard label="Sessions" value="—" sub="Tracking starts Phase 2" />
      </div>

      {/* Placeholder content area */}
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-vena-border bg-vena-surface">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-vena-success animate-pulse" />
            <span className="text-sm font-mono text-vena-text-muted">
              systems online
            </span>
          </div>
          <p className="text-xs text-vena-text-muted">
            Live data widgets will populate in later phases.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-vena-border bg-vena-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-vena-text-muted">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${color ?? "text-vena-text"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-vena-text-secondary">{sub}</p>
    </div>
  );
}
