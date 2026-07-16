"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGamesStore, selectAllGames } from "@/store/gamesStore";
import { useUiStore } from "@/store/uiStore";
import { GalaxyContainer } from "@/components/galaxy/GalaxyContainer";
import { GameCard } from "@/components/game/GameCard";
import { Panel, SectionHeading } from "@/components/ui/Panel";
import { analyzeGaps } from "@/lib/analysis/gapAnalyzer";
import { categories } from "@/data/categories";
import type { GameProject } from "@/lib/types";

interface Signal {
  key: string;
  label: string;
  tone: "critical" | "warn" | "neutral";
  games: GameProject[];
  detail: (g: GameProject) => string;
}

export default function HomePage() {
  const drafts = useGamesStore((s) => s.drafts);
  const filter = useUiStore((s) => s.portfolioFilter);
  const setFilter = useUiStore((s) => s.setPortfolioFilter);

  const games = useMemo(() => selectAllGames({ drafts }), [drafts]);
  const gapsByGame = useMemo(
    () => new Map(games.map((g) => [g.slug, analyzeGaps(g)])),
    [games],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return games;
    if (filter.startsWith("stage:")) {
      return games.filter((g) => g.developmentStage === filter.slice(6));
    }
    if (filter.startsWith("cat:")) {
      const cat = filter.slice(4);
      return games.filter(
        (g) => g.primaryCategory === cat || g.secondaryCategories.includes(cat as never),
      );
    }
    if (filter === "blocked") return games.filter((g) => g.currentBlocker != null);
    if (filter === "risky") {
      return games.filter((g) =>
        (gapsByGame.get(g.slug) ?? []).some(
          (f) => f.severity === "critical" || f.severity === "blocked",
        ),
      );
    }
    return games;
  }, [filter, games, gapsByGame]);

  const signals: Signal[] = useMemo(() => {
    const has = (slug: string, rule: string) =>
      (gapsByGame.get(slug) ?? []).some((f) => f.ruleKey === rule);
    return [
      {
        key: "blocked",
        label: "Projects blocked",
        tone: "critical",
        games: games.filter((g) => g.currentBlocker != null),
        detail: (g) => g.currentBlocker ?? "",
      },
      {
        key: "no-core-loop",
        label: "No defined core loop",
        tone: "warn",
        games: games.filter((g) => has(g.slug, "undefined-core-loop")),
        detail: () => "Design the primary loop in the Gameplay Loop Builder.",
      },
      {
        key: "weak-sinks",
        label: "Weak or missing currency sinks",
        tone: "warn",
        games: games.filter((g) => has(g.slug, "strong-sources-weak-sinks")),
        detail: () => "Sources exist but no sinks are defined.",
      },
      {
        key: "incomplete-progression",
        label: "Incomplete progression",
        tone: "warn",
        games: games.filter((g) => has(g.slug, "no-late-progression")),
        detail: () => "No progression beyond early game is defined.",
      },
      {
        key: "hosted-debt",
        label: "Hosted validation debt",
        tone: "warn",
        games: games.filter((g) => has(g.slug, "local-but-unhosted")),
        detail: (g) =>
          `${g.systems.filter((s) => s.implementationStatus === "locally_complete" && s.hostedStatus !== "owner_tested").length} locally complete systems await hosted validation.`,
      },
      {
        key: "acceptance-backlog",
        label: "Owner acceptance backlog",
        tone: "neutral",
        games: games.filter((g) => has(g.slug, "no-owner-acceptance")),
        detail: (g) =>
          `${g.systems.filter((s) => s.ownerAcceptanceStatus === "acceptance_pending" || s.ownerAcceptanceStatus === "deferred").length} systems await acceptance.`,
      },
      {
        key: "art-debt",
        label: "Production-art attention",
        tone: "neutral",
        games: games.filter(
          (g) =>
            g.visualIdentity.missingAssets.length > 0 ||
            (g.visualIdentity.placeholderCount ?? 0) > 0,
        ),
        detail: (g) => g.visualIdentity.missingAssets[0] ?? "Placeholders in use.",
      },
    ];
  }, [games, gapsByGame]);

  const latestDecisions = games
    .flatMap((g) => g.decisions.map((d) => ({ game: g, decision: d })))
    .filter(({ decision }) => decision.approvalStatus === "open" || decision.approvalStatus === "recommended")
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-cream-100">
          Game Studio <span className="text-gold-400">Atlas</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-mint-300">
          Design, Economy, Progression, and Development Command Center. Explore your games
          as a living galaxy — click a world to focus it.
        </p>
      </header>

      <GalaxyContainer games={games} />

      {/* Filters */}
      <section aria-label="Portfolio filters">
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "all", label: "All games" },
            { key: "blocked", label: "Blocked" },
            { key: "risky", label: "Critical gaps" },
            { key: "stage:concept", label: "Concepts" },
            { key: "stage:in_development", label: "In development" },
            { key: "stage:testing", label: "Testing" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-xs ${
                filter === f.key
                  ? "border-gold-400 bg-forest-700/60 text-cream-100"
                  : "border-forest-700 text-mint-300 hover:text-cream-100"
              }`}
            >
              {f.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-muted">
            Category
            <select
              value={filter.startsWith("cat:") ? filter : ""}
              onChange={(e) => setFilter(e.target.value || "all")}
              aria-label="Filter by category"
            >
              <option value="">Any</option>
              {categories.map((c) => (
                <option key={c.key} value={`cat:${c.key}`}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted">No games match this filter.</p>
          )}
        </div>
      </section>

      {/* Studio signals */}
      <section aria-label="Studio signals">
        <SectionHeading>Studio signals</SectionHeading>
        <div className="grid gap-3 sm:grid-cols-2">
          {signals
            .filter((s) => s.games.length > 0)
            .map((signal) => (
              <Panel key={signal.key} className="space-y-1.5">
                <h3
                  className={`text-sm font-semibold ${
                    signal.tone === "critical"
                      ? "text-coral-400"
                      : signal.tone === "warn"
                        ? "text-warn"
                        : "text-mint-200"
                  }`}
                >
                  {signal.label}
                </h3>
                <ul className="space-y-1 text-xs text-mint-200">
                  {signal.games.map((g) => (
                    <li key={g.slug}>
                      <Link href={`/games/${g.slug}`} className="text-gold-400 underline-offset-2 hover:underline">
                        {g.name}
                      </Link>{" "}
                      — {signal.detail(g)}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
        </div>
      </section>

      {/* Decisions + next action */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel aria-label="Latest decisions">
          <SectionHeading>Decisions awaiting the owner</SectionHeading>
          {latestDecisions.length === 0 ? (
            <p className="text-sm text-muted">No open decisions.</p>
          ) : (
            <ul className="space-y-2">
              {latestDecisions.map(({ game, decision }) => (
                <li key={decision.key} className="text-sm">
                  <Link
                    href={`/games/${game.slug}/decisions`}
                    className="font-medium text-cream-100 underline-offset-2 hover:underline"
                  >
                    {decision.title}
                  </Link>
                  <span className="block text-xs text-muted">
                    {game.name} · {decision.approvalStatus}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel aria-label="Safest next action">
          <SectionHeading>Safest studio-wide next action</SectionHeading>
          <p className="text-sm leading-relaxed text-mint-200">
            Repair Starville&rsquo;s world-asset upload blocker (HTTP 503), then continue the
            owner-gated hosted economy readiness path. In parallel, run planning passes for
            SolTower and Pokentara — their core systems are honestly undefined and cost
            nothing to design now.
          </p>
          <Link
            href="/studio"
            className="mt-3 inline-block rounded-lg border border-forest-700 px-3 py-1.5 text-sm text-mint-300 hover:text-cream-100"
          >
            Open studio snapshot
          </Link>
        </Panel>
      </div>
    </div>
  );
}
