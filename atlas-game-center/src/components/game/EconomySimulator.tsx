"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel, SectionHeading } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import { SimDisclaimer } from "@/components/ui/Disclaimer";
import { LineChart } from "@/components/charts/LineChart";
import {
  defaultSimInputs,
  runEconomySim,
  scenarios,
  EconomySimError,
  type EconomySimInputs,
  type ScenarioKey,
} from "@/lib/sim/economy";
import { loadSimInputs, saveSimInputs } from "@/lib/storage/db";
import { cn } from "@/lib/cn";

interface FieldDef {
  key: keyof EconomySimInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  pct?: boolean;
}

const GROUPS: { name: string; fields: FieldDef[] }[] = [
  {
    name: "Player population",
    fields: [
      { key: "startingPlayers", label: "Starting players", min: 0, max: 50000, step: 100 },
      { key: "newPlayersPerDay", label: "New players per day", min: 0, max: 2000, step: 5 },
      { key: "monthlyRetention", label: "Monthly retention", min: 0, max: 1, step: 0.01, pct: true },
      { key: "returningRate", label: "Returning players rate", min: 0, max: 1, step: 0.01, pct: true },
      { key: "casualPct", label: "Casual share", min: 0, max: 1, step: 0.01, pct: true },
      { key: "regularPct", label: "Regular share", min: 0, max: 1, step: 0.01, pct: true },
      { key: "hardcorePct", label: "Hardcore share", min: 0, max: 1, step: 0.01, pct: true },
      { key: "maximizerPct", label: "Reward-maximizer share", min: 0, max: 1, step: 0.01, pct: true },
      { key: "botPct", label: "Estimated bot share", min: 0, max: 1, step: 0.01, pct: true },
    ],
  },
  {
    name: "Rewards",
    fields: [
      { key: "rewardPerActivity", label: "Reward per activity", min: 0, max: 200, step: 1 },
      { key: "activitiesPerCasual", label: "Activities/day — casual", min: 0, max: 30, step: 1 },
      { key: "activitiesPerRegular", label: "Activities/day — regular", min: 0, max: 40, step: 1 },
      { key: "activitiesPerHardcore", label: "Activities/day — hardcore", min: 0, max: 60, step: 1 },
      { key: "activitiesPerMaximizer", label: "Activities/day — maximizer", min: 0, max: 100, step: 1 },
      { key: "dailyRewardCap", label: "Daily reward cap", min: 0, max: 1000, step: 10 },
      { key: "starterGrant", label: "Starter grant", min: 0, max: 2000, step: 10 },
      { key: "monthlyEventRewardsPerPlayer", label: "Event rewards / player / month", min: 0, max: 500, step: 5 },
    ],
  },
  {
    name: "Sinks",
    fields: [
      { key: "sinkParticipation", label: "Daily sink participation", min: 0, max: 1, step: 0.01, pct: true },
      { key: "avgDailySpend", label: "Average daily spend", min: 0, max: 200, step: 1 },
      { key: "monthlyCosmeticSpendPerPlayer", label: "Cosmetic spend / player / month", min: 0, max: 500, step: 5 },
      { key: "destructionShare", label: "Destroyed share of spending", min: 0, max: 1, step: 0.05, pct: true },
    ],
  },
  {
    name: "Treasury (token layer — leave at 0 for pure off-chain)",
    fields: [
      { key: "treasuryStartingReserve", label: "Starting token reserve", min: 0, max: 1000000, step: 5000 },
      { key: "treasuryMinimumReserve", label: "Minimum safety reserve", min: 0, max: 500000, step: 5000 },
      { key: "treasuryMonthlyTopUp", label: "Monthly top-up", min: 0, max: 100000, step: 1000 },
      { key: "monthlyRevenueContribution", label: "Monthly revenue contribution", min: 0, max: 100000, step: 1000 },
      { key: "monthlyTokenRewardBudget", label: "Monthly token reward budget", min: 0, max: 100000, step: 1000 },
      { key: "transactionFeeReserve", label: "Transaction fee reserve", min: 0, max: 100000, step: 1000 },
      { key: "feePerClaim", label: "Fee per claim", min: 0, max: 50, step: 0.5 },
      { key: "claimsPerMonth", label: "Claims per month", min: 0, max: 50000, step: 100 },
    ],
  },
  {
    name: "Content",
    fields: [
      { key: "newItemsPerMonth", label: "New shop items / month", min: 0, max: 40, step: 1 },
      { key: "plannedContentMonths", label: "Planned content runway (months)", min: 0, max: 36, step: 1 },
      { key: "contentDelayMonths", label: "Content delay (months)", min: 0, max: 12, step: 1 },
    ],
  },
  {
    name: "Market assumptions (manual scenarios only — no live prices)",
    fields: [
      { key: "tokenPriceBaseline", label: "Token price baseline (your unit)", min: 0, max: 100, step: 0.5 },
      { key: "tokenPriceScenario", label: "Token price scenario", min: 0, max: 100, step: 0.5 },
      { key: "marketplaceParticipation", label: "Marketplace participation", min: 0, max: 1, step: 0.01, pct: true },
    ],
  },
  {
    name: "Horizon",
    fields: [{ key: "months", label: "Months to simulate", min: 1, max: 36, step: 1 }],
  },
];

