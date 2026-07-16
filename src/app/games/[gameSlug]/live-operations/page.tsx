"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";

const CADENCE_IDEAS = [
  { cadence: "Daily", examples: "Daily activities, shop refreshes" },
  { cadence: "Weekly", examples: "Weekly activities, boss or tower rotations" },
  { cadence: "Monthly", examples: "Monthly events, cosmetic releases, shop updates" },
  { cadence: "Seasonal", examples: "Seasons, festivals, crop seasons, sailing events" },
  { cadence: "One-off", examples: "Tournaments, creator campaigns, creature outbreaks" },
];

export default function LiveOpsPage() {
  const game = useGame();

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Live Operations"
        lede={`The operating rhythm planned for ${game.name} — every entry carries its reward budget, dependencies, and rollback plan.`}
      />

      {game.liveOps.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">
            No live operations planned yet. Live-ops planning usually starts once the core
            loop and economy are stable.
          </p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {game.liveOps.map((op) => (
            <Panel key={op.key} as="article" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold-400">
                    {op.cadence.replace(/_/g, " ")}
                  </p>
                  <h2 className="font-display text-base font-semibold text-cream-100">{op.name}</h2>
                </div>
                <StatusPill status={op.status} />
              </div>
              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-muted">Reward budget</dt>
                  <dd className="text-mint-200">{op.rewardBudget}</dd>
                </div>
                <div>
                  <dt className="text-muted">Content dependency</dt>
                  <dd className="text-mint-200">{op.contentDependency}</dd>
                </div>
                <div>
                  <dt className="text-muted">Economy impact</dt>
                  <dd className="text-mint-200">{op.economyImpact}</dd>
                </div>
                <div>
                  <dt className="text-muted">Moderation</dt>
                  <dd className="text-mint-200">{op.requiredModeration}</dd>
                </div>
                <div>
                  <dt className="text-muted">Support</dt>
                  <dd className="text-mint-200">{op.requiredSupport}</dd>
                </div>
                <div>
                  <dt className="text-muted">Testing</dt>
                  <dd className="text-mint-200">{op.requiredTesting}</dd>
                </div>
                <div>
                  <dt className="text-muted">Release owner</dt>
                  <dd className="text-mint-200">{op.releaseOwner}</dd>
                </div>
                <div>
                  <dt className="text-muted">Rollback plan</dt>
                  <dd className="text-mint-200">{op.rollbackPlan}</dd>
                </div>
              </dl>
            </Panel>
          ))}
        </div>
      )}

      <Panel>
        <SectionHeading>Cadence planner</SectionHeading>
        <p className="mb-3 text-xs text-muted">
          A reference rhythm for planning future operations.
        </p>
        <ul className="space-y-1.5">
          {CADENCE_IDEAS.map((c) => (
            <li key={c.cadence} className="flex flex-wrap gap-2 rounded-lg bg-forest-900/40 px-3 py-2 text-sm">
              <span className="w-20 font-medium text-cream-100">{c.cadence}</span>
              <span className="text-mint-200">{c.examples}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
