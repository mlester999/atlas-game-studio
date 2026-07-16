"use client";

import { lazy, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import type { GameProject } from "@/lib/types";
import { buildGalaxyClusters } from "./galaxyData";
import Galaxy2D from "./Galaxy2D";
import { useIsMobile, usePageVisible, useReducedMotion } from "@/hooks/useReducedMotion";
import { useUiStore } from "@/store/uiStore";
import { StatusPill } from "@/components/ui/StatusPill";

/** Three.js loads lazily and only when actually rendered. */
const Galaxy3D = lazy(() => import("./Galaxy3D"));

export function GalaxyContainer({ games }: { games: GameProject[] }) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const visible = usePageVisible();
  const galaxyPreference = useUiStore((s) => s.galaxyPreference);
  const setGalaxyPreference = useUiStore((s) => s.setGalaxyPreference);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const clusters = useMemo(() => buildGalaxyClusters(games), [games]);
  const selected = games.find((g) => g.slug === selectedSlug) ?? null;

  const use3d =
    galaxyPreference === "3d" || (galaxyPreference === "auto" && !reduced && !isMobile);

  return (
    <section aria-label="Studio galaxy">
      <div className="panel-strong relative overflow-hidden">
        <div className="absolute right-3 top-3 z-10 flex gap-1" role="group" aria-label="Galaxy view">
          <button
            type="button"
            onClick={() => setGalaxyPreference("3d")}
            aria-pressed={use3d}
            className={`rounded-md px-2 py-1 text-[11px] ${use3d ? "bg-emerald-600 text-cream-100" : "bg-forest-900/70 text-mint-300"}`}
          >
            3D
          </button>
          <button
            type="button"
            onClick={() => setGalaxyPreference("2d")}
            aria-pressed={!use3d}
            className={`rounded-md px-2 py-1 text-[11px] ${!use3d ? "bg-emerald-600 text-cream-100" : "bg-forest-900/70 text-mint-300"}`}
          >
            2D
          </button>
        </div>
        <div className="h-[380px] sm:h-[430px]">
          {use3d ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  Charting the galaxy…
                </div>
              }
            >
              <Galaxy3D
                clusters={clusters}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
                visible={visible}
              />
            </Suspense>
          ) : (
            <div className="flex h-full items-center justify-center p-3">
              <Galaxy2D
                clusters={clusters}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
              />
            </div>
          )}
        </div>
        {/* selection detail panel */}
        {selected && (
          <div className="border-t border-forest-700/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-semibold text-cream-100">
                  {selected.name}
                </h3>
                <p className="text-xs text-mint-300">{selected.tagline}</p>
              </div>
              <div className="flex items-center gap-2">
                {selected.currentBlocker && <StatusPill status="blocked" />}
                <Link
                  href={`/games/${selected.slug}`}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-cream-100 hover:bg-emerald-500"
                >
                  Open workspace
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedSlug(null)}
                  className="rounded-lg border border-forest-700 px-3 py-1.5 text-sm text-mint-300"
                >
                  Zoom out
                </button>
              </div>
            </div>
            {selected.currentBlocker && (
              <p className="mt-2 text-xs text-coral-400">
                <span aria-hidden="true">⛔</span> Blocker: {selected.currentBlocker}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Accessible alternative — navigation never depends on the scene */}
      <nav aria-label="Games (list alternative to the galaxy)" className="mt-3">
        <ul className="flex flex-wrap gap-2">
          {clusters.flatMap((c) =>
            c.games.map((g) => (
              <li key={g.slug}>
                <button
                  type="button"
                  onClick={() => setSelectedSlug(g.slug === selectedSlug ? null : g.slug)}
                  aria-pressed={g.slug === selectedSlug}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    g.slug === selectedSlug
                      ? "border-gold-400 bg-forest-700/60 text-cream-100"
                      : "border-forest-700 text-mint-300 hover:text-cream-100"
                  }`}
                >
                  {g.name}
                  <span className="ml-1.5 text-muted">{c.name}</span>
                </button>
              </li>
            )),
          )}
        </ul>
      </nav>
    </section>
  );
}
