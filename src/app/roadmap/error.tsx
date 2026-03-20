"use client";

import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function RoadmapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Roadmap error"
      message={error.message}
      onRetry={reset}
    />
  );
}
