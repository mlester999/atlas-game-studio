"use client";

import Link from "next/link";
import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { SystemCard } from "@/components/game/SystemCard";
import { StatusPill } from "@/components/ui/StatusPill";

export default function BlockchainPage() {
  const game = useGame();
  const chainSystems = game.systems.filter((s) => s.category === "blockchain");
  const tokens = game.currencies.filter((c) => c.type === "token");

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Blockchain"
        lede={`${game.name}'s relationship with the chain: access, ownership, and hard boundaries. Token claims that are disabled stay visibly disabled — architecture is never presented as live.`}
      />

      {tokens.length > 0 && (
        <Panel>
          <SectionHeading>Tokens</SectionHeading>
          <ul className="space-y-2">
            {tokens.map((t) => (
              <li key={t.key} className="rounded-lg bg-forest-900/40 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-cream-100">
                    {t.name} ({t.symbol})
                  </span>
                  <StatusPill status={t.sustainabilityStatus} />
                </div>
                <p className="mt-1 text-xs text-mint-200">{t.purpose}</p>
                {t.limits.length > 0 && (
                  <p className="mt-1 text-xs text-muted">Boundaries: {t.limits.join(" · ")}</p>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {chainSystems.length === 0 && tokens.length === 0 ? (
        <Panel>
          <p className="text-sm text-mint-200">
            {game.name} has no defined blockchain systems. If a token layer is ever
            considered, start with the{" "}
            <Link href="/learn/play-to-earn" className="text-gold-400 underline-offset-2 hover:underline">
              Play-to-Earn Education Center
            </Link>{" "}
            before designing anything.
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {chainSystems.map((s) => (
            <SystemCard key={s.key} system={s} />
          ))}
        </div>
      )}
    </div>
  );
}
