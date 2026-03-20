/**
 * Skeleton loading primitives for shimmer effects.
 * Composable building blocks — combine to match any page layout.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-vena-surface-raised ${className}`}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-vena-border bg-vena-surface p-4 ${className}`}>
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="mb-1 h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="mb-6 md:mb-8">
      <Skeleton className="mb-2 h-7 w-40" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-vena-border bg-vena-surface p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-48" />
        <div className="ml-auto">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
