"use client";

import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function BudgetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Budget error"
      message={error.message}
      onRetry={reset}
    />
  );
}
