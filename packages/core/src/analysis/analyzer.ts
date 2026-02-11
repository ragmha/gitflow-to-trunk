import simpleGit, { type SimpleGit } from 'simple-git';
import type { Branch, GitFlowConfig, AnalysisReport, MigrationBlocker } from '../models/types.js';

const STALE_THRESHOLD_DAYS = 90;
const ACTIVE_FEATURE_THRESHOLD = 10;

/** Analyze a Git repository for Git Flow patterns and migration readiness */
export async function analyzeRepository(repoPath: string): Promise<AnalysisReport> {
  const git: SimpleGit = simpleGit(repoPath);

  // Verify it's a git repo
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error(`Not a git repository: ${repoPath}`);
  }

  await git.fetch(['--all', '--prune']);

  const branches = await collectBranches(git);
  const gitFlowConfig = detectGitFlow(branches);
  const blockers = await detectBlockers(git, gitFlowConfig, branches);

  const activeBranches = branches.filter(b => !b.isStale);
  const staleBranches = branches.filter(b => b.isStale);

  const readinessScore = calculateReadinessScore(gitFlowConfig, blockers, branches);

  return {
    repoPath,
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

/** Collect all branches with metadata */
async function collectBranches(git: SimpleGit): Promise<Branch[]> {
  const branchSummary = await git.branch(['-a', '--no-color']);
  const branches: Branch[] = [];

  for (const branchName of Object.keys(branchSummary.branches)) {
    // Skip remote tracking refs that duplicate local branches
    const cleanName = branchName.replace(/^remotes\/origin\//, '');
    if (branchName.startsWith('remotes/') && branches.some(b => b.name === cleanName)) {
      continue;
    }

    const name = cleanName;
    if (name === 'HEAD') continue;

    try {
      const log = await git.log({ maxCount: 1, from: branchName });
      const latest = log.latest;
      if (!latest) continue;

      const mainBranch = branchSummary.branches['main'] ? 'main' : 'master';
      let aheadBehind = { ahead: 0, behind: 0 };
      try {
        const result = await git.raw(['rev-list', '--left-right', '--count', `${mainBranch}...${branchName}`]);
        const [behind, ahead] = result.trim().split(/\s+/).map(Number);
        aheadBehind = { ahead: ahead || 0, behind: behind || 0 };
      } catch {
        // Branch may not share history with main
      }

      const commitDate = new Date(latest.date);
      const ageInDays = Math.floor((Date.now() - commitDate.getTime()) / (1000 * 60 * 60 * 24));

      // Check if branch is merged into main
      let isMerged = false;
      try {
        const merged = await git.branch(['--merged', mainBranch]);
        isMerged = Object.keys(merged.branches).some(b => b === branchName || b === name);
      } catch {
        // Ignore errors
      }

      branches.push({
        name,
        type: classifyBranch(name),
        lastCommitDate: latest.date,
        lastCommitHash: latest.hash,
        lastCommitMessage: latest.message,
        author: latest.author_name,
        aheadOfMain: aheadBehind.ahead,
        behindMain: aheadBehind.behind,
        isStale: ageInDays > STALE_THRESHOLD_DAYS,
        isMerged,
        ageInDays,
      });
    } catch {
      // Skip branches we can't read
    }
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return branches.filter(b => {
    if (seen.has(b.name)) return false;
    seen.add(b.name);
    return true;
  });
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

/** Detect migration blockers */
async function detectBlockers(
  git: SimpleGit,
  config: GitFlowConfig,
  branches: Branch[],
): Promise<MigrationBlocker[]> {
  const blockers: MigrationBlocker[] = [];

  // 1. Not Git Flow
  if (!config.hasDevelop) {
    blockers.push({
      id: 'not-gitflow',
      severity: 'critical',
      title: 'Not a Git Flow repository',
      description: 'No develop branch found. This repository does not appear to use Git Flow.',
      remediation: 'This tool is designed for Git Flow repositories. Ensure a "develop" branch exists.',
    });
    return blockers; // No point checking further
  }

  // 2. Merge conflicts between develop and main
  try {
    // Try a dry-run merge to detect conflicts
    const mainBranch = config.mainBranch;
    const developBranch = config.developBranch;

    try {
      await git.raw(['merge-tree', '--write-tree', mainBranch, developBranch]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('CONFLICT') || message.includes('merge conflict')) {
        blockers.push({
          id: 'merge-conflicts',
          severity: 'critical',
          title: 'Unresolved merge conflicts',
          description: `develop and ${mainBranch} have merge conflicts that must be resolved before migration.`,
          remediation: `Resolve merge conflicts between "${developBranch}" and "${mainBranch}" manually, then re-run analysis.`,
        });
      }
    }
  } catch {
    // merge-tree not available, skip this check
  }

  // 3. Too many active feature branches
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

  // 4. Unmerged release branches
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

  // 5. Unmerged hotfix branches
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

  // Deduct for stale branches (clutter)
  const staleCount = branches.filter(b => b.isStale).length;
  score -= Math.min(staleCount * 2, 20);

  // Deduct for many active features (close to threshold)
  const activeFeatures = config.featureBranches.filter(b => !b.isStale).length;
  if (activeFeatures > 5) {
    score -= (activeFeatures - 5) * 5;
  }

  // Deduct for environment branches (extra complexity)
  score -= config.environmentBranches.length * 5;

  // Deduct for other unclassified branches
  const otherActive = config.otherBranches.filter(b => !b.isStale).length;
  score -= Math.min(otherActive * 3, 15);

  return Math.max(0, Math.min(100, score));
}
