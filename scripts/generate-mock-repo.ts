/**
 * Mock Repo Generator
 *
 * Creates a realistic enterprise Git Flow repository with:
 * - Long-lived branches: main, develop, qa, staging, release/3.1
 * - 8 active feature branches, 3 stale feature branches
 * - 1 unmerged hotfix branch
 * - 50+ historical merged branches
 * - 200+ commits across 3 simulated months
 * - Multiple authors
 * - Tagged releases (v1.0, v1.1, v2.0, v2.5, v3.0)
 * - Deliberate merge conflict between develop and main
 *
 * Blockers (fixable):
 * 1. Unmerged release/3.1
 * 2. Unmerged hotfix/session-timeout
 * 3. Merge conflict between develop and main
 */

import simpleGit, { type SimpleGit } from 'simple-git';
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const AUTHORS = [
  { name: 'Alice Chen', email: 'alice@example.com' },
  { name: 'Bob Martinez', email: 'bob@example.com' },
  { name: 'Carol Singh', email: 'carol@example.com' },
  { name: 'Dave Okafor', email: 'dave@example.com' },
  { name: 'Eve Kowalski', email: 'eve@example.com' },
];

function randomAuthor() {
  return AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function writeAndCommit(
  git: SimpleGit,
  repoPath: string,
  filePath: string,
  content: string,
  message: string,
  dateOffset: number,
) {
  const fullPath = join(repoPath, filePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  await mkdir(dir, { recursive: true });
  await writeFile(fullPath, content, 'utf-8');
  await git.add(filePath);
  const author = randomAuthor();
  const date = daysAgo(dateOffset);
  await git.commit(message, undefined, {
    '--author': `${author.name} <${author.email}>`,
    '--date': date,
  });
}

async function generateMockRepo(): Promise<string> {
  const outputDir = process.argv[2];
  const repoPath = outputDir || await mkdtemp(join(tmpdir(), 'gf2t-mock-'));

  console.log(`🏗️  Generating mock Git Flow repo at: ${repoPath}`);

  const git = simpleGit(repoPath);
  await git.init();
  await git.addConfig('user.name', 'Mock Generator');
  await git.addConfig('user.email', 'mock@example.com');

  // ── Phase 1: Initial setup on main (90 days ago) ──
  console.log('  📦 Phase 1: Initial project setup...');
  await writeAndCommit(git, repoPath, 'README.md', '# Enterprise App\n\nA complex enterprise application.', 'chore: initial commit', 90);
  await writeAndCommit(git, repoPath, 'package.json', '{"name": "enterprise-app", "version": "1.0.0"}', 'chore: add package.json', 90);
  await writeAndCommit(git, repoPath, 'src/index.ts', 'export const app = "enterprise-app";', 'feat: add entry point', 89);
  await writeAndCommit(git, repoPath, 'src/config.ts', 'export const config = { port: 3000 };', 'feat: add config', 89);
  await writeAndCommit(git, repoPath, 'src/auth/login.ts', 'export function login() { return true; }', 'feat: add auth module', 88);
  await writeAndCommit(git, repoPath, 'src/auth/session.ts', 'export function createSession() { return "session"; }', 'feat: add session management', 88);
  await git.addTag('v1.0');

  // ── Phase 2: Create develop branch ──
  console.log('  🌿 Phase 2: Creating develop branch...');
  await git.checkoutLocalBranch('develop');

  // Add commits to develop
  for (let i = 0; i < 15; i++) {
    await writeAndCommit(git, repoPath, `src/modules/module-${i}.ts`,
      `export const module${i} = { id: ${i} };`,
      `feat: add module ${i}`, 87 - i);
  }

  // ── Phase 3: Create and merge historical feature branches (50+) ──
  console.log('  📜 Phase 3: Creating 50+ historical branches...');
  const historicalFeatures = [
    'user-profile', 'settings-page', 'email-notifications', 'password-reset',
    'two-factor-auth', 'admin-panel', 'role-management', 'audit-log',
    'data-import', 'data-export-v1', 'bulk-operations', 'search-v1',
    'pagination', 'sorting', 'filtering', 'caching-layer',
    'rate-limiting', 'api-versioning', 'webhook-support', 'oauth-provider',
    'saml-sso', 'ldap-integration', 'file-upload', 'image-processing',
    'pdf-generation', 'csv-import', 'reporting-v1', 'dashboard-v1',
    'charts-widget', 'notification-center', 'activity-feed', 'comments',
    'mentions', 'tagging', 'categories', 'permissions-v1',
    'permissions-v2', 'billing-module', 'subscription-mgmt', 'invoice-gen',
    'payment-gateway', 'refund-handling', 'tax-calculation', 'currency-support',
    'i18n-setup', 'l10n-strings', 'timezone-support', 'calendar-widget',
    'scheduling', 'reminders', 'mobile-api', 'push-notifications',
  ];

  for (let i = 0; i < historicalFeatures.length; i++) {
    const featureName = historicalFeatures[i];
    const dayOffset = 85 - Math.floor(i * 1.5);
    if (dayOffset < 20) break;

    await git.checkout('develop');
    await git.checkoutLocalBranch(`feature/${featureName}`);

    // 1-3 commits per feature
    const commitCount = 1 + Math.floor(Math.random() * 3);
    for (let c = 0; c < commitCount; c++) {
      await writeAndCommit(git, repoPath, `src/features/${featureName}/index.ts`,
        `export const ${featureName.replace(/-/g, '_')} = { version: ${c + 1} };`,
        `feat(${featureName}): ${c === 0 ? 'initial implementation' : `iteration ${c + 1}`}`,
        dayOffset - c);
    }

    // Merge back to develop
    await git.checkout('develop');
    await git.merge([`feature/${featureName}`, '--no-ff', '-m', `Merge branch 'feature/${featureName}' into develop`]);
  }

  // ── Phase 4: Release branches & tags ──
  console.log('  🏷️  Phase 4: Creating releases...');

  // v1.1 release
  await git.checkout('develop');
  await git.checkoutLocalBranch('release/1.1');
  await writeAndCommit(git, repoPath, 'CHANGELOG.md', '# v1.1\n- Feature updates', 'chore: prepare v1.1 release', 70);
  await git.checkout('main');
  await git.merge(['release/1.1', '--no-ff', '-m', "Merge branch 'release/1.1'"]);
  await git.addTag('v1.1');
  await git.checkout('develop');
  await git.merge(['release/1.1', '--no-ff', '-m', "Merge release/1.1 back into develop"]);

  // v2.0 release
  await git.checkout('develop');
  await git.checkoutLocalBranch('release/2.0');
  await writeAndCommit(git, repoPath, 'CHANGELOG.md', '# v2.0\n- Major update\n# v1.1\n- Feature updates', 'chore: prepare v2.0 release', 50);
  await git.checkout('main');
  await git.merge(['release/2.0', '--no-ff', '-m', "Merge branch 'release/2.0'"]);
  await git.addTag('v2.0');
  await git.checkout('develop');
  await git.merge(['release/2.0', '--no-ff', '-m', "Merge release/2.0 back into develop"]);

  // v2.5 release
  await git.checkout('develop');
  await git.checkoutLocalBranch('release/2.5');
  await writeAndCommit(git, repoPath, 'CHANGELOG.md', '# v2.5\n- Improvements\n# v2.0\n- Major update', 'chore: prepare v2.5 release', 35);
  await git.checkout('main');
  await git.merge(['release/2.5', '--no-ff', '-m', "Merge branch 'release/2.5'"]);
  await git.addTag('v2.5');
  await git.checkout('develop');
  await git.merge(['release/2.5', '--no-ff', '-m', "Merge release/2.5 back into develop"]);

  // v3.0 release
  await git.checkout('develop');
  await git.checkoutLocalBranch('release/3.0');
  await writeAndCommit(git, repoPath, 'CHANGELOG.md', '# v3.0\n- Platform rewrite\n# v2.5\n- Improvements', 'chore: prepare v3.0 release', 20);
  await git.checkout('main');
  await git.merge(['release/3.0', '--no-ff', '-m', "Merge branch 'release/3.0'"]);
  await git.addTag('v3.0');
  await git.checkout('develop');
  await git.merge(['release/3.0', '--no-ff', '-m', "Merge release/3.0 back into develop"]);

  // ── Phase 5: Environment branches ──
  console.log('  🌍 Phase 5: Creating environment branches...');
  await git.checkout('main');
  await git.checkoutLocalBranch('staging');
  await writeAndCommit(git, repoPath, '.env.staging', 'ENV=staging', 'chore: add staging config', 15);

  await git.checkout('develop');
  await git.checkoutLocalBranch('qa');
  await writeAndCommit(git, repoPath, '.env.qa', 'ENV=qa', 'chore: add QA config', 15);

  // ── Phase 6: Active feature branches (8) ──
  console.log('  🚀 Phase 6: Creating 8 active feature branches...');
  const activeFeatures = [
    { name: 'user-dashboard', desc: 'New dashboard UI', age: 5 },
    { name: 'payment-v2', desc: 'Payment system rewrite', age: 12 },
    { name: 'notifications', desc: 'Push notification system', age: 3 },
    { name: 'search-api', desc: 'Search endpoint', age: 8 },
    { name: 'dark-mode', desc: 'Theme support', age: 2 },
    { name: 'analytics', desc: 'Usage analytics', age: 15 },
    { name: 'onboarding', desc: 'User onboarding flow', age: 7 },
    { name: 'export-csv', desc: 'Data export feature', age: 10 },
  ];

  for (const feat of activeFeatures) {
    await git.checkout('develop');
    await git.checkoutLocalBranch(`feature/${feat.name}`);
    await writeAndCommit(git, repoPath, `src/features/${feat.name}/index.ts`,
      `// ${feat.desc}\nexport const ${feat.name.replace(/-/g, '_')} = { active: true };`,
      `feat(${feat.name}): ${feat.desc}`, feat.age);
    await writeAndCommit(git, repoPath, `src/features/${feat.name}/utils.ts`,
      `export function ${feat.name.replace(/-/g, '_')}_helper() { return true; }`,
      `feat(${feat.name}): add utilities`, feat.age - 1);
  }

  // ── Phase 7: Stale feature branches (3, >90 days old) ──
  console.log('  🧟 Phase 7: Creating 3 stale feature branches...');
  const staleFeatures = [
    { name: 'legacy-auth', age: 120 },
    { name: 'old-reports', age: 95 },
    { name: 'deprecated-api', age: 180 },
  ];

  for (const feat of staleFeatures) {
    await git.checkout('develop');
    await git.checkoutLocalBranch(`feature/${feat.name}`);
    await writeAndCommit(git, repoPath, `src/features/${feat.name}/index.ts`,
      `// Stale feature\nexport const ${feat.name.replace(/-/g, '_')} = { stale: true };`,
      `feat(${feat.name}): initial work (abandoned)`, feat.age);
  }

  // ── Phase 8: Unmerged release/3.1 (BLOCKER) ──
  console.log('  🚫 Phase 8: Creating unmerged release/3.1 (blocker)...');
  await git.checkout('develop');
  await git.checkoutLocalBranch('release/3.1');
  await writeAndCommit(git, repoPath, 'CHANGELOG.md', '# v3.1 (unreleased)\n- New features pending\n# v3.0\n- Platform rewrite', 'chore: prepare v3.1 release', 5);
  await writeAndCommit(git, repoPath, 'src/release-notes.ts', 'export const version = "3.1.0-rc.1";', 'chore: bump version to 3.1.0-rc.1', 4);

  // ── Phase 9: Unmerged hotfix (BLOCKER) ──
  console.log('  🚫 Phase 9: Creating unmerged hotfix/session-timeout (blocker)...');
  await git.checkout('main');
  await git.checkoutLocalBranch('hotfix/session-timeout');
  await writeAndCommit(git, repoPath, 'src/auth/session.ts',
    'export function createSession() { return "session"; }\nexport const SESSION_TIMEOUT = 3600; // fixed timeout bug',
    'fix: resolve session timeout vulnerability', 2);

  // ── Phase 10: Create merge conflict (BLOCKER) ──
  console.log('  🚫 Phase 10: Creating merge conflict between develop and main...');

  // Add conflicting change on main
  await git.checkout('main');
  await writeAndCommit(git, repoPath, 'src/config.ts',
    'export const config = { port: 3000, version: "3.0.1-hotfix" };',
    'fix: update config version on main', 1);

  // Add conflicting change on develop
  await git.checkout('develop');
  await writeAndCommit(git, repoPath, 'src/config.ts',
    'export const config = { port: 8080, version: "3.1.0-dev", debug: true };',
    'feat: update config for development', 1);

  // Back to main
  await git.checkout('main');

  // ── Summary ──
  const branches = await git.branch(['-a']);
  const branchCount = Object.keys(branches.branches).length;
  const logResult = await git.log(['--all', '--oneline']);
  const commitCount = logResult.total;

  console.log();
  console.log(`✅ Mock repo generated successfully!`);
  console.log(`   📂 Path: ${repoPath}`);
  console.log(`   🌿 Branches: ${branchCount}`);
  console.log(`   📝 Commits: ${commitCount}`);
  console.log();
  console.log(`🚫 Blockers (fixable):`);
  console.log(`   1. Unmerged release/3.1`);
  console.log(`   2. Unmerged hotfix/session-timeout`);
  console.log(`   3. Merge conflict in src/config.ts (develop ↔ main)`);
  console.log();
  console.log(`🧪 Test with:`);
  console.log(`   npx gf2t analyze ${repoPath}`);

  return repoPath;
}

generateMockRepo().catch(err => {
  console.error('Failed to generate mock repo:', err);
  process.exit(1);
});
