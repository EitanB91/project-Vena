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
} from "recharts";

export interface SessionChartData {
  date: string;
  label: string;
  sessions: number;
  minutes: number;
}

interface SessionChartProps {
  data: SessionChartData[];
}

// Recharts requires raw hex for SVG — CSS variables don't work in SVG.
// Colors below mirror design tokens in globals.css. Keep in sync if they change.
export const SessionChart = memo(function SessionChart({ data }: SessionChartProps) {
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
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161622",
              border: "1px solid #1e1e32",
              borderRadius: "8px",
              color: "#e4e4ef",
              fontSize: "13px",
            }}
            formatter={(value, name) => [
              name === "minutes" ? `${Number(value).toFixed(1)} min` : String(value),
              name === "minutes" ? "Duration" : "Sessions",
            ]}
          />
          <Bar
            dataKey="sessions"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            name="sessions"
          />
          <Bar
            dataKey="minutes"
            fill="#818cf8"
            radius={[4, 4, 0, 0]}
            name="minutes"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
