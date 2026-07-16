import { describe, expect, it } from "vitest";
import {
  defaultSimInputs,
  runEconomySim,
  runScenario,
  scenarios,
  EconomySimError,
  SIM_DISCLAIMER,
  type EconomySimInputs,
} from "./economy";

describe("economy longevity simulator", () => {
  it("is deterministic: the same inputs replay to identical results", () => {
    const inputs = defaultSimInputs();
    const a = runEconomySim(inputs);
    const b = runEconomySim(inputs);
    expect(a).toEqual(b);
  });

  it("reports the source-to-sink ratio each month", () => {
    const result = runEconomySim(defaultSimInputs());
    expect(result.rows).toHaveLength(defaultSimInputs().months);
    for (const row of result.rows) {
      expect(row.ratio).toBeGreaterThan(0);
      expect(row.created).toBeGreaterThanOrEqual(0);
      expect(row.destroyed).toBeGreaterThanOrEqual(0);
    }
  });

  it("raising rewards raises the average ratio", () => {
    const base = runEconomySim(defaultSimInputs());
    const rich = runEconomySim({
      ...defaultSimInputs(),
      rewardPerActivity: defaultSimInputs().rewardPerActivity * 4,
      dailyRewardCap: 100000,
    });
    expect(rich.avgRatio).toBeGreaterThan(base.avgRatio);
  });

  it("estimates treasury runway when a token layer spends faster than it refills", () => {
    const inputs: EconomySimInputs = {
      ...defaultSimInputs(),
      treasuryStartingReserve: 10000,
      treasuryMinimumReserve: 2000,
      treasuryMonthlyTopUp: 0,
      monthlyTokenRewardBudget: 2000,
    };
    const result = runEconomySim(inputs);
    expect(result.treasuryRunwayDays).not.toBeNull();
    expect(result.treasuryRunwayDays!).toBeGreaterThan(0);
    const treasuryFailure = result.failureModes.find((f) => f.key === "treasury_exhaustion");
    expect(treasuryFailure?.estimatedMonth).not.toBeNull();
  });

  it("reports no treasury runway for a pure off-chain economy", () => {
    const result = runEconomySim(defaultSimInputs());
    expect(result.treasuryRunwayDays).toBeNull();
  });

  it("bot attack scenario increases the bot share of rewards", () => {
    const inputs = defaultSimInputs();
    const base = runScenario(inputs, "base");
    const attacked = runScenario(inputs, "bot_attack");
    const last = (r: typeof base) => r.rows[r.rows.length - 1];
    expect(last(attacked).botShare).toBeGreaterThan(last(base).botShare);
  });

  it("growth spike raises DAU; player collapse lowers it", () => {
    const inputs = defaultSimInputs();
    const base = runScenario(inputs, "base");
    const spike = runScenario(inputs, "growth_spike");
    const collapse = runScenario(inputs, "player_collapse");
    const lastDau = (r: typeof base) => r.rows[r.rows.length - 1].dau;
    expect(lastDau(spike)).toBeGreaterThan(lastDau(base));
    expect(lastDau(collapse)).toBeLessThan(lastDau(base));
  });

  it("sink failure pushes the economy toward inflation", () => {
    const inputs = defaultSimInputs();
    const base = runScenario(inputs, "base");
    const failed = runScenario(inputs, "sink_failure");
    expect(failed.avgRatio).toBeGreaterThan(base.avgRatio);
  });

  it("content delay without cadence triggers content exhaustion", () => {
    const result = runScenario(defaultSimInputs(), "content_delay");
    const exhaustion = result.failureModes.find((f) => f.key === "content_exhaustion");
    expect(exhaustion?.estimatedMonth).not.toBeNull();
  });

  it("covers all twelve stress scenarios", () => {
    expect(scenarios.map((s) => s.key)).toEqual([
      "base",
      "optimistic",
      "pessimistic",
      "bot_attack",
      "token_price_drop",
      "growth_spike",
      "player_collapse",
      "sink_failure",
      "content_delay",
      "topup_ends",
      "fee_spike",
      "reward_surge",
    ]);
    for (const s of scenarios) {
      // Every scenario must produce a valid run from default inputs.
      expect(() => runScenario(defaultSimInputs(), s.key)).not.toThrow();
    }
  });

  it("rejects invalid inputs with clear errors", () => {
    const base = defaultSimInputs();
    expect(() => runEconomySim({ ...base, startingPlayers: -5 })).toThrow(EconomySimError);
    expect(() => runEconomySim({ ...base, monthlyRetention: 1.4 })).toThrow(EconomySimError);
    expect(() => runEconomySim({ ...base, rewardPerActivity: Number.NaN })).toThrow(
      EconomySimError,
    );
    expect(() => runEconomySim({ ...base, months: 0 })).toThrow(EconomySimError);
    expect(() => runEconomySim({ ...base, months: 120 })).toThrow(EconomySimError);
    expect(() =>
      runEconomySim({ ...base, casualPct: 0.9, regularPct: 0.9 }),
    ).toThrow(/must sum to 100%/);
  });

  it("always carries no-guarantee language", () => {
    expect(SIM_DISCLAIMER).toContain("NOT A GUARANTEE");
    expect(SIM_DISCLAIMER).toContain("NOT A FINANCIAL FORECAST");
    const result = runEconomySim(defaultSimInputs());
    expect(result.disclaimer).toBe(SIM_DISCLAIMER);
  });
});
