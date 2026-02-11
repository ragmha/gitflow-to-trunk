"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Branch } from "../types";

const TYPE_COLORS: Record<string, string> = {
  feature: "#3b82f6",
  release: "#a855f7",
  hotfix: "#ef4444",
  environment: "#f97316",
  develop: "#22c55e",
  main: "#6366f1",
  other: "#71717a",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "Feature",
  release: "Release",
  hotfix: "Hotfix",
  environment: "Environment",
  develop: "Develop",
  main: "Main",
  other: "Other",
};

export function BranchOverview({ branches }: { branches: Branch[] }) {
  // Group by type
  const typeCounts = branches.reduce(
    (acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type: TYPE_LABELS[type] || type,
      count,
      color: TYPE_COLORS[type] || "#71717a",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
        Branches by Type
      </h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="type"
              tick={{ fill: "#d4d4d8", fontSize: 13 }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                color: "#e4e4e7",
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Branch table */}
      <div className="mt-4 max-h-64 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
              <th className="pb-2 pr-4">Branch</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Age</th>
              <th className="pb-2 pr-4">Ahead</th>
              <th className="pb-2 pr-4">Behind</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {branches
              .sort((a, b) => a.ageInDays - b.ageInDays)
              .map((b) => (
                <tr
                  key={b.name}
                  className="border-b border-zinc-800/50 text-zinc-300"
                >
                  <td className="py-2 pr-4 font-mono text-xs">{b.name}</td>
                  <td className="py-2 pr-4">
                    <span
                      className="rounded px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${TYPE_COLORS[b.type]}20`,
                        color: TYPE_COLORS[b.type],
                      }}
                    >
                      {b.type}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-zinc-500">
                    {b.ageInDays}d
                  </td>
                  <td className="py-2 pr-4 text-xs text-green-400">
                    +{b.aheadOfMain}
                  </td>
                  <td className="py-2 pr-4 text-xs text-red-400">
                    -{b.behindMain}
                  </td>
                  <td className="py-2 text-xs">
                    {b.isMerged ? (
                      <span className="text-green-400">Merged</span>
                    ) : b.isStale ? (
                      <span className="text-yellow-400">Stale</span>
                    ) : (
                      <span className="text-blue-400">Active</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
