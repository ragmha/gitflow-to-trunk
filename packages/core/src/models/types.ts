/** Represents a single Git branch and its metadata */
export interface Branch {
  name: string;
  type: 'main' | 'develop' | 'feature' | 'release' | 'hotfix' | 'environment' | 'other';
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

/** Git Flow detection result */
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

/** A single migration blocker */
export interface MigrationBlocker {
  id: string;
  severity: 'critical';
  title: string;
  description: string;
  remediation: string;
  details?: Record<string, unknown>;
}

/** Analysis report for a repository */
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

/** Migration plan generated from analysis */
export interface MigrationPlan {
  report: AnalysisReport;
  steps: MigrationStep[];
  backupTagPrefix: string;
  createdAt: string;
}

/** A single step in the migration plan */
export interface MigrationStep {
  order: number;
  action: 'backup' | 'merge' | 'rebase' | 'archive' | 'delete' | 'tag';
  description: string;
  sourceBranch?: string;
  targetBranch?: string;
  isDestructive: boolean;
}

/** Export data format for web UI upload */
export interface RepoExportData {
  version: string;
  exportedAt: string;
  repoPath: string;
  branches: Branch[];
  gitFlowConfig: GitFlowConfig;
  report: AnalysisReport;
}

/** Reference link for educational content */
export interface ReferenceLink {
  title: string;
  url: string;
  category: 'trunk-based-dev' | 'git-flow' | 'feature-flags' | 'ci-cd';
  description: string;
}
