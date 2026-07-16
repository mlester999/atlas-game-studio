"use client";

import Link from "next/link";
import { useGame } from "@/components/game/GameContext";
import { PageHeader, Panel } from "@/components/ui/Panel";
import { SystemCard } from "@/components/game/SystemCard";

export default function AssetsPage() {
  const game = useGame();
  const assetSystems = game.systems.filter((s) => s.category === "graphics");

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Assets"
        lede={`Asset systems and pipeline status for ${game.name}. The full pipeline reference and quality checklists live in the Graphics & Asset Lab.`}
      />
      {assetSystems.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">No asset systems recorded for this game yet.</p>
        </Panel>
      ) : (
        assetSystems.map((s) => <SystemCard key={s.key} system={s} />)
      )}
      <Link
        href={`/games/${game.slug}/graphics`}
        className="inline-block rounded-lg border border-forest-700 px-4 py-2 text-sm text-mint-300 hover:text-cream-100"
      >
        Open the Graphics &amp; Asset Lab →
      </Link>
    </div>
  );
}
