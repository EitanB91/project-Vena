"use client";

import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function AgentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Agents error"
      message={error.message}
      onRetry={reset}
    />
  );
}
