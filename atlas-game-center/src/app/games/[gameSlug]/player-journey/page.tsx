"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { NotYetDefined } from "@/components/ui/Unknown";

export default function PlayerJourneyPage() {
  const game = useGame();
  const missing = game.howToPlay.filter((s) => !s.content);

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="How to Play"
        lede={`The player's journey through ${game.name}, from the first five minutes to the returning-player experience. Missing explanations are highlighted — they are design work waiting to happen.`}
      />

      {missing.length > 0 && (
        <Panel className="border-gold-600/40">
          <p className="text-sm text-warn">
            {missing.length} of {game.howToPlay.length} journey sections are not yet
            written: {missing.slice(0, 6).map((m) => m.title).join(", ")}
            {missing.length > 6 ? "…" : ""}
          </p>
        </Panel>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {game.howToPlay.map((section) => (
          <Panel key={section.key} as="article" className={section.content ? "" : "border-dashed opacity-80"}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold text-cream-100">
                {section.title}
              </h2>
              <StatusPill status={section.status} />
            </div>
            {section.content ? (
              <p className="text-sm leading-relaxed text-mint-200">{section.content}</p>
            ) : (
              <NotYetDefined />
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
