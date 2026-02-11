import type { Branch, GitFlowConfig, AnalysisReport, MigrationBlocker } from '../models/types.js';

const STALE_THRESHOLD_DAYS = 90;
const ACTIVE_FEATURE_THRESHOLD = 10;

interface GitHubBranchResponse {
  name: string;
  commit: { sha: string; url: string };
  protected: boolean;
}

interface GitHubCommitResponse {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
}

interface GitHubCompareResponse {
  ahead_by: number;
  behind_by: number;
  status: string;
}

interface AnalyzeGitHubOptions {
  owner: string;
  repo: string;
  token?: string;
}

/**
 * Analyze a GitHub repository for Git Flow patterns using only the REST API.
 * Zero cloning — uses branch listing and compare endpoints.
 */
export async function analyzeGitHubRepository(
  options: AnalyzeGitHubOptions,
): Promise<AnalysisReport> {
  const { owner, repo, token } = options;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const apiFetch = async <T>(path: string): Promise<T> => {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText} for ${path}`);
    }
    const data = await res.json();
    return data as T;
  };

  // Paginate all branches
  const allGhBranches: GitHubBranchResponse[] = [];
  let page = 1;
  while (true) {
    const batch = await apiFetch<GitHubBranchResponse[]>(
      `/repos/${owner}/${repo}/branches?per_page=100&page=${page}`,
    );
    if (batch.length === 0) break;
    allGhBranches.push(...batch);
    if (batch.length < 100) break;
    page++;
  }

  if (allGhBranches.length === 0) {
    throw new Error(`No branches found for ${owner}/${repo}`);
  }

  // Detect main branch name
  const mainBranchName = allGhBranches.find(b => b.name === 'main')
    ? 'main'
    : allGhBranches.find(b => b.name === 'master')
      ? 'master'
      : allGhBranches[0].name;

  // Build Branch objects
  const branches: Branch[] = [];

  for (const ghBranch of allGhBranches) {
    // Get latest commit details
    let commit: GitHubCommitResponse;
    try {
      commit = await apiFetch<GitHubCommitResponse>(
        `/repos/${owner}/${repo}/commits/${ghBranch.commit.sha}`,
      );
      if (!commit?.commit?.author?.date) {
        console.warn(`Skipping branch "${ghBranch.name}": incomplete commit data`);
        continue;
      }
    } catch (err) {
      console.warn(`Skipping branch "${ghBranch.name}": ${err instanceof Error ? err.message : err}`);
      continue;
    }

    // Get ahead/behind relative to main
    let aheadOfMain = 0;
    let behindMain = 0;
    let isMerged = false;

    if (ghBranch.name !== mainBranchName) {
      try {
        const compare = await apiFetch<GitHubCompareResponse>(
          `/repos/${owner}/${repo}/compare/${mainBranchName}...${ghBranch.name}`,
        );
        aheadOfMain = compare.ahead_by;
        behindMain = compare.behind_by;
        // If branch is 0 commits ahead, it's effectively merged
        isMerged = compare.ahead_by === 0;
      } catch {
        // Branch may not share history
      }
    }

    const commitDate = new Date(commit.commit.author.date);
    const ageInDays = Math.floor(
      (Date.now() - commitDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    branches.push({
      name: ghBranch.name,
      type: classifyBranch(ghBranch.name),
      lastCommitDate: commit.commit.author.date,
      lastCommitHash: commit.sha,
      lastCommitMessage: commit.commit.message,
      author: commit.commit.author.name,
      aheadOfMain,
      behindMain,
      isStale: ageInDays > STALE_THRESHOLD_DAYS,
      isMerged,
      ageInDays,
    });
  }

  const gitFlowConfig = detectGitFlow(branches);
  const blockers = detectBlockers(gitFlowConfig);

  const activeBranches = branches.filter(b => !b.isStale);
  const staleBranches = branches.filter(b => b.isStale);
  const readinessScore = calculateReadinessScore(gitFlowConfig, blockers, branches);

  return {
    repoPath: `https://github.com/${owner}/${repo}`,
    analyzedAt: new Date().toISOString(),
    gitFlowDetected: gitFlowConfig.hasDevelop,
    gitFlowConfig,
    allBranches: branches,
    totalBranches: branches.length,
    activeBranches: activeBranches.length,
    staleBranches: staleBranches.length,
    readinessScore,
    blockers,
    isReady: blockers.length === 0,
  };
}

