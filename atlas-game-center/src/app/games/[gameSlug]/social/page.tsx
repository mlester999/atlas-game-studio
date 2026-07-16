"use client";

import { useGame } from "@/components/game/GameContext";
import { PageHeader, Panel } from "@/components/ui/Panel";
import { SystemCard } from "@/components/game/SystemCard";
import Link from "next/link";

export default function SocialPage() {
  const game = useGame();
  const socialSystems = game.systems.filter((s) => s.category === "social");

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Social Systems"
        lede={`Friendship, chat, and community systems in ${game.name}.`}
      />
      {socialSystems.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">
            No dedicated social systems defined. See{" "}
            <Link
              href={`/games/${game.slug}/multiplayer`}
              className="text-gold-400 underline-offset-2 hover:underline"
            >
              Multiplayer &amp; Social
            </Link>{" "}
            for the full checklist.
          </p>
        </Panel>
      ) : (
        socialSystems.map((s) => <SystemCard key={s.key} system={s} />)
      )}
    </div>
  );
}
