"use client";

import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Dashboard error"
      message={error.message}
      onRetry={reset}
    />
  );
}
