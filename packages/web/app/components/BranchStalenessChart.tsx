"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Branch } from "../types";

export function BranchStalenessChart({ branches }: { branches: Branch[] }) {
  const types = ["feature", "release", "hotfix", "environment", "other"];
  const data = types
    .map((type) => {
      const ofType = branches.filter((b) => b.type === type);
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        Active: ofType.filter((b) => !b.isStale).length,
        Stale: ofType.filter((b) => b.isStale).length,
      };
    })
    .filter((d) => d.Active > 0 || d.Stale > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
        Active vs Stale Branches
      </h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="type"
              tick={{ fill: "#d4d4d8", fontSize: 13 }}
            />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                color: "#e4e4e7",
              }}
            />
            <Legend
              wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }}
            />
            <Bar
              dataKey="Active"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              stackId="stack"
            />
            <Bar
              dataKey="Stale"
              fill="#eab308"
              radius={[4, 4, 0, 0]}
              stackId="stack"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
