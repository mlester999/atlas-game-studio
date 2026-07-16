"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/components/game/GameContext";
import { Panel, PageHeader, SectionHeading } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import { PlanningEstimateNote } from "@/components/ui/Disclaimer";
import { LineChart } from "@/components/charts/LineChart";
import {
  defaultLevelCurveInputs,
  runLevelCurve,
  LevelingError,
  type LevelCurveInputs,
} from "@/lib/sim/leveling";

const FIELDS: {
  key: keyof LevelCurveInputs;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "startingXpRequirement", label: "Starting XP requirement", min: 10, max: 2000, step: 10 },
  { key: "xpGrowthRate", label: "XP growth rate (× per level)", min: 1, max: 1.6, step: 0.01 },
  { key: "maxLevel", label: "Maximum level", min: 2, max: 200, step: 1 },
  { key: "avgXpPerActivity", label: "Average XP per activity", min: 1, max: 500, step: 1 },
  { key: "activitiesPerSession", label: "Activities per session", min: 1, max: 60, step: 1 },
  { key: "sessionsPerDay", label: "Sessions per day", min: 0.25, max: 8, step: 0.25 },
  { key: "targetDaysToMax", label: "Target days to max level", min: 0, max: 720, step: 5 },
  { key: "catchUpMultiplier", label: "Catch-up multiplier (early half)", min: 0, max: 2, step: 0.1 },
  { key: "restedXpBonus", label: "Rested XP bonus (fraction)", min: 0, max: 1, step: 0.05 },
  { key: "dailyActivityLimit", label: "Daily activity limit (0 = none)", min: 0, max: 200, step: 5 },
];

export default function LevelingPage() {
  const game = useGame();
  const [inputs, setInputs] = useState<LevelCurveInputs>(defaultLevelCurveInputs());

  const { result, error } = useMemo(() => {
    try {
      return { result: runLevelCurve(inputs), error: null as string | null };
    } catch (e) {
      return { result: null, error: e instanceof LevelingError ? e.message : "Invalid inputs" };
    }
  }, [inputs]);

  const setField = (key: keyof LevelCurveInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        headingLevel="h2"
        title="Leveling Simulator"
        lede={`Model a level curve for ${game.name}: XP growth, session assumptions, catch-up, and limits — then read pacing and grind warnings.`}
      />
      <PlanningEstimateNote />

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <Panel aria-label="Level curve inputs">
          <SectionHeading>Assumptions</SectionHeading>
          <div className="space-y-3">
            {FIELDS.map((f) => (
              <label key={f.key} className="block text-xs text-mint-300">
                <span className="mb-0.5 flex justify-between">
                  {f.label}
                  <output className="tabular-nums text-cream-100">{inputs[f.key]}</output>
                </span>
                <input
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={inputs[f.key]}
                  onChange={(e) => setField(f.key, Number(e.target.value))}
                  aria-label={f.label}
                  className="w-full"
                />
              </label>
            ))}
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Days to max (est.)"
                  value={result.estimatedDaysToMax.toLocaleString()}
                  tone={
                    result.meetsTarget == null ? "neutral" : result.meetsTarget ? "good" : "warn"
                  }
                  hint={
                    inputs.targetDaysToMax > 0
                      ? `Target: ${inputs.targetDaysToMax} days${result.meetsTarget ? " — within 25%" : " — off target"}`
                      : undefined
                  }
                />
                <MetricCard label="Hours to max (est.)" value={result.estimatedHoursToMax.toLocaleString()} />
                <MetricCard label="Total activities" value={result.totalActivitiesToMax.toLocaleString()} />
              </div>
              <Panel>
                <ul className="space-y-1 text-sm text-mint-200">
                  <li>{result.newPlayerPacing}</li>
                  <li>{result.midgamePacing}</li>
                  <li>{result.endgamePacing}</li>
                </ul>
                {result.grindWarning && (
                  <p className="mt-2 rounded-lg border border-gold-600/40 bg-gold-600/10 px-3 py-2 text-xs text-warn">
                    {result.grindWarning}
                  </p>
                )}
                {result.contentExhaustionWarning && (
                  <p className="mt-2 rounded-lg border border-coral-500/40 bg-coral-500/10 px-3 py-2 text-xs text-coral-400">
                    {result.contentExhaustionWarning}
                  </p>
                )}
              </Panel>
              <Panel>
                <LineChart
                  title="Estimated days of play to reach each level"
                  xLabels={result.milestones.map((m) => `L${m.level}`)}
                  series={[
                    {
                      name: "Days (cumulative)",
                      values: result.milestones.map((m) => m.daysEstimate),
                      color: "var(--series-1)",
                    },
                  ]}
                  summary={`Reaching level ${inputs.maxLevel} takes about ${result.estimatedDaysToMax} days under these assumptions.`}
                />
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
