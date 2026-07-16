"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useGamesStore, selectAllGames } from "@/store/gamesStore";
import { Panel, PageHeader } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { categories } from "@/data/categories";
import type { GameProject } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Comparison workspace. Values come straight from each game's data —
 * unknowns stay visibly unknown and no scores are fabricated.
 */

const ND = "NOT YET DEFINED";

function catName(key: string | null): string {
  if (!key) return ND;
  return categories.find((c) => c.key === key)?.name ?? key;
}

interface CompareRow {
  label: string;
  value: (g: GameProject) => React.ReactNode;
}

const text = (v: string | null | undefined) =>
  !v || v === ND ? <span className="text-muted">{ND}</span> : v;

const ROWS: CompareRow[] = [
  { label: "Primary category", value: (g) => catName(g.primaryCategory) },
  {
    label: "Secondary categories",
    value: (g) =>
      g.secondaryCategories.length
        ? g.secondaryCategories.map(catName).join(", ")
        : text(null),
  },
  {
    label: "Development stage",
    value: (g) => g.developmentStage.replace(/_/g, " "),
  },
  {
    label: "Core loop",
    value: (g) => {
      const primary = g.coreLoops.find((l) => l.kind === "primary");
      if (!primary || primary.steps.length === 0) return text(null);
      return `${primary.steps.map((s) => s.label).join(" → ")} (${primary.status.replace(/_/g, " ")})`;
    },
  },
  { label: "Progression", value: (g) => text(g.progressionSummary) },
  {
    label: "Leveling caps",
    value: (g) => {
      const withCaps = g.progressionSystems.filter((p) => p.intendedLevelCap != null);
      if (withCaps.length === 0) return text(null);
      return withCaps.map((p) => `${p.name}: ${p.intendedLevelCap}`).join("; ");
    },
  },
  {
    label: "Visual style",
    value: (g) =>
      g.visualIdentity.dimension === "not_yet_defined"
        ? text(null)
        : `${g.visualIdentity.dimension.toUpperCase()}${
            g.visualIdentity.pixelArt == null
              ? ""
              : g.visualIdentity.pixelArt
                ? " pixel"
                : " non-pixel"
          }, ${g.visualIdentity.viewpoint.replace(/_/g, " ")}`,
  },
  { label: "Multiplayer", value: (g) => text(g.multiplayerSummary) },
  {
    label: "Social depth",
    value: (g) => {
      const social = g.systems.filter(
        (s) => s.category === "social" || s.category === "multiplayer",
      );
      return social.length
        ? `${social.length} social/multiplayer systems tracked`
        : text(null);
    },
  },
  { label: "Economy", value: (g) => text(g.economySummary) },
  {
    label: "Currencies",
    value: (g) =>
      g.currencies.length
        ? g.currencies.map((c) => `${c.name}${c.onChain ? " (on-chain)" : ""}`).join(", ")
        : text(null),
  },
  {
    label: "Earning model",
    value: (g) => {
      if (g.earningPaths.length === 0) return text(null);
      const active = g.earningPaths.filter((p) => p.active).length;
      return `${g.earningPaths.length} paths tracked, ${active} active`;
    },
  },
  {
    label: "Content longevity",
    value: (g) =>
      g.contentPlans.length ? `${g.contentPlans.length} content plans tracked` : text(null),
  },
  {
    label: "Graphics readiness",
    value: (g) => <StatusPill status={g.visualIdentity.productionArtReadiness} />,
  },
  {
    label: "Admin readiness",
    value: (g) => {
      const admin = g.systems.filter((s) => s.category === "admin");
      return admin.length ? `${admin.length} admin systems tracked` : text(null);
    },
  },
  {
    label: "Live operations",
    value: (g) => (g.liveOps.length ? `${g.liveOps.length} planned entries` : text(null)),
  },
  {
    label: "Testing debt",
    value: (g) => {
      if (g.tests.length === 0) return text(null);
      const untested = g.tests.filter((t) => t.state === "not_tested").length;
      const failed = g.tests.filter((t) => t.state === "failed").length;
      return `${g.tests.length} tests: ${untested} not run, ${failed} failed`;
    },
  },
  {
    label: "Security & risk",
    value: (g) => {
      const open = g.risks.filter((r) => r.status === "open");
      return open.length
        ? `${open.length} open risks (${open.filter((r) => r.severity === "critical" || r.severity === "blocked").length} critical/blocked)`
        : g.risks.length
          ? "No open risks tracked"
          : text(null);
    },
  },
  {
    label: "Blockchain",
    value: (g) => {
      const onChain = g.currencies.filter((c) => c.onChain);
      const walletGated =
        g.primaryCategory === "wallet-gated" ||
        g.secondaryCategories.includes("wallet-gated");
      if (onChain.length === 0 && !walletGated) return "None planned or tracked";
      return [
        walletGated ? "wallet-gated access" : null,
        onChain.length ? `${onChain.length} on-chain assets` : null,
      ]
        .filter(Boolean)
        .join("; ");
    },
  },
  {
    label: "Development complexity (category-typical)",
    value: (g) => {
      const cat = categories.find((c) => c.key === g.primaryCategory);
      return cat ? `${cat.developmentComplexity} (typical for ${cat.name})` : text(null);
    },
  },
  {
    label: "Current blocker",
    value: (g) =>
      g.currentBlocker ? (
        <span className="text-coral-400">{g.currentBlocker}</span>
      ) : (
        <span className="text-good">None recorded</span>
      ),
  },
];

