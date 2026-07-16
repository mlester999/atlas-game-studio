"use client";

import { useGame } from "@/components/game/GameContext";
import { PageHeader } from "@/components/ui/Panel";
import { EconomySimulator } from "@/components/game/EconomySimulator";

export default function EconomyLongevityPage() {
  const game = useGame();
  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Economy Longevity Simulator"
        lede={`Deterministic planning model for ${game.name}: population, rewards, sinks, treasury, content, and manual market scenarios. The same inputs always produce the same outputs, so runs are replayable.`}
      />
      <EconomySimulator storageKey={`economy-sim:${game.slug}`} />
    </div>
  );
}
