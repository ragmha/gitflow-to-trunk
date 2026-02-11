#!/usr/bin/env node

/**
 * Standalone script for GitHub Actions to analyze a repo via GitHub API.
 * Usage: node analyze-github.js <owner> <repo> [output-file]
 * Requires GITHUB_TOKEN env var.
 */

import { analyzeGitHubRepository } from '../analysis/github-analyzer.js';
import type { RepoExportData } from '../models/types.js';
import { writeFileSync } from 'node:fs';

const [owner, repo, outputFile] = process.argv.slice(2);

if (!owner || !repo) {
  console.error('Usage: analyze-github <owner> <repo> [output-file]');
  process.exit(1);
}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

console.log(`Analyzing ${owner}/${repo} via GitHub API...`);

try {
  const report = await analyzeGitHubRepository({ owner, repo, token });

  const exportData: RepoExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    repoPath: `https://github.com/${owner}/${repo}`,
    branches: report.allBranches,
    gitFlowConfig: report.gitFlowConfig,
    report,
  };

  const json = JSON.stringify(exportData, null, 2);
  const outPath = outputFile || 'gf2t-export.json';
  writeFileSync(outPath, json);

  console.log(`Analysis complete. Readiness: ${report.readinessScore}/100`);
  console.log(`Blockers: ${report.blockers.length}`);
  console.log(`Output: ${outPath}`);
} catch (err) {
  console.error('Analysis failed:', err instanceof Error ? err.message : err);
  process.exit(1);
}
