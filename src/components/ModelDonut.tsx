"use client";

import { memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ModelDonutProps {
  /** Map of model name → output token count */
  modelTokens: Record<string, number>;
}

// Color assignments for known models
const MODEL_COLORS: Record<string, string> = {
  opus: "#6366f1",    // indigo accent
  sonnet: "#818cf8",  // lighter indigo
  haiku: "#38bdf8",   // info blue
};

function getModelColor(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("opus")) return MODEL_COLORS.opus;
  if (lower.includes("sonnet")) return MODEL_COLORS.sonnet;
  if (lower.includes("haiku")) return MODEL_COLORS.haiku;
  return "#55556e"; // muted for unknown
}

function getModelLabel(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("opus")) return "Opus";
  if (lower.includes("sonnet")) return "Sonnet";
  if (lower.includes("haiku")) return "Haiku";
  return model.split("-").pop() ?? model;
}

/**
 * F4 — Model Usage Donut.
 * Shows distribution of output tokens by model family.
 */
export const ModelDonut = memo(function ModelDonut({ modelTokens }: ModelDonutProps) {
  const entries = Object.entries(modelTokens).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  const data = entries.map(([model, value]) => ({
    name: getModelLabel(model),
    value,
    color: getModelColor(model),
    percent: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
  }));

  return (
    <div className="flex items-center gap-4">
      <div className="h-[120px] w-[120px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => Number(value).toLocaleString()}
              contentStyle={{
                backgroundColor: "#161622",
                border: "1px solid #1e1e32",
                borderRadius: "8px",
                color: "#e4e4ef",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-vena-text-secondary">
              {entry.name}
            </span>
            <span className="font-mono text-xs text-vena-text-muted">
              {entry.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
