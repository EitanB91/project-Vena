"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { usePolling } from "@/hooks/usePolling";
import { formatDateShort } from "@/lib/format";

export interface TelemetryData {
  totalSessions: number;
  totalTokens: number;
  totalOutputTokens: number;
  totalDurationMinutes: number;
  todayDurationMinutes: number;
  todayDurationHours: number;
  lastSessionAgo: string | null;
  burnRateData: { label: string; output: number }[];
  activeSessionCount: number;
}

interface TelemetryApiResponse {
  dailyUsage: {
    date: string;
    sessions: number;
    durationMinutes: number;
    tokens: { output: number };
    messages: number;
    toolCalls: number;
  }[];
}

type UsageMetric = "tokens" | "messages" | "sessions" | "toolCalls";
type BurnWindow = 7 | 30;

interface BudgetClientProps {
  telemetryData: TelemetryData;
}

function formatAvg(value: number, isTokens: boolean): string {
  if (!isTokens) return Math.round(value).toString();
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return Math.round(value).toString();
}

const METRIC_LABELS: Record<UsageMetric, string> = {
  tokens: "Tokens",
  messages: "Messages",
  sessions: "Sessions",
  toolCalls: "Tool Calls",
};

export function BudgetClient({ telemetryData }: BudgetClientProps) {
  const [metric, setMetric] = useState<UsageMetric>("tokens");
  const [burnWindow, setBurnWindow] = useState<BurnWindow>(7);

  const { data: apiData } = usePolling<TelemetryApiResponse>({
    url: "/api/telemetry",
    intervalMs: 60_000,
  });

  // F7 — Burn rate with 7d/30d window
  const burnRate = apiData
    ? apiData.dailyUsage.slice(-burnWindow).map((d) => ({
        label: formatDateShort(d.date),
        output: d.tokens.output,
      }))
    : telemetryData.burnRateData.slice(-burnWindow);

  // F17 — Usage Over Time (switchable including tool calls)
  const usageData = apiData
    ? apiData.dailyUsage.map((d) => ({
        label: formatDateShort(d.date),
        messages: d.messages,
        sessions: d.sessions,
        tokens: d.tokens.output,
        toolCalls: d.toolCalls,
      }))
    : telemetryData.burnRateData.map((d) => ({
        label: d.label,
        messages: 0,
        sessions: 0,
        tokens: d.output,
        toolCalls: 0,
      }));

  // C6 — Average reference line for context
  const avg =
    usageData.length > 0
      ? usageData.reduce((sum, d) => sum + d[metric], 0) / usageData.length
      : 0;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* F7 — Burn Rate Chart */}
      <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Output Token Burn Rate
          </h2>
          <div className="flex gap-1">
            {([7, 30] as const).map((w) => (
              <button
                key={w}
                onClick={() => setBurnWindow(w)}
                className={`rounded-md px-2 py-0.5 text-micro font-medium transition-colors ${
                  burnWindow === w
                    ? "bg-vena-accent text-white"
                    : "text-vena-text-muted hover:text-vena-text-secondary"
                }`}
              >
                {w}d
              </button>
            ))}
          </div>
        </div>
        {burnRate.length > 0 ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burnRate} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e1e32"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#55556e"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#55556e"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const n = Number(v);
                    return n >= 1_000_000
                      ? `${(n / 1_000_000).toFixed(0)}M`
                      : n >= 1_000
                        ? `${(n / 1_000).toFixed(0)}K`
                        : String(n);
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161622",
                    border: "1px solid #1e1e32",
                    borderRadius: "8px",
                    color: "#e4e4ef",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [
                    Number(value).toLocaleString(),
                    "Output Tokens",
                  ]}
                />
                <Bar
                  dataKey="output"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-vena-text-muted">No data yet.</p>
        )}
      </div>

      {/* F17 — Usage Over Time */}
      <div className="rounded-lg border border-vena-border bg-vena-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-vena-text-muted">
            Usage Over Time
          </h2>
          <div className="flex gap-1">
            {(["tokens", "messages", "sessions", "toolCalls"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`rounded-md px-2 py-0.5 text-micro font-medium transition-colors ${
                  metric === m
                    ? "bg-vena-accent text-white"
                    : "text-vena-text-muted hover:text-vena-text-secondary"
                }`}
              >
                {METRIC_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
        {usageData.length > 0 ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e1e32"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#55556e"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#55556e"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const n = Number(v);
                    return metric === "tokens"
                      ? n >= 1_000_000
                        ? `${(n / 1_000_000).toFixed(0)}M`
                        : n >= 1_000
                          ? `${(n / 1_000).toFixed(0)}K`
                          : String(n)
                      : String(n);
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161622",
                    border: "1px solid #1e1e32",
                    borderRadius: "8px",
                    color: "#e4e4ef",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [
                    metric === "tokens"
                      ? Number(value).toLocaleString()
                      : String(value),
                    METRIC_LABELS[metric],
                  ]}
                />
                {avg > 0 && (
                  <ReferenceLine
                    y={avg}
                    stroke="#55556e"
                    strokeDasharray="4 4"
                    label={{
                      value: `avg: ${formatAvg(avg, metric === "tokens")}`,
                      position: "right",
                      fill: "#55556e",
                      fontSize: 10,
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 3 }}
                  activeDot={{ r: 5, fill: "#818cf8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-vena-text-muted">No data yet.</p>
        )}
      </div>
    </div>
  );
}