export default function ComparePage() {
  const drafts = useGamesStore((s) => s.drafts);
  const games = useMemo(() => selectAllGames({ drafts }), [drafts]);
  const [selected, setSelected] = useState<string[]>(["starville", "pokentara"]);

  const chosen = selected
    .map((slug) => games.find((g) => g.slug === slug))
    .filter((g): g is GameProject => Boolean(g));

  const toggle = (slug: string) =>
    setSelected((s) =>
      s.includes(slug) ? s.filter((x) => x !== slug) : s.length >= 3 ? s : [...s, slug],
    );

  return (
    <div>
      <PageHeader
        title="Compare Games"
        lede="Side-by-side comparison across design, economy, and production. Values come straight from each workspace — unknowns stay unknown, and nothing is scored without evidence."
      />

      <fieldset className="mb-5">
        <legend className="mb-2 text-xs text-mint-300">Pick up to three games</legend>
        <div className="flex flex-wrap gap-1.5">
          {games.map((g) => {
            const on = selected.includes(g.slug);
            return (
              <button
                key={g.slug}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(g.slug)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  on
                    ? "border-emerald-500 bg-emerald-600/25 text-cream-100"
                    : "border-forest-700 text-mint-300 hover:text-cream-100",
                )}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      {chosen.length < 2 ? (
        <Panel>
          <p className="text-sm text-mint-300">Choose at least two games to compare.</p>
        </Panel>
      ) : (
        <Panel className="overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[640px] text-left text-xs">
            <caption className="sr-only">Game comparison table</caption>
            <thead>
              <tr className="border-b border-forest-700/60">
                <th scope="col" className="sticky left-0 bg-forest-850/95 px-4 py-3 text-muted">
                  Aspect
                </th>
                {chosen.map((g) => (
                  <th key={g.slug} scope="col" className="px-4 py-3">
                    <Link
                      href={`/games/${g.slug}`}
                      className="font-display text-sm text-cream-100 underline-offset-2 hover:underline"
                    >
                      {g.name}
                    </Link>
                    <span className="block font-normal text-muted">{g.tagline}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-forest-800/60 align-top">
                  <th
                    scope="row"
                    className="sticky left-0 bg-forest-850/95 px-4 py-2.5 font-medium text-mint-300"
                  >
                    {row.label}
                  </th>
                  {chosen.map((g) => (
                    <td key={g.slug} className="max-w-72 px-4 py-2.5 text-mint-200">
                      {row.value(g)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
