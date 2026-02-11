"use client";

const PROS = [
  "Faster integration — code merges to main daily, reducing merge conflicts",
  "Shorter feedback loops — CI runs on every commit, catching issues early",
  "Simpler branching — no develop, release, or hotfix branches to manage",
  "Faster releases — main is always deployable, enabling continuous delivery",
  "Better collaboration — less divergence between developers' work",
  "DORA metrics improvement — trunk-based dev correlates with elite DevOps performance",
];

const CONS = [
  "Requires mature CI/CD — automated tests and builds must be reliable",
  "Feature flags needed — incomplete features need to be hidden behind flags",
  "Cultural shift — teams used to long-lived branches need training",
  "Risk without tests — pushing directly to main without good test coverage is dangerous",
  "Code review speed — PRs need to be reviewed and merged quickly to avoid bottlenecks",
];

const REFERENCES = [
  {
    title: "Trunk Based Development",
    url: "https://trunkbaseddevelopment.com",
    category: "trunk-based-dev",
    description: "The definitive guide by Paul Hammant",
  },
  {
    title: "Google Cloud — Trunk-Based Development",
    url: "https://cloud.google.com/architecture/devops/devops-tech-trunk-based-development",
    category: "trunk-based-dev",
    description: "DORA research on delivery performance",
  },
  {
    title: "Branching Patterns — Martin Fowler",
    url: "https://martinfowler.com/articles/branching-patterns.html",
    category: "trunk-based-dev",
    description: "Comprehensive analysis of branching patterns",
  },
  {
    title: "Feature Toggles — Martin Fowler",
    url: "https://martinfowler.com/articles/feature-toggles.html",
    category: "feature-flags",
    description: "Guide to feature toggles — a key enabler for trunk-based dev",
  },
  {
    title: "Minimum Viable CD",
    url: "https://minimumcd.org",
    category: "ci-cd",
    description: "Prerequisites for trunk-based development",
  },
  {
    title: "DORA — DevOps Research",
    url: "https://dora.dev",
    category: "ci-cd",
    description: "Research on DevOps performance and delivery capabilities",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "trunk-based-dev": "#3b82f6",
  "feature-flags": "#a855f7",
  "ci-cd": "#f97316",
};

export function EducationPanel() {
  return (
    <div className="space-y-6">
      {/* Pros & Cons */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-green-900/50 bg-zinc-900 p-6">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-green-400">
            Pros of Trunk-Based Development
          </h3>
          <ul className="space-y-2">
            {PROS.map((pro, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 text-green-400">✓</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-yellow-900/50 bg-zinc-900 p-6">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-yellow-400">
            Considerations
          </h3>
          <ul className="space-y-2">
            {CONS.map((con, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 text-yellow-400">⚠</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* References */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Learn More
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REFERENCES.map((ref) => (
            <a
              key={ref.url}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-zinc-800 p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50"
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[ref.category]}20`,
                    color: CATEGORY_COLORS[ref.category],
                  }}
                >
                  {ref.category.replace(/-/g, " ")}
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-200 group-hover:text-white">
                {ref.title} ↗
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {ref.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
