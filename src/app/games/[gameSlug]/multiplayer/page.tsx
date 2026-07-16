"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { SystemCard } from "@/components/game/SystemCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { MaybeValue } from "@/components/ui/Unknown";

const SOCIAL_CONCERNS = [
  { key: "presence", label: "Presence & movement", note: "Seeing other players live" },
  { key: "channels", label: "Channels & world isolation", note: "Capacity and sharding" },
  { key: "reconnect", label: "Reconnect", note: "Graceful recovery" },
  { key: "chat", label: "Chat", note: "Filtered, moderated communication" },
  { key: "inspection", label: "Inspection & privacy", note: "What others can see about you" },
  { key: "friends", label: "Friendship", note: "The social graph" },
  { key: "parties", label: "Parties & ready checks", note: "Small-group play" },
  { key: "guilds", label: "Guilds", note: "Large persistent groups" },
  { key: "gifts", label: "Gifts & trades", note: "Value transfer — needs atomic settlement" },
  { key: "matchmaking", label: "Matchmaking", note: "Finding partners fairly" },
  { key: "coop", label: "Cooperative activities", note: "Shared goals" },
  { key: "pvp", label: "PvP", note: "Direct competition" },
  { key: "safety", label: "Block / mute / report / moderation", note: "Non-negotiable for shared spaces" },
];

export default function MultiplayerPage() {
  const game = useGame();
  const socialSystems = game.systems.filter(
    (s) => s.category === "social" || s.category === "multiplayer",
  );

  return (
    <div className="space-y-6">
      <PageHeader
 headingLevel="h2"
 title="Multiplayer & Social" lede={game.multiplayer.summary} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Panel>
          <p className="text-[11px] uppercase tracking-wider text-muted">Mode</p>
          <p className="font-display mt-1 text-lg text-cream-100">
            <MaybeValue value={game.multiplayer.mode.replace(/_/g, " ")} />
          </p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-wider text-muted">Channel capacity</p>
          <p className="font-display mt-1 text-lg text-cream-100">
            <MaybeValue value={game.multiplayer.channelCapacity} suffix=" players" />
          </p>
        </Panel>
        <Panel>
          <p className="text-[11px] uppercase tracking-wider text-muted">Moderation</p>
          <p className="mt-1.5">
            <StatusPill status={game.multiplayer.moderationStatus} />
          </p>
        </Panel>
      </div>

      {socialSystems.length > 0 && (
        <section aria-label="Social systems" className="space-y-4">
          {socialSystems.map((s) => (
            <SystemCard key={s.key} system={s} />
          ))}
        </section>
      )}

      <Panel>
        <SectionHeading>The multiplayer checklist</SectionHeading>
        <p className="mb-3 text-xs text-muted">
          Every shared-world game eventually answers all of these. Undefined rows are
          honest gaps, not failures — but moderation gaps block everything else.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SOCIAL_CONCERNS.map((c) => {
            const matching = socialSystems.find((s) =>
              s.name.toLowerCase().includes(c.key === "safety" ? "chat" : c.key.slice(0, 5)),
            );
            return (
              <li
                key={c.key}
                className="flex items-start justify-between gap-2 rounded-lg bg-forest-900/40 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-mint-200">{c.label}</p>
                  <p className="text-[11px] text-muted">{c.note}</p>
                </div>
                <StatusPill
                  status={matching ? matching.implementationStatus : "not_yet_defined"}
                />
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
