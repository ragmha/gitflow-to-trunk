import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { simpleGit } from 'simple-git';
import { analyzeRepository } from '@gf2t/core';
import type { AnalysisReport, Branch } from '@gf2t/core';
import { tmpdir } from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';

export const analyzeCommand = new Command('analyze')
  .description('Analyze a Git repository for Git Flow patterns and migration readiness')
  .argument('<target>', 'Local path or remote Git URL to analyze')
  .action(async (target: string) => {
    const spinner = ora('Analyzing repository...').start();
    let repoPath = target;
    let tempDir: string | null = null;

    try {
      // If it looks like a URL, clone to temp
      if (target.startsWith('http') || target.startsWith('git@') || target.startsWith('ssh://')) {
        spinner.text = `Cloning ${target}...`;
        tempDir = await mkdtemp(join(tmpdir(), 'gf2t-'));
        const git = simpleGit();
        await git.clone(target, tempDir);
        repoPath = tempDir;
      }

      spinner.text = 'Analyzing repository...';
      const report = await analyzeRepository(repoPath);
      spinner.stop();

      printReport(report);
    } catch (err: unknown) {
      spinner.fail(chalk.red(err instanceof Error ? err.message : String(err)));
      process.exit(1);
    } finally {
      if (tempDir) {
        await rm(tempDir, { recursive: true, force: true });
      }
    }
  });

function printReport(report: AnalysisReport): void {
  console.log();
  console.log(chalk.bold.underline('📊 Git Flow Analysis Report'));
  console.log();

  // Summary
  console.log(chalk.bold('Repository: ') + report.repoPath);
  console.log(chalk.bold('Analyzed at: ') + report.analyzedAt);
  console.log(chalk.bold('Git Flow detected: ') + (report.gitFlowDetected ? chalk.green('Yes') : chalk.red('No')));
  console.log(chalk.bold('Total branches: ') + report.totalBranches);
  console.log(chalk.bold('Active: ') + chalk.green(report.activeBranches) + chalk.bold(' | Stale: ') + chalk.yellow(report.staleBranches));
  console.log();

  // Readiness score
  const scoreColor = report.readinessScore >= 80 ? chalk.green : report.readinessScore >= 50 ? chalk.yellow : chalk.red;
  const statusIcon = report.isReady ? '✅' : '❌';
  console.log(chalk.bold('Migration Readiness: ') + scoreColor(`${report.readinessScore}/100`) + ` ${statusIcon}`);
  console.log();

  // Branch table
  const branchTable = new Table({
    head: ['Branch', 'Type', 'Age (days)', 'Ahead', 'Behind', 'Status'].map(h => chalk.cyan(h)),
    colWidths: [35, 12, 12, 8, 8, 10],
  });

  const sorted = [...report.allBranches].sort((a, b) => {
    const typeOrder: Record<Branch['type'], number> = { main: 0, develop: 1, release: 2, hotfix: 3, feature: 4, environment: 5, other: 6 };
    return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
  });

  for (const branch of sorted) {
    const status = branch.isStale ? chalk.yellow('stale') : branch.isMerged ? chalk.gray('merged') : chalk.green('active');
    branchTable.push([
      branch.name,
      branch.type,
      branch.ageInDays.toString(),
      branch.aheadOfMain.toString(),
      branch.behindMain.toString(),
      status,
    ]);
  }

  console.log(branchTable.toString());
  console.log();

  // Blockers
  if (report.blockers.length > 0) {
    console.log(chalk.bold.red('🚫 Migration Blockers:'));
    console.log();
    for (const blocker of report.blockers) {
      console.log(chalk.red(`  ✖ ${blocker.title}`));
      console.log(chalk.gray(`    ${blocker.description}`));
      console.log(chalk.yellow(`    💡 Fix: ${blocker.remediation}`));
      console.log();
    }
  } else {
    console.log(chalk.green('✅ No blockers found — this repository is ready for migration!'));
  }
}
