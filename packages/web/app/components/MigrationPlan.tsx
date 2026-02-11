"use client";

import type { AnalysisReport } from "../types";

export function MigrationPlan({ report }: { report: AnalysisReport }) {
  const hasBlockers = report.blockers.length > 0;

  return (
    <div className="space-y-6">
      {/* Migration Command */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Migration Command
        </h2>
        {hasBlockers ? (
          <div className="rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-4">
            <p className="text-sm text-yellow-300">
              ⚠ Resolve all migration blockers before running the migration
              command.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              Run this command to perform a one-shot migration with automatic
              backup:
            </p>
            <div className="rounded-xl bg-zinc-950 p-4">
              <code className="text-sm text-green-400">
                npx gf2t migrate --path /your/repo --backup --eol-days 90
              </code>
            </div>
            <p className="text-xs text-zinc-500">
              This will merge develop into main, archive Git Flow branches with
              a backup tag, and set a 90-day EOL for archived branches.
            </p>
          </div>
        )}
      </div>

      {/* What Happens */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
          What the Migration Does
        </h2>
        <ol className="space-y-3">
          {MIGRATION_STEPS.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {step.title}
                </p>
                <p className="text-xs text-zinc-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Backup & Rollback */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Backup & Rollback Strategy
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl bg-zinc-800/50 p-4">
            <h3 className="mb-1 text-sm font-medium text-zinc-200">
              🏷️ Automatic Backup Tags
            </h3>
            <p className="text-xs text-zinc-400">
              All branches are tagged with{" "}
              <code className="rounded bg-zinc-700 px-1">
                backup/pre-migration/{"{branch-name}"}
              </code>{" "}
              before any destructive action.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-800/50 p-4">
            <h3 className="mb-1 text-sm font-medium text-zinc-200">
              ↩️ Rollback Command
            </h3>
            <div className="mt-2 rounded-lg bg-zinc-950 p-3">
              <code className="text-xs text-yellow-400">
                npx gf2t rollback --path /your/repo --tag
                backup/pre-migration
              </code>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Restores all branches from backup tags.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-800/50 p-4">
            <h3 className="mb-1 text-sm font-medium text-zinc-200">
              📅 EOL Date for Archived Branches
            </h3>
            <p className="text-xs text-zinc-400">
              Archived branches are kept for 90 days (configurable). After EOL,
              they can be safely deleted. A reminder is logged in the migration
              report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const MIGRATION_STEPS = [
  {
    title: "Create backup tags",
    description:
      "Tag every branch tip so you can restore them if anything goes wrong.",
  },
  {
    title: "Merge develop → main",
    description:
      "Bring all develop work into main. This is the core of the migration.",
  },
  {
    title: "Archive feature branches",
    description:
      "Tag and delete merged feature branches. Unmerged features are rebased onto main.",
  },
  {
    title: "Remove release & hotfix branches",
    description:
      "These are no longer needed in trunk-based dev. Tagged for archival.",
  },
  {
    title: "Delete develop branch",
    description:
      "With trunk-based dev, develop is no longer needed. All work goes to main.",
  },
  {
    title: "Update CI/CD configuration",
    description:
      "Update pipeline triggers to build from main instead of develop.",
  },
];