export function EconomySimulator({ storageKey }: { storageKey: string }) {
  const [inputs, setInputs] = useState<EconomySimInputs>(defaultSimInputs());
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSimInputs<EconomySimInputs>(storageKey)
      .then((saved) => {
        if (!cancelled && saved) setInputs({ ...defaultSimInputs(), ...saved });
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      saveSimInputs(storageKey, inputs).catch(() => undefined);
    }, 500);
    return () => clearTimeout(t);
  }, [inputs, loaded, storageKey]);

  const { result, error } = useMemo(() => {
    try {
      const active = scenarios.find((s) => s.key === scenario) ?? scenarios[0];
      return { result: runEconomySim(active.apply(inputs)), error: null as string | null };
    } catch (e) {
      return {
        result: null,
        error: e instanceof EconomySimError ? e.message : "Invalid inputs",
      };
    }
  }, [inputs, scenario]);

  const setField = (key: keyof EconomySimInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const months = result ? result.rows.map((r) => `M${r.month}`) : [];

  return (
    <div className="space-y-4">
      <SimDisclaimer />

      {/* Scenario picker */}
      <div role="group" aria-label="Stress-test scenario" className="flex flex-wrap gap-1.5">
        {scenarios.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={scenario === s.key}
            title={s.description}
            onClick={() => setScenario(s.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              scenario === s.key
                ? "border-gold-400 bg-forest-700/70 text-cream-100"
                : "border-forest-700 text-mint-300 hover:text-cream-100",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">
        {scenarios.find((s) => s.key === scenario)?.description}
      </p>

      <div className="grid gap-4 xl:grid-cols-[minmax(300px,380px)_1fr]">
        {/* Inputs */}
        <div className="space-y-3">
          {GROUPS.map((group) => (
            <details key={group.name} className="panel p-3" open={group.name === "Player population"}>
              <summary className="cursor-pointer text-sm font-semibold text-cream-100">
                {group.name}
              </summary>
              <div className="mt-3 space-y-3">
                {group.fields.map((f) => (
                  <label key={f.key} className="block text-xs text-mint-300">
                    <span className="mb-0.5 flex justify-between">
                      {f.label}
                      <output className="tabular-nums text-cream-100">
                        {f.pct
                          ? `${Math.round((inputs[f.key] as number) * 100)}%`
                          : (inputs[f.key] as number).toLocaleString()}
                      </output>
                    </span>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={inputs[f.key] as number}
                      onChange={(e) => setField(f.key, Number(e.target.value))}
                      aria-label={f.label}
                      className="w-full"
                    />
                  </label>
                ))}
              </div>
            </details>
          ))}
          <button
            type="button"
            onClick={() => setInputs(defaultSimInputs())}
            className="rounded-lg border border-forest-700 px-3 py-1.5 text-xs text-mint-300 hover:text-cream-100"
          >
            Reset to defaults
          </button>
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          {error && (
            <Panel className="border-coral-500/40">
              <p className="text-sm text-coral-400">{error}</p>
            </Panel>
          )}
          {result && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Warning level"
                  value={result.warningLevel.toUpperCase()}
                  tone={
                    result.warningLevel === "healthy"
                      ? "good"
                      : result.warningLevel === "watch"
                        ? "neutral"
                        : result.warningLevel === "warning"
                          ? "warn"
                          : "critical"
                  }
                />
                <MetricCard
                  label="Avg source:sink ratio"
                  value={Number.isFinite(result.avgRatio) ? result.avgRatio.toFixed(3) : "∞"}
                  tone={
                    result.avgRatio >= 0.9 && result.avgRatio <= 1.15
                      ? "good"
                      : result.avgRatio > 1.35 || result.avgRatio < 0.7
                        ? "critical"
                        : "warn"
                  }
                  hint="Planning band ≈ 0.95–1.10"
                />
                <MetricCard
                  label="Treasury runway"
                  value={
                    result.treasuryRunwayDays == null
                      ? inputs.monthlyTokenRewardBudget > 0 || inputs.treasuryStartingReserve > 0
                        ? "Beyond horizon"
                        : "No token layer"
                      : `~${result.treasuryRunwayDays} days`
                  }
                  tone={result.treasuryRunwayDays != null ? "warn" : "neutral"}
                />
                <MetricCard
                  label="Content exhaustion"
                  value={
                    result.contentExhaustionMonth == null
                      ? "Beyond horizon"
                      : `~Month ${result.contentExhaustionMonth}`
                  }
                  tone={result.contentExhaustionMonth != null ? "warn" : "good"}
                />
              </div>

              <Panel>
                <LineChart
                  title="Currency created vs destroyed per month"
                  xLabels={months}
                  series={[
                    { name: "Created", values: result.rows.map((r) => r.created), color: "var(--series-1)" },
                    { name: "Destroyed", values: result.rows.map((r) => r.destroyed), color: "var(--series-2)" },
                  ]}
                  summary={`Average source-to-sink ratio ${result.avgRatio}.`}
                />
              </Panel>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel>
                  <LineChart
                    title="Circulating currency"
                    xLabels={months}
                    series={[
                      {
                        name: "Circulating",
                        values: result.rows.map((r) => r.circulating),
                        color: "var(--series-3)",
                      },
                    ]}
                    height={180}
                  />
                </Panel>
                <Panel>
                  <LineChart
                    title="Balance distribution (median / p90 / p99)"
                    xLabels={months}
                    series={[
                      { name: "Median", values: result.rows.map((r) => r.medianBalance), color: "var(--series-1)" },
                      { name: "p90", values: result.rows.map((r) => r.p90Balance), color: "var(--series-2)" },
                      { name: "p99", values: result.rows.map((r) => r.p99Balance), color: "var(--series-4)" },
                    ]}
                    height={180}
                  />
                </Panel>
              </div>

              {(inputs.treasuryStartingReserve > 0 || inputs.monthlyTokenRewardBudget > 0) && (
                <Panel>
                  <LineChart
                    title="Treasury reserve (tokens)"
                    xLabels={months}
                    series={[
                      { name: "Treasury", values: result.rows.map((r) => r.treasury), color: "var(--series-5)" },
                      {
                        name: "Minimum reserve",
                        values: result.rows.map(() => inputs.treasuryMinimumReserve),
                        color: "var(--series-4)",
                      },
                    ]}
                    height={180}
                  />
                </Panel>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="DAU at horizon"
                  value={result.rows[result.rows.length - 1].dau.toLocaleString()}
                />
                <MetricCard
                  label="Beginner affordability"
                  value={`${Math.round(result.rows[result.rows.length - 1].beginnerAffordability * 100)}%`}
                  tone={
                    result.rows[result.rows.length - 1].beginnerAffordability >= 0.75
                      ? "good"
                      : result.rows[result.rows.length - 1].beginnerAffordability >= 0.5
                        ? "warn"
                        : "critical"
                  }
                />
                <MetricCard
                  label="Bot share of rewards"
                  value={`${Math.round(result.rows[result.rows.length - 1].botShare * 100)}%`}
                  tone={result.rows[result.rows.length - 1].botShare > 0.15 ? "critical" : "neutral"}
                />
                <MetricCard
                  label="Maximizer share"
                  value={`${Math.round(result.rows[result.rows.length - 1].maximizerShare * 100)}%`}
                />
              </div>

              <Panel>
                <SectionHeading>Failure-mode estimates</SectionHeading>
                <p className="mb-2 text-xs text-muted">
                  An economy does not have one “death date” — each failure mode is estimated
                  separately. {result.firstFailure ? (
                    <span className="text-coral-400">
                      First to fail under this scenario: {result.firstFailure.name} (~month{" "}
                      {result.firstFailure.estimatedMonth}).
                    </span>
                  ) : (
                    <span className="text-good">No failure mode triggers within the horizon.</span>
                  )}
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {result.failureModes.map((f) => (
                    <li
                      key={f.key}
                      className={cn(
                        "rounded-lg border px-3 py-2",
                        f.estimatedMonth != null
                          ? "border-coral-500/40 bg-coral-500/10"
                          : "border-forest-700 bg-forest-900/40",
                      )}
                    >
                      <p className="flex items-center justify-between text-sm">
                        <span className={f.estimatedMonth != null ? "text-coral-400" : "text-mint-200"}>
                          {f.name}
                        </span>
                        <span className="text-xs tabular-nums text-muted">
                          {f.estimatedMonth != null ? `~M${f.estimatedMonth}` : "—"}
                        </span>
                      </p>
                      <p className="text-xs text-muted">{f.explanation}</p>
                    </li>
                  ))}
                </ul>
              </Panel>

              {result.notes.length > 0 && (
                <Panel>
                  <SectionHeading>Reading the results</SectionHeading>
                  <ul className="list-inside list-disc space-y-1 text-sm text-mint-200">
                    {result.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </Panel>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
