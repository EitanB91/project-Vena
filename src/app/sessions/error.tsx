"use client";

import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function SessionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Sessions error"
      message={error.message}
      onRetry={reset}
    />
  );
}
