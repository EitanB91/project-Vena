/**
 * Shared empty-state placeholder for pages with no data.
 * Renders a centered card with icon, message, and optional hint.
 */
export function EmptyState({
  icon,
  message,
  hint,
}: {
  icon: React.ReactNode;
  message: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-vena-border bg-vena-surface p-8">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-vena-surface-raised">
          {icon}
        </div>
        <p className="text-sm text-vena-text-muted">{message}</p>
        {hint && (
          <p className="text-xs text-vena-text-muted/70">{hint}</p>
        )}
      </div>
    </div>
  );
}
