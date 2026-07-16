"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import { PlanningEstimateNote } from "@/components/ui/Disclaimer";
import { BarChart } from "@/components/charts/BarChart";
import {
  defaultContentInputs,
  runContentLongevity,
  ContentSimError,
  type ContentInputs,
} from "@/lib/sim/content";

const COUNT_FIELDS: { key: keyof ContentInputs; label: string; max: number }[] = [
  { key: "worlds", label: "Worlds", max: 10 },
  { key: "areas", label: "Areas", max: 60 },
  { key: "creatures", label: "Creatures", max: 500 },
  { key: "towers", label: "Tower floors", max: 200 },
  { key: "crops", label: "Crops", max: 100 },
  { key: "recipes", label: "Recipes", max: 300 },
  { key: "quests", label: "Quests", max: 300 },
  { key: "activities", label: "Activities", max: 40 },
  { key: "bosses", label: "Bosses", max: 50 },
  { key: "items", label: "Items", max: 1000 },
  { key: "cosmetics", label: "Cosmetics", max: 500 },
  { key: "achievements", label: "Achievements", max: 300 },
];

export default function ContentLongevityPage() {
  const game = useGame();
  const [inputs, setInputs] = useState<ContentInputs>(defaultContentInputs());

  const { result, error } = useMemo(() => {
    try {
      return { result: runContentLongevity(inputs), error: null as string | null };
    } catch (e) {
      return { result: null, error: e instanceof ContentSimError ? e.message : "Invalid inputs" };
    }
  }, [inputs]);

  const set = (key: keyof ContentInputs, value: number | boolean) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Content Longevity Lab"
        lede={`How long ${game.name}'s content can stay interesting — per player archetype, never as one guaranteed lifespan.`}
      />
      <PlanningEstimateNote text="Scenario estimates from your assumptions. Content longevity is never one guaranteed number." />

      <div className="grid gap-4 xl:grid-cols-[minmax(300px,380px)_1fr]">
        <Panel aria-label="Content inventory">
          <SectionHeading>Content inventory</SectionHeading>
          <div className="grid grid-cols-2 gap-2">
            {COUNT_FIELDS.map((f) => (
              <label key={f.key} className="block text-xs text-mint-300">
                {f.label}
                <input
                  type="number"
                  min={0}
                  max={f.max}
                  value={inputs[f.key] as number}
                  onChange={(e) => set(f.key, Math.max(0, Number(e.target.value)))}
                  className="mt-0.5 w-full text-sm"
                />
              </label>
            ))}
          </div>
          <div className="mt-3 space-y-3">
            <label className="block text-xs text-mint-300">
              <span className="mb-0.5 flex justify-between">
                New content pieces per month
                <output className="tabular-nums text-cream-100">{inputs.releaseCadencePerMonth}</output>
              </span>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={inputs.releaseCadencePerMonth}
                onChange={(e) => set("releaseCadencePerMonth", Number(e.target.value))}
                className="w-full"
              />
            </label>
            <label className="block text-xs text-mint-300">
              <span className="mb-0.5 flex justify-between">
                Avg hours per content piece
                <output className="tabular-nums text-cream-100">{inputs.avgHoursPerPiece}</output>
              </span>
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.1}
                value={inputs.avgHoursPerPiece}
                onChange={(e) => set("avgHoursPerPiece", Number(e.target.value))}
                className="w-full"
              />
            </label>
            <label className="block text-xs text-mint-300">
              <span className="mb-0.5 flex justify-between">
                Replayability factor
                <output className="tabular-nums text-cream-100">{inputs.replayabilityFactor}</output>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={inputs.replayabilityFactor}
                onChange={(e) => set("replayabilityFactor", Number(e.target.value))}
                className="w-full"
              />
            </label>
            <label className="block text-xs text-mint-300">
              <span className="mb-0.5 flex justify-between">
                Multiplayer replay value
                <output className="tabular-nums text-cream-100">{inputs.multiplayerReplayValue}</output>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={inputs.multiplayerReplayValue}
                onChange={(e) => set("multiplayerReplayValue", Number(e.target.value))}
                className="w-full"
              />
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-mint-300">
                <input
                  type="checkbox"
                  checked={inputs.seasonalContent}
                  onChange={(e) => set("seasonalContent", e.target.checked)}
                />
                Seasonal content
              </label>
              <label className="flex items-center gap-2 text-xs text-mint-300">
                <input
                  type="checkbox"
                  checked={inputs.liveEvents}
                  onChange={(e) => set("liveEvents", e.target.checked)}
                />
                Live events
              </label>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          {error && (
            <Panel className="border-coral-500/40">
              <p className="text-sm text-coral-400">{error}</p>
            </Panel>
          )}
          {result && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="Content pieces (weighted)" value={result.totalPieces.toLocaleString()} />
                <MetricCard label="Base hours" value={result.totalBaseHours.toLocaleString()} />
                <MetricCard
                  label="Effective hours (with replay)"
                  value={result.effectiveHours.toLocaleString()}
                  tone="good"
                />
              </div>
              <Panel>
                <BarChart
                  title="Months until content exhaustion, by player archetype"
                  items={result.archetypes.map((a) => ({
                    label: a.archetype,
                    value: a.monthsUntilExhaustion ?? 0,
                    color:
                      a.monthsUntilExhaustion == null
                        ? "var(--series-1)"
                        : a.monthsUntilExhaustion < 2
                          ? "var(--series-4)"
                          : a.monthsUntilExhaustion < 6
                            ? "var(--series-2)"
                            : "var(--series-1)",
                  }))}
                  format={(v) => (v === 0 ? "keeps pace" : `${v} mo`)}
                  summary={result.recommendedCadence}
                />
                <ul className="mt-3 space-y-1 text-xs text-mint-200">
                  {result.archetypes.map((a) => (
                    <li key={a.archetype}>
                      <span className="font-medium text-cream-100">{a.archetype}</span> (
                      {a.hoursPerWeek}h/week): {a.note}
                    </li>
                  ))}
                </ul>
              </Panel>
              <div className="grid gap-4 lg:grid-cols-2">
                <Panel>
                  <SectionHeading>Bottlenecks</SectionHeading>
                  {result.bottlenecks.length === 0 ? (
                    <p className="text-sm text-good">No obvious bottlenecks in this inventory.</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-mint-200">
                      {result.bottlenecks.map((b) => (
                        <li key={b}>
                          <span aria-hidden="true" className="text-warn">◆</span> {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-xs text-muted">
                    Production burden: {result.productionBurden}
                  </p>
                  <p className="mt-1 text-xs text-muted">{result.recommendedCadence}</p>
                </Panel>
                <Panel>
                  <SectionHeading>Replayability levers</SectionHeading>
                  <ul className="space-y-1 text-sm text-mint-200">
                    {result.replayabilityIdeas.map((idea) => (
                      <li key={idea}>
                        <span aria-hidden="true" className="text-good">•</span> {idea}
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
