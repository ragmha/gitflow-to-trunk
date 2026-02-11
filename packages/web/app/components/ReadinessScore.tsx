"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
};

function getScoreColor(score: number) {
  if (score >= 70) return COLORS.green;
  if (score >= 40) return COLORS.yellow;
  return COLORS.red;
}

function getVerdict(score: number, blockersCount: number) {
  if (blockersCount > 0) return "Not Ready — Resolve blockers first";
  if (score >= 70) return "Ready to migrate";
  if (score >= 40) return "Almost ready — minor cleanup needed";
  return "Not ready — significant work needed";
}

export function ReadinessScore({
  score,
  blockersCount,
}: {
  score: number;
  blockersCount: number;
}) {
  const color = getScoreColor(score);
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
        Migration Readiness
      </h2>
      <div className="relative h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#27272a" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-zinc-500">/ 100</span>
        </div>
      </div>
      <p className="text-center text-sm font-medium" style={{ color }}>
        {getVerdict(score, blockersCount)}
      </p>
    </div>
  );
}
