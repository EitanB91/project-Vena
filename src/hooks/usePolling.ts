"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UsePollingOptions<T> {
  /** API endpoint to fetch */
  url: string;
  /** Polling interval in milliseconds (default: 30000) */
  intervalMs?: number;
  /** Initial data from server-side rendering */
  initialData?: T;
}

interface UsePollingResult<T> {
  data: T | undefined;
  error: string | null;
  isLoading: boolean;
  /** Timestamp of last successful fetch */
  lastUpdated: number | null;
  /** Force an immediate refresh */
  refresh: () => void;
}

/**
 * Client-side polling hook for live data refresh.
 * Fetches from an API endpoint at a regular interval.
 * Pauses polling when the tab is hidden (Page Visibility API).
 * Cleans up on unmount — no memory leaks.
 */
export function usePolling<T>({
  url,
  intervalMs = 30_000,
  initialData,
}: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [lastUpdated, setLastUpdated] = useState<number | null>(
    initialData ? Date.now() : null,
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => ({}));
        const msg =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as Record<string, unknown>).error === "string"
            ? (body as Record<string, unknown>).error as string
            : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const json = (await res.json()) as T;
      if (mountedRef.current) {
        setData(json);
        setError(null);
        setLastUpdated(Date.now());
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Fetch failed");
        setIsLoading(false);
      }
    }
  }, [url]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(fetchData, intervalMs);
  }, [fetchData, intervalMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  // Initial fetch + start polling
  useEffect(() => {
    mountedRef.current = true;
    void fetchData();
    startPolling();

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [fetchData, startPolling, stopPolling]);

  // Page Visibility API — pause polling when tab hidden
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else {
        void fetchData(); // Refresh immediately when tab becomes visible
        startPolling();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchData, startPolling, stopPolling]);

  return { data, error, isLoading, lastUpdated, refresh };
}
