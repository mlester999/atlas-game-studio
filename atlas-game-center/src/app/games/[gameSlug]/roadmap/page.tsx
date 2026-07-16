"use client";

import { useGame } from "@/components/game/GameContext";
import { useUiStore } from "@/store/uiStore";
import { Panel, PageHeader } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";

export default function RoadmapPage() {
  const game = useGame();
  const publicShare = useUiStore((s) => s.publicShareMode);
  const items = publicShare ? game.roadmap.filter((r) => r.publicSafe) : game.roadmap;

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Roadmap"
        lede={`Where ${game.name} goes next. Statuses reflect evidence — a roadmap item never claims progress that has not happened.`}
      />
      {items.length === 0 && (
        <Panel>
          <p className="text-sm text-muted">
            {publicShare ? "The public roadmap for this game is empty." : "No roadmap items yet."}
          </p>
        </Panel>
      )}
      <ol className="space-y-3">
        {items.map((item) => (
          <li key={item.key}>
            <Panel as="article" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold-400">
                    {item.phase}
                  </p>
                  <h2 className="font-display text-base font-semibold text-cream-100">
                    {item.name}
                  </h2>
                </div>
                <StatusPill status={item.status} />
              </div>
              <p className="text-sm text-mint-200">{item.description}</p>
              {item.blockers.length > 0 && (
                <p className="text-xs text-coral-400">
                  <span aria-hidden="true">⛔</span> Blocked by: {item.blockers.join(" · ")}
                </p>
              )}
            </Panel>
          </li>
        ))}
      </ol>
    </div>
  );
}
