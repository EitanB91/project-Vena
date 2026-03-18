export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-vena-text">
          Vena
        </h1>
        <p className="text-vena-text-secondary text-lg">
          Project Dashboard — Phase 0
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className="inline-block w-2 h-2 rounded-full bg-vena-success animate-pulse" />
          <span className="text-vena-text-muted text-sm font-mono">
            scaffold ready
          </span>
        </div>
      </div>
    </div>
  );
}
