"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { MaybeValue } from "@/components/ui/Unknown";
import type { PlayerEarningPath } from "@/lib/types";

const GROUPS: { type: PlayerEarningPath["rewardType"]; title: string; blurb: string }[] = [
  {
    type: "in_game",
    title: "In-game earnings",
    blurb:
      "Experience, levels, items, currencies, cosmetics, reputation — value that lives inside the game.",
  },
  {
    type: "token",
    title: "Token earnings",
    blurb:
      "Future capped campaigns, claim architecture, tournaments, creator rewards. Anything here carries treasury and legal obligations.",
  },
  {
    type: "real_world",
    title: "Real-world earnings",
    blurb:
      "Approved creator programs, competitions, marketplace activity, sponsorships — real value, real review requirements.",
  },
];

function PathCard({ path }: { path: PlayerEarningPath }) {
  return (
    <Panel as="article" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-cream-100">{path.name}</h3>
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] ${
              path.active
                ? "border-emerald-500/50 bg-emerald-600/20 text-good"
                : "border-forest-700 text-muted"
            }`}
          >
            {path.active ? "ACTIVE" : "NOT ACTIVE"}
          </span>
          <StatusPill status={path.status} />
        </div>
      </div>
      <p className="text-sm text-mint-200">
        <MaybeValue value={path.earningMethod} />
      </p>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted">Requirements</dt>
          <dd className="text-mint-200">
            {path.playerRequirements.length ? path.playerRequirements.join(", ") : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Limits</dt>
          <dd className="text-mint-200">{path.limits.length ? path.limits.join(", ") : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Sustainability</dt>
          <dd className="text-mint-200">
            <MaybeValue value={path.sustainabilityMechanism} />
          </dd>
        </div>
        <div>
          <dt className="text-muted">Abuse protections</dt>
          <dd className="text-mint-200">
            {path.abuseControls.length ? path.abuseControls.join(", ") : "None defined"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Treasury dependency</dt>
          <dd
            className={
              path.treasuryDependency === "high" ? "text-warn" : "text-mint-200"
            }
          >
            {path.treasuryDependency}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Legal review</dt>
          <dd className={path.legalReviewRequired ? "text-warn" : "text-mint-200"}>
            {path.legalReviewRequired ? "Required" : "Not required"}
          </dd>
        </div>
      </dl>
      {path.risks.length > 0 && (
        <ul className="space-y-1 text-xs text-coral-400">
          {path.risks.map((r) => (
            <li key={r}>
              <span aria-hidden="true">▲</span> {r}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default function EarningsPage() {
  const game = useGame();

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Player Earnings"
        lede={`What players can earn in ${game.name}, separated by where the value lives. Nothing on this page promises profit — earnings marked inactive or undefined are exactly that.`}
      />
      {GROUPS.map((group) => {
        const paths = game.earningPaths.filter((p) => p.rewardType === group.type);
        return (
          <section key={group.type} aria-label={group.title}>
            <SectionHeading>{group.title}</SectionHeading>
            <p className="mb-3 text-xs text-muted">{group.blurb}</p>
            {paths.length === 0 ? (
              <Panel>
                <p className="text-sm text-muted">
                  No {group.title.toLowerCase()} paths defined for {game.name}.
                </p>
              </Panel>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {paths.map((p) => (
                  <PathCard key={p.key} path={p} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
