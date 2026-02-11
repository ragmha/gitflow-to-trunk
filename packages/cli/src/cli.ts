#!/usr/bin/env node
import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze.js';
import { exportCommand } from './commands/export.js';
import { learnCommand } from './commands/learn.js';

const program = new Command();

program
  .name('gf2t')
  .description('Git Flow to Trunk-Based Development migration tool — analyze, migrate, and educate')
  .version('0.1.0');

program.addCommand(analyzeCommand);
program.addCommand(exportCommand);
program.addCommand(learnCommand);

program.parse();
