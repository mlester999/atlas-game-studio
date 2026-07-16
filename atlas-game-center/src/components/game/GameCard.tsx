"use client";

import Link from "next/link";
import type { GameProject } from "@/lib/types";
import { categoryMap } from "@/data/categories";
import { StatusPill } from "@/components/ui/StatusPill";
import { analyzeGaps } from "@/lib/analysis/gapAnalyzer";

const WORLD_GLYPH: Record<string, string> = {
  cozy_planet: "🏡",
  creature_habitat: "🐾",
  pixel_town: "🏘",
  tropical_island: "🏝",
  tower: "🗼",
  draft_nebula: "✧",
};

export function GameCard({ game }: { game: GameProject }) {
  const gaps = analyzeGaps(game);
  const critical = gaps.filter((g) => g.severity === "critical" || g.severity === "blocked");

  return (
    <Link
      href={`/games/${game.slug}`}
      className="panel block space-y-2 p-4 transition-transform hover:-translate-y-0.5 hover:border-emerald-500/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">
            {WORLD_GLYPH[game.galaxyWorld] ?? "✦"}
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-cream-100">{game.name}</h3>
            <p className="text-xs text-mint-300">{game.tagline}</p>
          </div>
        </div>
        <span className="rounded-full border border-forest-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-mint-300">
          {game.developmentStage.replace(/_/g, " ")}
        </span>
      </div>
      <p className="text-xs text-muted">
        {categoryMap[game.primaryCategory]?.name ?? game.primaryCategory}
        {game.secondaryCategories.length > 0 &&
          ` · ${game.secondaryCategories
            .map((c) => categoryMap[c]?.name ?? c)
            .slice(0, 3)
            .join(" · ")}`}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {game.currentBlocker && <StatusPill status="blocked" />}
        {critical.length > 0 && (
          <span className="rounded-full border border-coral-500/40 bg-coral-500/10 px-2 py-0.5 text-[11px] text-coral-400">
            {critical.length} critical gap{critical.length > 1 ? "s" : ""}
          </span>
        )}
        {gaps.length > critical.length && (
          <span className="rounded-full border border-gold-600/40 bg-gold-600/10 px-2 py-0.5 text-[11px] text-warn">
            {gaps.length - critical.length} open gap{gaps.length - critical.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
