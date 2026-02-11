import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { analyzeRepository } from '@gf2t/core';
import type { RepoExportData } from '@gf2t/core';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const exportCommand = new Command('export')
  .description('Export repository Git data to a JSON file for web UI analysis')
  .option('-o, --output <path>', 'Output file path', 'gf2t-export.json')
  .option('-p, --path <repoPath>', 'Repository path', '.')
  .action(async (opts: { output: string; path: string }) => {
    const spinner = ora('Collecting repository data...').start();

    try {
      const repoPath = resolve(opts.path);
      const report = await analyzeRepository(repoPath);

      const exportData: RepoExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        repoPath: report.repoPath,
        branches: report.allBranches,
        gitFlowConfig: report.gitFlowConfig,
        report,
      };

      const outputPath = resolve(opts.output);
      await writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

      spinner.succeed(chalk.green(`Exported to ${outputPath}`));
      console.log();
      console.log(chalk.gray('Upload this file to the gf2t web UI for visualization.'));
    } catch (err: unknown) {
      spinner.fail(chalk.red(err instanceof Error ? err.message : String(err)));
      process.exit(1);
    }
  });
