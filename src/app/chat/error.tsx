"use client";

import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Chat error"
      message={error.message}
      onRetry={reset}
    />
  );
}