/** Classify a branch by its Git Flow naming convention */
function classifyBranch(name: string): Branch['type'] {
  if (name === 'main' || name === 'master') return 'main';
  if (name === 'develop' || name === 'dev') return 'develop';
  if (name.startsWith('feature/')) return 'feature';
  if (name.startsWith('release/')) return 'release';
  if (name.startsWith('hotfix/')) return 'hotfix';
  if (['qa', 'staging', 'uat', 'test', 'pre-prod', 'preprod'].includes(name)) return 'environment';
  return 'other';
}

/** Detect Git Flow configuration from branches */
function detectGitFlow(branches: Branch[]): GitFlowConfig {
  const mainBranch = branches.find(b => b.type === 'main');
  const developBranch = branches.find(b => b.type === 'develop');

  return {
    hasMain: !!mainBranch,
    hasDevelop: !!developBranch,
    mainBranch: mainBranch?.name || 'main',
    developBranch: developBranch?.name || 'develop',
    featureBranches: branches.filter(b => b.type === 'feature'),
    releaseBranches: branches.filter(b => b.type === 'release'),
    hotfixBranches: branches.filter(b => b.type === 'hotfix'),
    environmentBranches: branches.filter(b => b.type === 'environment'),
    otherBranches: branches.filter(b => b.type === 'other'),
  };
}

/**
 * Detect migration blockers (API-based — no merge-tree check since we can't
 * do a dry-run merge without cloning). Checks structural blockers only.
 */
function detectBlockers(config: GitFlowConfig): MigrationBlocker[] {
  const blockers: MigrationBlocker[] = [];

  if (!config.hasDevelop) {
    blockers.push({
      id: 'not-gitflow',
      severity: 'critical',
      title: 'Not a Git Flow repository',
      description: 'No develop branch found. This repository does not appear to use Git Flow.',
      remediation: 'This tool is designed for Git Flow repositories. Ensure a "develop" branch exists.',
    });
    return blockers;
  }

  // Too many active feature branches
  const activeFeatures = config.featureBranches.filter(b => !b.isStale);
  if (activeFeatures.length > ACTIVE_FEATURE_THRESHOLD) {
    blockers.push({
      id: 'too-many-features',
      severity: 'critical',
      title: 'Too many active feature branches',
      description: `${activeFeatures.length} active feature branches detected (threshold: ${ACTIVE_FEATURE_THRESHOLD}).`,
      remediation: 'Reduce in-flight work by merging or closing feature branches before migrating.',
      details: { count: activeFeatures.length, threshold: ACTIVE_FEATURE_THRESHOLD },
    });
  }

  // Unmerged release branches
  const unmergedReleases = config.releaseBranches.filter(b => !b.isMerged);
  for (const release of unmergedReleases) {
    blockers.push({
      id: `unmerged-release-${release.name}`,
      severity: 'critical',
      title: `Active release branch: ${release.name}`,
      description: `Release branch "${release.name}" has not been merged into ${config.mainBranch}.`,
      remediation: `Complete the release by merging "${release.name}" into "${config.mainBranch}" and "${config.developBranch}".`,
    });
  }

  // Unmerged hotfix branches
  const unmergedHotfixes = config.hotfixBranches.filter(b => !b.isMerged);
  for (const hotfix of unmergedHotfixes) {
    blockers.push({
      id: `unmerged-hotfix-${hotfix.name}`,
      severity: 'critical',
      title: `Active hotfix branch: ${hotfix.name}`,
      description: `Hotfix branch "${hotfix.name}" has not been merged into ${config.mainBranch}.`,
      remediation: `Complete the hotfix by merging "${hotfix.name}" into "${config.mainBranch}" and "${config.developBranch}".`,
    });
  }

  return blockers;
}

/** Calculate migration readiness score (0-100) */
function calculateReadinessScore(
  config: GitFlowConfig,
  blockers: MigrationBlocker[],
  branches: Branch[],
): number {
  if (blockers.length > 0) return 0;
  if (!config.hasDevelop) return 0;

  let score = 100;

  const staleCount = branches.filter(b => b.isStale).length;
  score -= Math.min(staleCount * 2, 20);

  const activeFeatures = config.featureBranches.filter(b => !b.isStale).length;
  if (activeFeatures > 5) {
    score -= (activeFeatures - 5) * 5;
  }

  score -= config.environmentBranches.length * 5;

  const otherActive = config.otherBranches.filter(b => !b.isStale).length;
  score -= Math.min(otherActive * 3, 15);

  return Math.max(0, Math.min(100, score));
}
