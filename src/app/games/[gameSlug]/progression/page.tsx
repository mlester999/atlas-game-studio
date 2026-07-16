"use client";

import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProsCons } from "@/components/ui/ProsCons";
import { MaybeValue, PlanningRequired } from "@/components/ui/Unknown";

const CREATURE_TOPICS = [
  { key: "base-max", label: "Base and maximum level", hint: "How strong can creatures get?" },
  { key: "xp-sources", label: "Experience sources", hint: "Battles, quests, training" },
  { key: "evolution", label: "Evolution requirements and stages", hint: "What triggers evolution?" },
  { key: "abilities", label: "Skills, abilities, elemental types", hint: "Combat identity" },
  { key: "stats-rarity", label: "Stat growth and rarity", hint: "Growth curves per rarity tier" },
  { key: "capture", label: "Capture difficulty", hint: "Catch rates and tools" },
  { key: "healing", label: "Healing costs", hint: "A gentle recurring sink" },
  { key: "team", label: "Team limits", hint: "Party size and swapping" },
  { key: "balance", label: "PvE and PvP balance", hint: "Fairness across modes" },
  { key: "duplicates", label: "Duplicate creature use and sinks", hint: "What duplicates are for" },
  { key: "trading", label: "Trading rules", hint: "If and how creatures move between players" },
];

const CREATURE_RISKS = [
  "Power creep",
  "Overpowered rarity",
  "Pay-to-win risk",
  "Evolution grind",
  "Duplicate inflation",
  "Inaccessible starter mistakes",
  "PvP unfairness",
];

const TOWER_TOPICS = [
  { key: "floors", label: "Floor and wave progression", hint: "The visible ladder" },
  { key: "scaling", label: "Enemy scaling", hint: "Linear, polynomial, exponential?" },
  { key: "upgrades", label: "Tower upgrade levels", hint: "Power between floors" },
  { key: "unlocks", label: "Unit and hero unlocks", hint: "New tools at milestones" },
  { key: "bosses", label: "Boss milestones", hint: "Punctuation for the climb" },
  { key: "difficulty", label: "Difficulty tiers", hint: "Selectable challenge" },
  { key: "endless", label: "Endless mode", hint: "Post-campaign play" },
  { key: "modifiers", label: "Challenge modifiers", hint: "Replayability levers" },
  { key: "prestige", label: "Prestige and reset rewards", hint: "The long meta-loop" },
  { key: "variety", label: "Resource scaling and build variety", hint: "More than one viable build" },
];

const TOWER_RISKS = [
  "Exponential stat inflation",
  "Repetitive floors",
  "Impossible late game",
  "One dominant strategy",
  "Prestige abuse",
  "Idle farming",
  "Pay-to-win upgrades",
];

export default function ProgressionPage() {
  const game = useGame();
  const allCats = [game.primaryCategory, ...game.secondaryCategories];
  const isCreature = allCats.includes("creature-collector") || allCats.includes("monster-battler");
  const isTower = allCats.includes("tower-strategy") || allCats.includes("tower-defense");

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Progression Lab"
        lede={game.progressionSummary}
      />

      {game.progressionSystems.map((p) => (
        <Panel key={p.key} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted">
                {p.category.replace(/_/g, " ")}
              </p>
              <h2 className="font-display text-lg font-semibold text-cream-100">{p.name}</h2>
            </div>
            <StatusPill status={p.status} />
          </div>
          <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-muted">Level cap (current → intended)</dt>
              <dd className="text-mint-200">
                <MaybeValue value={p.currentLevelCap} /> → <MaybeValue value={p.intendedLevelCap} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">Experience curve</dt>
              <dd className="text-mint-200">
                <MaybeValue value={p.experienceCurve} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">Pacing</dt>
              <dd className="text-mint-200">
                <MaybeValue value={p.pacing} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">XP sources</dt>
              <dd className="text-mint-200">
                {p.experienceSources.length ? p.experienceSources.join(", ") : <PlanningRequired />}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Unlocks</dt>
              <dd className="text-mint-200">
                {p.unlocks.length ? p.unlocks.join(", ") : <PlanningRequired />}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Reset / prestige</dt>
              <dd className="text-mint-200">
                <MaybeValue value={p.resetBehavior} /> · <MaybeValue value={p.prestigeBehavior} />
              </dd>
            </div>
          </dl>
          <ProsCons pros={p.pros} cons={p.cons} risks={p.risks} />
        </Panel>
      ))}

      {game.progressionSystems.length === 0 && (
        <Panel>
          <p className="text-sm text-mint-200">
            No progression systems defined. <PlanningRequired />
          </p>
        </Panel>
      )}

      {isCreature && (
        <Panel>
          <SectionHeading>Creature progression planner</SectionHeading>
          <p className="mb-3 text-xs text-muted">
            The checklist every creature game must eventually answer. Unanswered topics
            stay honestly unanswered.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {CREATURE_TOPICS.map((t) => {
              const answered =
                game.progressionSystems.some(
                  (p) =>
                    (p.category === "creature_level" || p.category === "creature_evolution") &&
                    p.status !== "not_yet_defined" &&
                    p.experienceCurve !== "NOT YET DEFINED",
                ) && ["base-max", "xp-sources"].includes(t.key);
              return (
                <li key={t.key} className="flex items-start justify-between gap-2 rounded-lg bg-forest-900/40 px-3 py-2">
                  <div>
                    <p className="text-sm text-mint-200">{t.label}</p>
                    <p className="text-[11px] text-muted">{t.hint}</p>
                  </div>
                  {answered ? <StatusPill status="in_progress" /> : <StatusPill status="not_yet_defined" />}
                </li>
              );
            })}
          </ul>
          <div className="mt-3">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-coral-400">
              Watch for
            </h3>
            <p className="text-xs text-mint-200">{CREATURE_RISKS.join(" · ")}</p>
          </div>
        </Panel>
      )}

      {isTower && (
        <Panel>
          <SectionHeading>Tower progression planner</SectionHeading>
          <p className="mb-3 text-xs text-muted">
            The ladder every tower game must design. For {game.name}, everything below is
            still planning-only.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {TOWER_TOPICS.map((t) => (
              <li key={t.key} className="flex items-start justify-between gap-2 rounded-lg bg-forest-900/40 px-3 py-2">
                <div>
                  <p className="text-sm text-mint-200">{t.label}</p>
                  <p className="text-[11px] text-muted">{t.hint}</p>
                </div>
                <StatusPill status="not_yet_defined" />
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-coral-400">
              Watch for
            </h3>
            <p className="text-xs text-mint-200">{TOWER_RISKS.join(" · ")}</p>
          </div>
        </Panel>
      )}
    </div>
  );
}
