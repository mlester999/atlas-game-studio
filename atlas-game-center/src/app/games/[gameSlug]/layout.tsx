"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useGamesStore, selectGameBySlug } from "@/store/gamesStore";
import { GameProvider } from "@/components/game/GameContext";
import { gameNav } from "@/components/layout/nav";
import { StatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/lib/cn";

const groups: { key: string; label: string }[] = [
  { key: "design", label: "Design" },
  { key: "economy", label: "Economy" },
  { key: "production", label: "Production" },
  { key: "operations", label: "Operations" },
];

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ gameSlug: string }>();
  const pathname = usePathname();
  const hydrated = useGamesStore((s) => s.hydrated);
  const drafts = useGamesStore((s) => s.drafts);
  const testOverrides = useGamesStore((s) => s.testOverrides);
  const decisionOverrides = useGamesStore((s) => s.decisionOverrides);

  const game = selectGameBySlug(
    { drafts, testOverrides, decisionOverrides },
    params.gameSlug,
  );

  if (!game) {
    return (
      <div className="panel p-6">
        <h1 className="font-display text-xl text-cream-100">Game not found</h1>
        <p className="mt-2 text-sm text-mint-300">
          {hydrated
            ? `No game named “${params.gameSlug}” exists in this studio.`
            : "Loading your studio…"}
        </p>
        <Link href="/games" className="mt-3 inline-block text-sm text-gold-400 underline">
          Back to all games
        </Link>
      </div>
    );
  }

  const base = `/games/${game.slug}`;

  return (
    <GameProvider game={game}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold text-cream-100">{game.name}</h1>
        <span className="rounded-full border border-forest-700 px-2 py-0.5 text-[11px] uppercase tracking-wider text-mint-300">
          {game.developmentStage.replace(/_/g, " ")}
        </span>
        {game.currentBlocker && <StatusPill status="blocked" />}
        {game.origin !== "seed" && (
          <span className="rounded-full border border-gold-600/50 px-2 py-0.5 text-[11px] uppercase tracking-wider text-gold-400">
            {game.origin}
          </span>
        )}
      </div>

      <nav aria-label={`${game.name} sections`} className="mb-6 space-y-2">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-wrap items-center gap-1.5">
            <span className="w-20 shrink-0 text-[10px] uppercase tracking-widest text-muted">
              {group.label}
            </span>
            {gameNav
              .filter((item) => item.group === group.key)
              .map((item) => {
                const href = item.segment ? `${base}/${item.segment}` : base;
                const active = pathname === href;
                return (
                  <Link
                    key={item.segment || "overview"}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs transition-colors",
                      active
                        ? "bg-emerald-600 text-cream-100"
                        : "bg-forest-800/50 text-mint-300 hover:text-cream-100",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {children}
    </GameProvider>
  );
}
