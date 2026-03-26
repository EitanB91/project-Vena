"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface TokenChartData {
  label: string;
  input: number;
  output: number;
  cache: number;
}

interface TokenChartProps {
  data: TokenChartData[];
}

// Recharts requires raw hex — keep in sync with globals.css
const COLORS = {
  input: "#818cf8",   // accent-hover (lighter indigo)
  output: "#6366f1",  // accent (indigo)
  cache: "#55556e",   // text-muted (muted)
};

/**
 * F2 — Token Breakdown stacked bar chart.
 * Shows input vs output vs cache tokens per day.
 * Output tokens are prominent, cache tokens muted.
 */
export const TokenChart = memo(function TokenChart({ data }: TokenChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
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
            formatter={(value, name) => {
              const label =
                name === "output"
                  ? "Output"
                  : name === "input"
                    ? "Input"
                    : "Cache";
              return [Number(value).toLocaleString(), label];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#8888a4" }}
            formatter={(value: string) =>
              value === "output"
                ? "Output"
                : value === "input"
                  ? "Input"
                  : "Cache"
            }
          />
          <Bar
            dataKey="output"
            stackId="tokens"
            fill={COLORS.output}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="input"
            stackId="tokens"
            fill={COLORS.input}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="cache"
            stackId="tokens"
            fill={COLORS.cache}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
