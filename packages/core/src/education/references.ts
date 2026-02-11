import type { ReferenceLink } from '../models/types.js';

export const REFERENCE_LINKS: ReferenceLink[] = [
  // Trunk-Based Development
  {
    title: 'Trunk Based Development',
    url: 'https://trunkbaseddevelopment.com',
    category: 'trunk-based-dev',
    description: 'The definitive guide by Paul Hammant',
  },
  {
    title: 'Google Cloud — Trunk-Based Development',
    url: 'https://cloud.google.com/architecture/devops/devops-tech-trunk-based-development',
    category: 'trunk-based-dev',
    description: 'DORA research on trunk-based development and its impact on delivery performance',
  },
  {
    title: 'Atlassian — Trunk-Based Development',
    url: 'https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development',
    category: 'trunk-based-dev',
    description: "Atlassian's overview of trunk-based development practices",
  },
  {
    title: 'Branching Patterns — Martin Fowler',
    url: 'https://martinfowler.com/articles/branching-patterns.html',
    category: 'trunk-based-dev',
    description: 'Comprehensive analysis of branching patterns including trunk-based development',
  },
  // Git Flow
  {
    title: 'A Successful Git Branching Model',
    url: 'https://nvie.com/posts/a-successful-git-branching-model/',
    category: 'git-flow',
    description: 'Original Git Flow post by Vincent Driessen (includes 2020 reflection recommending simpler models)',
  },
  {
    title: 'Atlassian — Gitflow Workflow',
    url: 'https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow',
    category: 'git-flow',
    description: 'Atlassian Git Flow tutorial and workflow explanation',
  },
  // Feature Flags
  {
    title: 'Feature Toggles — Martin Fowler',
    url: 'https://martinfowler.com/articles/feature-toggles.html',
    category: 'feature-flags',
    description: 'Comprehensive guide to feature toggles (flags) — a key enabler for trunk-based development',
  },
  {
    title: 'What Are Feature Flags?',
    url: 'https://launchdarkly.com/blog/what-are-feature-flags/',
    category: 'feature-flags',
    description: 'Introduction to feature flags and how they enable continuous delivery',
  },
  // CI/CD
  {
    title: 'Minimum Viable CD',
    url: 'https://minimumcd.org',
    category: 'ci-cd',
    description: 'Minimum Viable Continuous Delivery checklist — prerequisites for trunk-based development',
  },
  {
    title: 'DORA — DevOps Research and Assessment',
    url: 'https://dora.dev',
    category: 'ci-cd',
    description: 'DORA metrics and research on DevOps performance and delivery capabilities',
  },
];

export function getLinksByCategory(category: ReferenceLink['category']): ReferenceLink[] {
  return REFERENCE_LINKS.filter(link => link.category === category);
}
