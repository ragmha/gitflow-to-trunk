"use client";

import { useState } from "react";
import type { RepoExportData } from "./types";
import { SAMPLE_DATA } from "./data/sample";
import { UploadZone } from "./components/UploadZone";
import { ReadinessScore } from "./components/ReadinessScore";
import { BlockersPanel } from "./components/BlockersPanel";
import { BranchOverview } from "./components/BranchOverview";
import { BranchStalenessChart } from "./components/BranchStalenessChart";
import { EducationPanel } from "./components/EducationPanel";
import { MigrationPlan } from "./components/MigrationPlan";

type Tab = "overview" | "branches" | "education" | "migration";

function SummaryStats({ data }: { data: RepoExportData }) {
  const { report } = data;
  const stats = [
    { label: "Total Branches", value: report.totalBranches },
    { label: "Active", value: report.activeBranches, color: "text-blue-400" },
    { label: "Stale", value: report.staleBranches, color: "text-yellow-400" },
    { label: "Blockers", value: report.blockers.length, color: report.blockers.length > 0 ? "text-red-400" : "text-green-400" },
    { label: "Git Flow", value: report.gitFlowDetected ? "Detected" : "Not Found", color: report.gitFlowDetected ? "text-purple-400" : "text-zinc-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-500">{s.label}</p>
          <p className={`mt-1 text-2xl font-bold ${s.color || "text-zinc-100"}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ data, onReset }: { data: RepoExportData; onReset: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "branches", label: "Branches" },
    { id: "education", label: "Learn" },
    { id: "migration", label: "Migration Plan" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Analysis Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {data.repoPath} · Analyzed {new Date(data.report.analyzedAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          ← New Analysis
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-zinc-900 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <ReadinessScore score={data.report.readinessScore} blockersCount={data.report.blockers.length} />
            <div className="lg:col-span-2">
              <SummaryStats data={data} />
              <div className="mt-6">
                <BlockersPanel blockers={data.report.blockers} />
              </div>
            </div>
          </div>
          <BranchStalenessChart branches={data.branches} />
        </div>
      )}

      {tab === "branches" && (
        <BranchOverview branches={data.branches} />
      )}

      {tab === "education" && (
        <EducationPanel />
      )}

      {tab === "migration" && (
        <MigrationPlan report={data.report} />
      )}
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<RepoExportData | null>(null);

  if (data) {
    return <Dashboard data={data} onReset={() => setData(null)} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-2xl px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
            gitflow-to-trunk
          </h1>
          <p className="mt-3 text-lg text-zinc-500">
            Analyze your Git Flow repository and plan your migration to trunk-based development.
          </p>
        </div>

        <div className="space-y-4">
          {/* Upload JSON */}
          <UploadZone onData={setData} />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Demo */}
          <button
            onClick={() => setData(SAMPLE_DATA)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <div>
                <p className="font-medium text-zinc-200">Try Demo</p>
                <p className="text-sm text-zinc-500">
                  Load a sample enterprise Git Flow analysis to explore the dashboard
                </p>
              </div>
            </div>
          </button>

          {/* How to generate */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-2 text-sm font-medium text-zinc-300">
              How to analyze your repo
            </h3>
            <div className="space-y-2 text-sm text-zinc-500">
              <p>
                <strong className="text-zinc-400">Option 1 — CLI:</strong> Run locally
              </p>
              <div className="rounded-lg bg-zinc-950 p-3">
                <code className="text-xs text-green-400">
                  npx gf2t export --path /your/repo
                </code>
              </div>
              <p>
                <strong className="text-zinc-400">Option 2 — GitHub Actions:</strong>{" "}
                Trigger the <code className="rounded bg-zinc-800 px-1 text-zinc-400">Analyze Repository</code>{" "}
                workflow with your repo URL from the{" "}
                <a
                  href="https://github.com/ragmha/gitflow-to-trunk/actions/workflows/analyze-repo.yml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Actions tab
                </a>
                , then download the artifact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
