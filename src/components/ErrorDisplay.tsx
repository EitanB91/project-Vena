/**
 * Shared error display for error boundaries.
 * Used by all route-level error.tsx files.
 */
export function ErrorDisplay({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vena-error/10">
          <svg
            className="h-6 w-6 text-vena-error"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-vena-text">{title}</h2>
        {message && (
          <p className="text-sm text-vena-text-secondary">{message}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md border border-vena-border bg-vena-surface-raised px-4 py-2 text-sm text-vena-text-secondary transition-colors hover:border-vena-accent hover:text-vena-text"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
