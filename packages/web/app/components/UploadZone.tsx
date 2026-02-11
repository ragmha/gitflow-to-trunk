"use client";

import { useCallback, useState } from "react";
import type { RepoExportData } from "../types";

export function UploadZone({
  onData,
}: {
  onData: (data: RepoExportData) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (!json.report || !Array.isArray(json.branches)) {
          setError("Invalid export file. Run `gf2t export` to generate one.");
          return;
        }
        onData(json as RepoExportData);
      } catch {
        setError("Could not parse JSON file.");
      }
    },
    [onData]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors ${
        dragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-zinc-700 hover:border-zinc-500"
      }`}
    >
      <div className="mb-4 text-4xl">📂</div>
      <p className="mb-2 text-lg font-medium text-zinc-200">
        Drop your export JSON here
      </p>
      <p className="mb-4 text-sm text-zinc-500">
        Generate with: <code className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">npx gf2t export --path /your/repo</code>
      </p>
      <label className="cursor-pointer rounded-full bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700">
        Browse files
        <input
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
