// Mirrors @gf2t/core types for the web UI
export interface Branch {
  name: string;
  type: "main" | "develop" | "feature" | "release" | "hotfix" | "environment" | "other";
  lastCommitDate: string;
  lastCommitHash: string;
  lastCommitMessage: string;
  author: string;
  aheadOfMain: number;
  behindMain: number;
  isStale: boolean;
  isMerged: boolean;
  ageInDays: number;
}

export interface GitFlowConfig {
  hasMain: boolean;
  hasDevelop: boolean;
  mainBranch: string;
  developBranch: string;
  featureBranches: Branch[];
  releaseBranches: Branch[];
  hotfixBranches: Branch[];
  environmentBranches: Branch[];
  otherBranches: Branch[];
}

export interface MigrationBlocker {
  id: string;
  severity: "critical";
  title: string;
  description: string;
  remediation: string;
  details?: Record<string, unknown>;
}

export interface AnalysisReport {
  repoPath: string;
  analyzedAt: string;
  gitFlowDetected: boolean;
  gitFlowConfig: GitFlowConfig;
  allBranches: Branch[];
  totalBranches: number;
  activeBranches: number;
  staleBranches: number;
  readinessScore: number;
  blockers: MigrationBlocker[];
  isReady: boolean;
}

export interface RepoExportData {
  version: string;
  exportedAt: string;
  repoPath: string;
  branches: Branch[];
  gitFlowConfig: GitFlowConfig;
  report: AnalysisReport;
}
