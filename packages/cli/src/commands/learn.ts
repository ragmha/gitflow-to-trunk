import { Command } from 'commander';
import chalk from 'chalk';
import { REFERENCE_LINKS } from '@gf2t/core';
import type { ReferenceLink } from '@gf2t/core';

export const learnCommand = new Command('learn')
  .description('Learn about trunk-based development and migration best practices')
  .option('-t, --topic <topic>', 'Filter by topic: trunk-based-dev, git-flow, feature-flags, ci-cd')
  .action((opts: { topic?: string }) => {
    console.log();
    console.log(chalk.bold.underline('📚 Git Flow → Trunk-Based Development: Learn'));
    console.log();

    // Overview
    console.log(chalk.bold('What is Trunk-Based Development?'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`
Trunk-Based Development (TBD) is a branching strategy where developers
collaborate on a single branch called "trunk" (usually ${chalk.cyan('main')}). Instead of
long-lived feature branches, developers use:

  ${chalk.green('•')} ${chalk.bold('Short-lived branches')} — merged within 1-2 days
  ${chalk.green('•')} ${chalk.bold('Feature flags')} — to hide incomplete work in production
  ${chalk.green('•')} ${chalk.bold('Continuous integration')} — every commit is tested automatically

${chalk.bold('Why migrate from Git Flow?')}
Git Flow was designed for scheduled releases. Modern teams practicing
continuous delivery find it adds unnecessary overhead:

  ${chalk.red('✖')} Long-lived branches accumulate merge conflicts
  ${chalk.red('✖')} Release branches delay delivery
  ${chalk.red('✖')} Complex branching slows onboarding

  ${chalk.green('✔')} TBD enables faster feedback loops
  ${chalk.green('✔')} Smaller changes reduce risk
  ${chalk.green('✔')} Simpler model = fewer mistakes
`);

    // Reference links
    const categories: Array<{ key: ReferenceLink['category']; label: string }> = [
      { key: 'trunk-based-dev', label: '🌳 Trunk-Based Development' },
      { key: 'git-flow', label: '🔀 Git Flow' },
      { key: 'feature-flags', label: '🚩 Feature Flags' },
      { key: 'ci-cd', label: '🔄 CI/CD Best Practices' },
    ];

    const filteredCategories = opts.topic
      ? categories.filter(c => c.key === opts.topic)
      : categories;

    console.log(chalk.bold('📖 Read More'));
    console.log(chalk.gray('─'.repeat(50)));

    for (const cat of filteredCategories) {
      console.log();
      console.log(chalk.bold(cat.label));
      const links = REFERENCE_LINKS.filter(l => l.category === cat.key);
      for (const link of links) {
        console.log(`  ${chalk.cyan('→')} ${chalk.bold(link.title)}`);
        console.log(`    ${chalk.gray(link.description)}`);
        console.log(`    ${chalk.underline.blue(link.url)}`);
      }
    }
    console.log();
  });
