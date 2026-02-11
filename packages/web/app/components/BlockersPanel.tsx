"use client";

import type { MigrationBlocker } from "../types";

export function BlockersPanel({
  blockers,
}: {
  blockers: MigrationBlocker[];
}) {
  if (blockers.length === 0) {
    return (
      <div className="rounded-2xl border border-green-900 bg-green-950/30 p-6">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-green-400">
          Pre-Migration Checklist
        </h2>
        <p className="text-green-300">
          ✅ No blockers found — this repository is ready for migration.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-red-400">
        Migration Blockers ({blockers.length})
      </h2>
      <div className="space-y-4">
        {blockers.map((blocker) => (
          <div
            key={blocker.id}
            className="rounded-xl border border-red-900/50 bg-red-950/20 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-red-900 px-2 py-0.5 text-xs font-medium uppercase text-red-200">
                {blocker.severity}
              </span>
              <h3 className="font-semibold text-zinc-100">{blocker.title}</h3>
            </div>
            <p className="mb-3 text-sm text-zinc-400">{blocker.description}</p>
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <p className="text-xs font-medium uppercase text-zinc-500">
                How to fix
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {blocker.remediation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
