"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGamesStore, selectAllGames } from "@/store/gamesStore";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { categories } from "@/data/categories";
import type { GameProject } from "@/lib/types";

/**
 * Studio snapshot. Completeness is described from evidence in each
 * workspace (defined vs not-yet-defined) — never as fabricated percentages.
 */

const SEED_SUMMARIES: Record<string, string> = {
  starville: "Most developed workspace.",
  pokentara: "Creature-collector wallet-auth project.",
  mythimon: "Pixel creature-collector and town-rebuilding concept.",
  sailana: "Tropical isometric sailing and adventure game.",
  soltower: "Tower-game concept requiring design planning.",
};

function defineDness(defined: number, total: number, noun: string): string {
  if (total === 0) return `No ${noun} tracked yet`;
  if (defined === 0) return `0 of ${total} ${noun} defined`;
  return `${defined} of ${total} ${noun} defined`;
}

function coreLoopCompleteness(g: GameProject): string {
  const primary = g.coreLoops.find((l) => l.kind === "primary");
  if (!primary || primary.steps.length === 0) return "Primary loop not defined";
  const others = g.coreLoops.length - 1;
  return `Primary loop defined (${primary.steps.length} steps)${
    others > 0 ? ` + ${others} more loops` : ""
  }`;
}

function progressionCompleteness(g: GameProject): string {
  const defined = g.progressionSystems.filter(
    (p) => p.status !== "not_yet_defined" && p.status !== "unknown",
  ).length;
  return defineDness(defined, g.progressionSystems.length, "progression systems");
}

function economyCompleteness(g: GameProject): string {
  if (g.currencies.length === 0) return "No currencies defined";
  return `${g.currencies.length} currencies, ${g.economySources.length} sources, ${g.economySinks.length} sinks tracked`;
}

export default function StudioPage() {
  const drafts = useGamesStore((s) => s.drafts);
  const games = useMemo(() => selectAllGames({ drafts }), [drafts]);

  const allSystems = games.flatMap((g) => g.systems.map((s) => ({ game: g, system: s })));
  const acceptanceBacklog = allSystems.filter(
    ({ system }) => system.ownerAcceptanceStatus === "acceptance_pending",
  );
  const hostedDebt = allSystems.filter(
    ({ system }) =>
      system.implementationStatus === "locally_complete" &&
      (system.hostedStatus === "hosted_pending" ||
        system.hostedStatus === "not_yet_defined"),
  );
  const blocked = games.filter((g) => g.currentBlocker != null);

  return (
    <div>
      <PageHeader
        title="Studio Snapshot"
        lede="Where every game stands right now — what is defined, what is blocked, and the safest next planning action for each."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Games tracked" value={String(games.length)} hint={`${drafts.length} drafts`} />
        <MetricCard
          label="Owner acceptance backlog"
          value={String(acceptanceBacklog.length)}
          hint="systems awaiting acceptance"
          tone={acceptanceBacklog.length > 0 ? "warn" : "good"}
        />
        <MetricCard
          label="Hosted validation debt"
          value={String(hostedDebt.length)}
          hint="locally complete, unhosted"
          tone={hostedDebt.length > 0 ? "warn" : "good"}
        />
        <MetricCard
          label="Blocked games"
          value={String(blocked.length)}
          hint={blocked.map((g) => g.name).join(", ") || "none"}
          tone={blocked.length > 0 ? "critical" : "good"}
        />
      </div>

      <div className="space-y-4">
        {games.map((g) => (
          <Panel key={g.slug} as="article" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-semibold text-cream-100">
                  <Link href={`/games/${g.slug}`} className="underline-offset-4 hover:underline">
                    {g.name}
                  </Link>
                </h2>
                <p className="text-xs text-mint-300">
                  {SEED_SUMMARIES[g.slug] ?? g.tagline}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-forest-700 px-2 py-0.5 text-[11px] text-mint-300">
                  {categories.find((c) => c.key === g.primaryCategory)?.name ??
                    g.primaryCategory}
                </span>
                <span className="rounded-full border border-forest-700 px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted">
                  {g.developmentStage.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <dl className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-muted">Core loop</dt>
                <dd className="text-mint-200">{coreLoopCompleteness(g)}</dd>
              </div>
              <div>
                <dt className="text-muted">Progression</dt>
                <dd className="text-mint-200">{progressionCompleteness(g)}</dd>
              </div>
              <div>
                <dt className="text-muted">Economy</dt>
                <dd className="text-mint-200">{economyCompleteness(g)}</dd>
              </div>
              <div>
                <dt className="text-muted">Graphics readiness</dt>
                <dd className="mt-0.5">
                  <StatusPill status={g.visualIdentity.productionArtReadiness} />
                </dd>
              </div>
              <div>
                <dt className="text-muted">Current blocker</dt>
                <dd className={g.currentBlocker ? "text-coral-400" : "text-good"}>
                  {g.currentBlocker ?? "None recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Recommended next planning action</dt>
                <dd className="text-gold-400">{g.recommendedNextAction}</dd>
              </div>
            </dl>
          </Panel>
        ))}
      </div>

      {(acceptanceBacklog.length > 0 || hostedDebt.length > 0) && (
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          {acceptanceBacklog.length > 0 && (
            <Panel>
              <SectionHeading className="text-base">Owner acceptance backlog</SectionHeading>
              <ul className="space-y-1.5 text-xs text-mint-200">
                {acceptanceBacklog.slice(0, 12).map(({ game, system }) => (
                  <li key={`${game.slug}-${system.key}`}>
                    <Link
                      href={`/games/${game.slug}/testing`}
                      className="text-mint-300 underline-offset-2 hover:underline"
                    >
                      {game.name}
                    </Link>{" "}
                    — {system.name}
                  </li>
                ))}
                {acceptanceBacklog.length > 12 && (
                  <li className="text-muted">…and {acceptanceBacklog.length - 12} more</li>
                )}
              </ul>
            </Panel>
          )}
          {hostedDebt.length > 0 && (
            <Panel>
              <SectionHeading className="text-base">Hosted validation debt</SectionHeading>
              <ul className="space-y-1.5 text-xs text-mint-200">
                {hostedDebt.slice(0, 12).map(({ game, system }) => (
                  <li key={`${game.slug}-${system.key}`}>
                    <Link
                      href={`/games/${game.slug}`}
                      className="text-mint-300 underline-offset-2 hover:underline"
                    >
                      {game.name}
                    </Link>{" "}
                    — {system.name} is locally complete but not hosted-validated
                  </li>
                ))}
                {hostedDebt.length > 12 && (
                  <li className="text-muted">…and {hostedDebt.length - 12} more</li>
                )}
              </ul>
            </Panel>
          )}
        </section>
      )}
    </div>
  );
}
