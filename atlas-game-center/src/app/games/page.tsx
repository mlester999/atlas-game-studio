"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useGamesStore, selectAllGames } from "@/store/gamesStore";
import { GameCard } from "@/components/game/GameCard";
import { PageHeader } from "@/components/ui/Panel";
import { categories } from "@/data/categories";

const stages = [
  "concept",
  "planning",
  "prototype",
  "in_development",
  "testing",
  "near_launch",
  "live",
  "paused",
];

export default function GamesPage() {
  const drafts = useGamesStore((s) => s.drafts);
  const games = useMemo(() => selectAllGames({ drafts }), [drafts]);
  const [stage, setStage] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  const filtered = games.filter((g) => {
    if (stage && g.developmentStage !== stage) return false;
    if (
      category &&
      g.primaryCategory !== category &&
      !g.secondaryCategories.includes(category as never)
    )
      return false;
    if (query && !`${g.name} ${g.tagline}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Games"
        lede="Every game workspace in the studio — seeded projects and your own drafts."
      >
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-mint-300">
            Search
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or tagline"
              className="ml-2 w-44 text-sm"
            />
          </label>
          <label className="text-xs text-mint-300">
            Stage
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="ml-2 text-sm">
              <option value="">Any</option>
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-mint-300">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="ml-2 text-sm"
            >
              <option value="">Any</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <Link
            href="/games/new"
            className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm text-cream-100 hover:bg-emerald-500"
          >
            ＋ Plan a new game
          </Link>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted">No games match.</p>}
      </div>
    </div>
  );
}
