"use client";

import Link from "next/link";
import { useGame } from "@/components/game/GameContext";
import { useUiStore } from "@/store/uiStore";
import { Panel, SectionHeading } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import { MaybeValue } from "@/components/ui/Unknown";
import { StatusPill } from "@/components/ui/StatusPill";
import { categoryMap } from "@/data/categories";
import { analyzeGaps } from "@/lib/analysis/gapAnalyzer";

export default function GameOverviewPage() {
  const game = useGame();
  const mode = useUiStore((s) => s.viewingMode);
  const gaps = analyzeGaps(game);
  const critical = gaps.filter((g) => g.severity === "critical" || g.severity === "blocked");

  const implemented = game.systems.filter(
    (s) => s.implementationStatus === "locally_complete" || s.implementationStatus === "owner_tested",
  ).length;
  const planned = game.systems.filter(
    (s) => s.implementationStatus === "planned" || s.implementationStatus === "not_yet_defined",
  ).length;
  const blocked = game.systems.filter((s) => s.implementationStatus === "blocked").length;

  return (
    <div className="space-y-6">
      <Panel>
        <p className="text-sm leading-relaxed text-mint-200">{game.description}</p>
        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-muted">Primary category</dt>
            <dd className="text-cream-100">
              {categoryMap[game.primaryCategory]?.name ?? game.primaryCategory}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Also</dt>
            <dd className="text-mint-200">
              {game.secondaryCategories.map((c) => categoryMap[c]?.name ?? c).join(" · ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Audience</dt>
            <dd className="text-mint-200">
              <MaybeValue value={game.targetAudience} />
            </dd>
          </div>
          <div>
            <dt className="text-muted">Platforms</dt>
            <dd className="text-mint-200">{game.platforms.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Current focus</dt>
            <dd className="text-mint-200">{game.currentFocus}</dd>
          </div>
          <div>
            <dt className="text-muted">Last verified update</dt>
            <dd className="text-mint-200">{game.latestVerifiedUpdate}</dd>
          </div>
        </dl>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Systems built (local)" value={String(implemented)} tone="good" hint="Locally complete or owner tested" />
        <MetricCard label="Systems in planning" value={String(planned)} hint="Planned or not yet defined" />
        <MetricCard
          label="Blocked systems"
          value={String(blocked)}
          tone={blocked > 0 ? "critical" : "neutral"}
        />
        <MetricCard
          label="Open gaps"
          value={String(gaps.length)}
          tone={critical.length > 0 ? "critical" : gaps.length > 0 ? "warn" : "good"}
          hint={critical.length > 0 ? `${critical.length} critical` : undefined}
        />
      </div>

      {game.currentBlocker && (
        <Panel className="border-coral-500/40">
          <SectionHeading className="text-coral-400">Current blocker</SectionHeading>
          <p className="text-sm text-mint-200">{game.currentBlocker}</p>
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionHeading>Summaries</SectionHeading>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Progression</dt>
              <dd className="text-mint-200">
                <MaybeValue value={game.progressionSummary} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Economy</dt>
              <dd className="text-mint-200">
                <MaybeValue value={game.economySummary} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Multiplayer</dt>
              <dd className="text-mint-200">
                <MaybeValue value={game.multiplayerSummary || game.multiplayer.summary} />
              </dd>
            </div>
            {mode === "technical" && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Technology</dt>
                <dd className="text-mint-200">
                  <MaybeValue value={game.technologySummary} />
                </dd>
              </div>
            )}
          </dl>
        </Panel>
        <Panel>
          <SectionHeading>Recommended next action</SectionHeading>
          <p className="text-sm leading-relaxed text-mint-200">{game.recommendedNextAction}</p>
          {critical.length > 0 && (
            <div className="mt-3 space-y-1">
              {critical.map((c) => (
                <p key={c.ruleKey} className="text-xs text-coral-400">
                  <span aria-hidden="true">▲</span> {c.title}
                </p>
              ))}
              <Link
                href={`/games/${game.slug}/risks`}
                className="inline-block text-xs text-gold-400 underline-offset-2 hover:underline"
              >
                See all gaps and risks →
              </Link>
            </div>
          )}
        </Panel>
      </div>

      <Panel>
        <SectionHeading>Systems at a glance</SectionHeading>
        <ul className="grid gap-2 sm:grid-cols-2">
          {game.systems.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-2 rounded-lg bg-forest-900/40 px-3 py-2">
              <span className="text-sm text-mint-200">{s.name}</span>
              <StatusPill status={s.implementationStatus} />
            </li>
          ))}
          {game.systems.length === 0 && (
            <li className="text-sm text-muted">No systems defined yet.</li>
          )}
        </ul>
      </Panel>
    </div>
  );
}
