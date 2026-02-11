import type { RepoExportData } from "../types";

/** Pre-built sample analysis for demo mode */
export const SAMPLE_DATA: RepoExportData = {
  version: "1.0.0",
  exportedAt: "2026-02-10T12:00:00.000Z",
  repoPath: "https://github.com/acme-corp/enterprise-platform",
  branches: [
    { name: "main", type: "main", lastCommitDate: "2026-02-09T10:00:00Z", lastCommitHash: "a1b2c3d", lastCommitMessage: "Release v3.0.0", author: "Alice", aheadOfMain: 0, behindMain: 0, isStale: false, isMerged: false, ageInDays: 2 },
    { name: "develop", type: "develop", lastCommitDate: "2026-02-10T08:00:00Z", lastCommitHash: "e4f5g6h", lastCommitMessage: "Merge feature/auth-redesign", author: "Bob", aheadOfMain: 12, behindMain: 0, isStale: false, isMerged: false, ageInDays: 1 },
    { name: "feature/auth-redesign", type: "feature", lastCommitDate: "2026-02-10T07:00:00Z", lastCommitHash: "i7j8k9l", lastCommitMessage: "Add OAuth2 PKCE flow", author: "Carol", aheadOfMain: 8, behindMain: 2, isStale: false, isMerged: true, ageInDays: 5 },
    { name: "feature/dashboard-v2", type: "feature", lastCommitDate: "2026-02-09T14:00:00Z", lastCommitHash: "m1n2o3p", lastCommitMessage: "Add chart components", author: "Dave", aheadOfMain: 15, behindMain: 3, isStale: false, isMerged: false, ageInDays: 8 },
    { name: "feature/api-rate-limiting", type: "feature", lastCommitDate: "2026-02-08T11:00:00Z", lastCommitHash: "q4r5s6t", lastCommitMessage: "Add sliding window rate limiter", author: "Eve", aheadOfMain: 6, behindMain: 5, isStale: false, isMerged: false, ageInDays: 12 },
    { name: "feature/notification-service", type: "feature", lastCommitDate: "2026-02-07T09:00:00Z", lastCommitHash: "u7v8w9x", lastCommitMessage: "Wire up WebSocket notifications", author: "Alice", aheadOfMain: 22, behindMain: 8, isStale: false, isMerged: false, ageInDays: 14 },
    { name: "feature/search-improvements", type: "feature", lastCommitDate: "2026-02-05T16:00:00Z", lastCommitHash: "y1z2a3b", lastCommitMessage: "Add fuzzy search", author: "Bob", aheadOfMain: 4, behindMain: 6, isStale: false, isMerged: false, ageInDays: 20 },
    { name: "feature/payment-refactor", type: "feature", lastCommitDate: "2026-01-28T10:00:00Z", lastCommitHash: "c4d5e6f", lastCommitMessage: "Extract payment gateway", author: "Carol", aheadOfMain: 31, behindMain: 18, isStale: false, isMerged: false, ageInDays: 45 },
    { name: "feature/legacy-cleanup", type: "feature", lastCommitDate: "2026-01-15T08:00:00Z", lastCommitHash: "g7h8i9j", lastCommitMessage: "Remove deprecated endpoints", author: "Dave", aheadOfMain: 3, behindMain: 22, isStale: false, isMerged: false, ageInDays: 58 },
    { name: "feature/analytics-pipeline", type: "feature", lastCommitDate: "2025-10-01T10:00:00Z", lastCommitHash: "k1l2m3n", lastCommitMessage: "Add event tracking", author: "Eve", aheadOfMain: 2, behindMain: 45, isStale: true, isMerged: false, ageInDays: 133 },
    { name: "feature/old-ui-experiment", type: "feature", lastCommitDate: "2025-09-10T10:00:00Z", lastCommitHash: "o4p5q6r", lastCommitMessage: "Experiment: new sidebar", author: "Alice", aheadOfMain: 1, behindMain: 52, isStale: true, isMerged: false, ageInDays: 154 },
    { name: "feature/abandoned-chat", type: "feature", lastCommitDate: "2025-08-01T10:00:00Z", lastCommitHash: "s7t8u9v", lastCommitMessage: "WIP: chat feature", author: "Bob", aheadOfMain: 5, behindMain: 70, isStale: true, isMerged: false, ageInDays: 194 },
    { name: "release/3.1", type: "release", lastCommitDate: "2026-02-08T09:00:00Z", lastCommitHash: "w1x2y3z", lastCommitMessage: "Bump version to 3.1.0-rc.1", author: "Alice", aheadOfMain: 4, behindMain: 0, isStale: false, isMerged: false, ageInDays: 3 },
    { name: "hotfix/session-timeout", type: "hotfix", lastCommitDate: "2026-02-09T15:00:00Z", lastCommitHash: "a4b5c6d", lastCommitMessage: "Fix session expiry race condition", author: "Carol", aheadOfMain: 1, behindMain: 0, isStale: false, isMerged: false, ageInDays: 2 },
    { name: "qa", type: "environment", lastCommitDate: "2026-02-10T06:00:00Z", lastCommitHash: "e7f8g9h", lastCommitMessage: "Deploy develop to QA", author: "CI Bot", aheadOfMain: 12, behindMain: 0, isStale: false, isMerged: false, ageInDays: 1 },
    { name: "staging", type: "environment", lastCommitDate: "2026-02-09T12:00:00Z", lastCommitHash: "i1j2k3l", lastCommitMessage: "Deploy release/3.1 to staging", author: "CI Bot", aheadOfMain: 4, behindMain: 0, isStale: false, isMerged: false, ageInDays: 2 },
  ],
  gitFlowConfig: {
    hasMain: true,
    hasDevelop: true,
    mainBranch: "main",
    developBranch: "develop",
    featureBranches: [],
    releaseBranches: [],
    hotfixBranches: [],
    environmentBranches: [],
    otherBranches: [],
  },
  report: {
    repoPath: "https://github.com/acme-corp/enterprise-platform",
    analyzedAt: "2026-02-10T12:00:00.000Z",
    gitFlowDetected: true,
    gitFlowConfig: {
      hasMain: true,
      hasDevelop: true,
      mainBranch: "main",
      developBranch: "develop",
      featureBranches: [],
      releaseBranches: [],
      hotfixBranches: [],
      environmentBranches: [],
      otherBranches: [],
    },
    allBranches: [],
    totalBranches: 16,
    activeBranches: 13,
    staleBranches: 3,
    readinessScore: 0,
    blockers: [
      {
        id: "unmerged-release-release/3.1",
        severity: "critical",
        title: "Active release branch: release/3.1",
        description: 'Release branch "release/3.1" has not been merged into main.',
        remediation: 'Complete the release by merging "release/3.1" into "main" and "develop".',
      },
      {
        id: "unmerged-hotfix-hotfix/session-timeout",
        severity: "critical",
        title: "Active hotfix branch: hotfix/session-timeout",
        description: 'Hotfix branch "hotfix/session-timeout" has not been merged into main.',
        remediation: 'Complete the hotfix by merging "hotfix/session-timeout" into "main" and "develop".',
      },
    ],
    isReady: false,
  },
};

// Wire up gitFlowConfig branch arrays from the branches list
SAMPLE_DATA.report.gitFlowConfig.featureBranches = SAMPLE_DATA.branches.filter(b => b.type === "feature");
SAMPLE_DATA.report.gitFlowConfig.releaseBranches = SAMPLE_DATA.branches.filter(b => b.type === "release");
SAMPLE_DATA.report.gitFlowConfig.hotfixBranches = SAMPLE_DATA.branches.filter(b => b.type === "hotfix");
SAMPLE_DATA.report.gitFlowConfig.environmentBranches = SAMPLE_DATA.branches.filter(b => b.type === "environment");
SAMPLE_DATA.report.allBranches = SAMPLE_DATA.branches;
SAMPLE_DATA.gitFlowConfig = SAMPLE_DATA.report.gitFlowConfig;
