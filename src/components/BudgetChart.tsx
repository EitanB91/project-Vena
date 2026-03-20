"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface BudgetChartProps {
  usable: number;
  floor: number;
  spent: number;
  currency: string;
}

// Recharts requires raw hex for SVG fills — CSS variables don't work in SVG.
// Keep in sync with design tokens in globals.css if they change.
const COLORS = {
  usable: "#22c55e", // --vena-success
  floor: "#f59e0b", // --vena-warning
  spent: "#ef4444", // --vena-error
};

export function BudgetChart({
  usable,
  floor,
  spent,
  currency,
}: BudgetChartProps) {
  const data = [
    { name: "Available", value: usable, color: COLORS.usable },
    { name: "Floor (Reserved)", value: floor, color: COLORS.floor },
  ];
  if (spent > 0) {
    data.push({ name: "Spent", value: spent, color: COLORS.spent });
  }

  const total = usable + floor;

  return (
    <div className="relative h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${Number(value).toFixed(2)}`}
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
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-vena-text">
            ${total.toFixed(2)}
          </p>
          <p className="text-micro text-vena-text-muted">{currency}</p>
        </div>
      </div>
    </div>
  );
}
