/**
 * Economy Longevity Simulator.
 *
 * Deterministic planning model: the same inputs always produce the same
 * outputs (no randomness), so runs are replayable and testable.
 *
 * IMPORTANT FRAMING — surfaced in the UI wherever results appear:
 *   ESTIMATED PLANNING RUNWAY. NOT A GUARANTEE. NOT A FINANCIAL FORECAST.
 *
 * Token prices are manual planning scenarios only. Nothing here fetches
 * live prices or predicts markets.
 */

export interface EconomySimInputs {
  /* PLAYER POPULATION */
  startingPlayers: number;
  newPlayersPerDay: number;
  /** Fraction of DAU retained month over month (0..1). */
  monthlyRetention: number;
  /** Fraction of lapsed players who return each month (0..1). */
  returningRate: number;
  casualPct: number;
  regularPct: number;
  hardcorePct: number;
  maximizerPct: number;
  botPct: number;

  /* REWARDS (soft currency per day unless noted) */
  rewardPerActivity: number;
  activitiesPerCasual: number;
  activitiesPerRegular: number;
  activitiesPerHardcore: number;
  activitiesPerMaximizer: number;
  dailyRewardCap: number;
  starterGrant: number;
  monthlyEventRewardsPerPlayer: number;

  /* SINKS */
  /** Fraction of players who spend on useful items daily (0..1). */
  sinkParticipation: number;
  avgDailySpend: number;
  monthlyCosmeticSpendPerPlayer: number;
  /** Fraction of sink spending permanently destroyed (vs recirculated). */
  destructionShare: number;

  /* TREASURY (token units; null-ish zeros mean no token layer) */
  treasuryStartingReserve: number;
  treasuryMinimumReserve: number;
  treasuryMonthlyTopUp: number;
  monthlyRevenueContribution: number;
  monthlyTokenRewardBudget: number;
  transactionFeeReserve: number;
  feePerClaim: number;
  claimsPerMonth: number;

  /* CONTENT */
  newItemsPerMonth: number;
  /** Months until currently-planned content is exhausted at current cadence. */
  plannedContentMonths: number;
  contentDelayMonths: number;

  /* MARKET ASSUMPTIONS (manual scenarios only) */
  tokenPriceScenario: number;
  tokenPriceBaseline: number;
  marketplaceParticipation: number;

  /* HORIZON */
  months: number;
}

export interface MonthRow {
  month: number;
  dau: number;
  created: number;
  destroyed: number;
  ratio: number;
  circulating: number;
  treasury: number;
  feeReserve: number;
  rewardLiability: number;
  medianBalance: number;
  p90Balance: number;
  p99Balance: number;
  botShare: number;
  maximizerShare: number;
  sinkParticipation: number;
  beginnerAffordability: number;
}

export type FailureModeKey =
  | "treasury_exhaustion"
  | "inflation_failure"
  | "deflation_failure"
  | "content_exhaustion"
  | "farming_domination"
  | "affordability_collapse"
  | "liquidity_failure"
  | "retention_failure"
  | "token_price_dependency"
  | "fee_failure";

export interface FailureModeResult {
  key: FailureModeKey;
  name: string;
  explanation: string;
  /** 1-based month when this failure is first estimated, or null if not within horizon. */
  estimatedMonth: number | null;
}

export type WarningLevel = "healthy" | "watch" | "warning" | "critical";

export interface EconomySimResult {
  rows: MonthRow[];
  failureModes: FailureModeResult[];
  /** Earliest failing mode, or null. */
  firstFailure: FailureModeResult | null;
  avgRatio: number;
  treasuryRunwayDays: number | null;
  feeRunwayDays: number | null;
  contentExhaustionMonth: number | null;
  warningLevel: WarningLevel;
  notes: string[];
  disclaimer: string;
}

export const SIM_DISCLAIMER =
  "ESTIMATED PLANNING RUNWAY — NOT A GUARANTEE. NOT A FINANCIAL FORECAST. These are planning estimates based on the assumptions you entered.";

export class EconomySimError extends Error {}

function assertFinite(value: number, name: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new EconomySimError(`Invalid input: ${name} must be a finite number`);
  }
}

function assertNonNegative(value: number, name: string) {
  assertFinite(value, name);
  if (value < 0) {
    throw new EconomySimError(`Invalid input: ${name} must not be negative`);
  }
}

function assertFraction(value: number, name: string) {
  assertFinite(value, name);
  if (value < 0 || value > 1) {
    throw new EconomySimError(`Invalid input: ${name} must be between 0 and 1`);
  }
}

export function validateInputs(inputs: EconomySimInputs): void {
  assertNonNegative(inputs.startingPlayers, "startingPlayers");
  assertNonNegative(inputs.newPlayersPerDay, "newPlayersPerDay");
  assertFraction(inputs.monthlyRetention, "monthlyRetention");
  assertFraction(inputs.returningRate, "returningRate");
  assertFraction(inputs.casualPct, "casualPct");
  assertFraction(inputs.regularPct, "regularPct");
  assertFraction(inputs.hardcorePct, "hardcorePct");
  assertFraction(inputs.maximizerPct, "maximizerPct");
  assertFraction(inputs.botPct, "botPct");
  const shares =
    inputs.casualPct +
    inputs.regularPct +
    inputs.hardcorePct +
    inputs.maximizerPct +
    inputs.botPct;
  if (Math.abs(shares - 1) > 0.02) {
    throw new EconomySimError(
      "Invalid input: player archetype percentages must sum to 100%",
    );
  }
  assertNonNegative(inputs.rewardPerActivity, "rewardPerActivity");
  assertNonNegative(inputs.activitiesPerCasual, "activitiesPerCasual");
  assertNonNegative(inputs.activitiesPerRegular, "activitiesPerRegular");
  assertNonNegative(inputs.activitiesPerHardcore, "activitiesPerHardcore");
  assertNonNegative(inputs.activitiesPerMaximizer, "activitiesPerMaximizer");
  assertNonNegative(inputs.dailyRewardCap, "dailyRewardCap");
  assertNonNegative(inputs.starterGrant, "starterGrant");
  assertNonNegative(inputs.monthlyEventRewardsPerPlayer, "monthlyEventRewardsPerPlayer");
  assertFraction(inputs.sinkParticipation, "sinkParticipation");
  assertNonNegative(inputs.avgDailySpend, "avgDailySpend");
  assertNonNegative(inputs.monthlyCosmeticSpendPerPlayer, "monthlyCosmeticSpendPerPlayer");
  assertFraction(inputs.destructionShare, "destructionShare");
  assertNonNegative(inputs.treasuryStartingReserve, "treasuryStartingReserve");
  assertNonNegative(inputs.treasuryMinimumReserve, "treasuryMinimumReserve");
  assertNonNegative(inputs.treasuryMonthlyTopUp, "treasuryMonthlyTopUp");
  assertNonNegative(inputs.monthlyRevenueContribution, "monthlyRevenueContribution");
  assertNonNegative(inputs.monthlyTokenRewardBudget, "monthlyTokenRewardBudget");
  assertNonNegative(inputs.transactionFeeReserve, "transactionFeeReserve");
  assertNonNegative(inputs.feePerClaim, "feePerClaim");
  assertNonNegative(inputs.claimsPerMonth, "claimsPerMonth");
  assertNonNegative(inputs.newItemsPerMonth, "newItemsPerMonth");
  assertNonNegative(inputs.plannedContentMonths, "plannedContentMonths");
  assertNonNegative(inputs.contentDelayMonths, "contentDelayMonths");
  assertNonNegative(inputs.tokenPriceScenario, "tokenPriceScenario");
  assertNonNegative(inputs.tokenPriceBaseline, "tokenPriceBaseline");
  assertFraction(inputs.marketplaceParticipation, "marketplaceParticipation");
  assertFinite(inputs.months, "months");
  if (inputs.months < 1 || inputs.months > 60) {
    throw new EconomySimError("Invalid input: months must be between 1 and 60");
  }
}

const DAYS = 30;

/** Weighted percentile across archetype balance groups. */
function percentileFromGroups(
  groups: { weight: number; balance: number }[],
  p: number,
): number {
  const sorted = [...groups].sort((a, b) => a.balance - b.balance);
  let acc = 0;
  for (const g of sorted) {
    acc += g.weight;
    if (acc >= p) return g.balance;
  }
  return sorted.length ? sorted[sorted.length - 1].balance : 0;
}

export function runEconomySim(inputs: EconomySimInputs): EconomySimResult {
  validateInputs(inputs);

  const rows: MonthRow[] = [];
  const notes: string[] = [];

  let dau = inputs.startingPlayers;
  let circulating = inputs.startingPlayers * inputs.starterGrant;
  let treasury = inputs.treasuryStartingReserve;
  let feeReserve = inputs.transactionFeeReserve;
  let lapsedPool = 0;

  // Per-archetype average balances (start at starter grant).
  const balances = {
    casual: inputs.starterGrant,
    regular: inputs.starterGrant,
    hardcore: inputs.starterGrant,
    maximizer: inputs.starterGrant,
    bot: inputs.starterGrant,
  };

  const failMonth: Partial<Record<FailureModeKey, number>> = {};
  const priceRatio =
    inputs.tokenPriceBaseline > 0
      ? inputs.tokenPriceScenario / inputs.tokenPriceBaseline
      : 1;

  const contentRunsOut =
    inputs.newItemsPerMonth > 0
      ? null
      : Math.max(1, Math.round(inputs.plannedContentMonths + inputs.contentDelayMonths));
  // With ongoing cadence, exhaustion happens only if cadence can't cover engagement.
  const effectiveContentMonths =
    inputs.newItemsPerMonth >= 1
      ? inputs.plannedContentMonths + inputs.months // effectively not exhausted in horizon
      : inputs.plannedContentMonths;

  for (let m = 1; m <= inputs.months; m++) {
    // --- population ---
    const monthlyNew = inputs.newPlayersPerDay * DAYS;
    const retained = dau * inputs.monthlyRetention;
    const churned = dau - retained;
    lapsedPool += churned;
    const returned = lapsedPool * inputs.returningRate;
    lapsedPool -= returned;
    // Content delay softens retention: bored players churn faster.
    const delayPenalty =
      m > effectiveContentMonths - inputs.contentDelayMonths && inputs.contentDelayMonths > 0
        ? 0.97
        : 1;
    dau = Math.max(0, (retained + monthlyNew + returned) * delayPenalty);

    const shares = {
      casual: inputs.casualPct,
      regular: inputs.regularPct,
      hardcore: inputs.hardcorePct,
      maximizer: inputs.maximizerPct,
      bot: inputs.botPct,
    };

    // --- creation (sources) ---
    const perDayEarn = (activities: number) =>
      Math.min(activities * inputs.rewardPerActivity, inputs.dailyRewardCap);
    const earn = {
      casual: perDayEarn(inputs.activitiesPerCasual) * DAYS,
      regular: perDayEarn(inputs.activitiesPerRegular) * DAYS,
      hardcore: perDayEarn(inputs.activitiesPerHardcore) * DAYS,
      maximizer: perDayEarn(inputs.activitiesPerMaximizer) * DAYS,
      bot: perDayEarn(inputs.activitiesPerMaximizer) * DAYS, // bots emulate maximizers
    };
    const starterIssued = monthlyNew * inputs.starterGrant;
    const eventIssued = dau * inputs.monthlyEventRewardsPerPlayer;
    let created = starterIssued + eventIssued;
    for (const k of Object.keys(shares) as (keyof typeof shares)[]) {
      created += dau * shares[k] * earn[k];
    }

    // --- destruction (sinks) ---
    // Sink participation decays once content is exhausted.
    const pastContent = m > effectiveContentMonths;
    const sinkPart = pastContent
      ? inputs.sinkParticipation * Math.pow(0.85, m - effectiveContentMonths)
      : inputs.sinkParticipation;
    const usefulSpend = dau * sinkPart * inputs.avgDailySpend * DAYS;
    const cosmeticSpend = dau * inputs.monthlyCosmeticSpendPerPlayer;
    const grossSpend = usefulSpend + cosmeticSpend;
    const destroyed = grossSpend * inputs.destructionShare + grossSpend * (1 - inputs.destructionShare) * 0.5;
    // (Recirculated share still removes half from circulation via fees/decay in this simple model.)

    const ratio = destroyed > 0 ? created / destroyed : Infinity;
    circulating = Math.max(0, circulating + created - destroyed);

    // --- per-archetype balances ---
    const spendPer = dau > 0 ? (grossSpend / dau) : 0;
    balances.casual = Math.max(0, balances.casual + earn.casual - spendPer);
    balances.regular = Math.max(0, balances.regular + earn.regular - spendPer);
    balances.hardcore = Math.max(0, balances.hardcore + earn.hardcore - spendPer);
    balances.maximizer = Math.max(0, balances.maximizer + earn.maximizer - spendPer * 0.6);
    balances.bot = Math.max(0, balances.bot + earn.bot - spendPer * 0.1);

    const groups = [
      { weight: shares.casual, balance: balances.casual },
      { weight: shares.regular, balance: balances.regular },
      { weight: shares.hardcore, balance: balances.hardcore },
      { weight: shares.maximizer, balance: balances.maximizer },
      { weight: shares.bot, balance: balances.bot },
    ];
    const median = percentileFromGroups(groups, 0.5);
    const p90 = percentileFromGroups(groups, 0.9);
    const p99 = percentileFromGroups(groups, 0.99);

    // --- farming shares ---
    const totalEarned = created - starterIssued - eventIssued;
    const botEarned = dau * shares.bot * earn.bot;
    const maxEarned = dau * shares.maximizer * earn.maximizer;
    const botShare = totalEarned > 0 ? botEarned / totalEarned : 0;
    const maximizerShare = totalEarned > 0 ? maxEarned / totalEarned : 0;

    // --- treasury (token layer) ---
    const tokenSpend = inputs.monthlyTokenRewardBudget;
    treasury = treasury + inputs.treasuryMonthlyTopUp + inputs.monthlyRevenueContribution - tokenSpend;
    const feeSpend = inputs.feePerClaim * inputs.claimsPerMonth;
    feeReserve = feeReserve - feeSpend;
    const rewardLiability = tokenSpend * inputs.tokenPriceScenario;

    // --- beginner affordability ---
    // A new player's first-week earnings vs a basic useful-item basket.
    const weekEarn = perDayEarn(inputs.activitiesPerCasual) * 7 + inputs.starterGrant;
    const basketCost = inputs.avgDailySpend * 7;
    // Older players' balances inflate player-facing prices in the model.
    const inflationPressure = median > 0 ? Math.min(3, Math.max(1, median / Math.max(1, weekEarn))) : 1;
    const beginnerAffordability = Math.max(
      0,
      Math.min(1, basketCost > 0 ? weekEarn / (basketCost * inflationPressure) : 1),
    );

    rows.push({
      month: m,
      dau: Math.round(dau),
      created: Math.round(created),
      destroyed: Math.round(destroyed),
      ratio: Number.isFinite(ratio) ? Number(ratio.toFixed(3)) : Infinity,
      circulating: Math.round(circulating),
      treasury: Number(treasury.toFixed(2)),
      feeReserve: Number(feeReserve.toFixed(2)),
      rewardLiability: Number(rewardLiability.toFixed(2)),
      medianBalance: Math.round(median),
      p90Balance: Math.round(p90),
      p99Balance: Math.round(p99),
      botShare: Number(botShare.toFixed(3)),
      maximizerShare: Number(maximizerShare.toFixed(3)),
      sinkParticipation: Number(sinkPart.toFixed(3)),
      beginnerAffordability: Number(beginnerAffordability.toFixed(3)),
    });

    // --- failure detection (first month each mode trips) ---
    const usesTreasury = inputs.monthlyTokenRewardBudget > 0 || inputs.treasuryStartingReserve > 0;
    if (usesTreasury && treasury < inputs.treasuryMinimumReserve && failMonth.treasury_exhaustion == null) {
      failMonth.treasury_exhaustion = m;
    }
    if (ratio > 1.35 && failMonth.inflation_failure == null && m >= 3) {
      failMonth.inflation_failure = m;
    }
    if (ratio < 0.7 && failMonth.deflation_failure == null && m >= 3) {
      failMonth.deflation_failure = m;
    }
    if (m > effectiveContentMonths && failMonth.content_exhaustion == null) {
      failMonth.content_exhaustion = m;
    }
    if (botShare + maximizerShare > 0.5 && failMonth.farming_domination == null) {
      failMonth.farming_domination = m;
    }
    if (beginnerAffordability < 0.5 && failMonth.affordability_collapse == null) {
      failMonth.affordability_collapse = m;
    }
    if (
      inputs.marketplaceParticipation > 0 &&
      inputs.marketplaceParticipation < 0.05 &&
      failMonth.liquidity_failure == null
    ) {
      failMonth.liquidity_failure = m;
    }
    if (dau < inputs.startingPlayers * 0.3 && m >= 2 && failMonth.retention_failure == null) {
      failMonth.retention_failure = m;
    }
    if (usesTreasury && priceRatio < 0.5 && failMonth.token_price_dependency == null) {
      failMonth.token_price_dependency = m;
    }
    if (usesTreasury && feeSpend > 0 && feeReserve < 0 && failMonth.fee_failure == null) {
      failMonth.fee_failure = m;
    }
  }

  const failureModes: FailureModeResult[] = FAILURE_MODE_DEFS.map((def) => ({
    ...def,
    estimatedMonth: failMonth[def.key] ?? null,
  }));

  const firstFailure = failureModes
    .filter((f) => f.estimatedMonth != null)
    .sort((a, b) => (a.estimatedMonth! - b.estimatedMonth!))[0] ?? null;

  const finiteRatios = rows.map((r) => r.ratio).filter((r) => Number.isFinite(r));
  const avgRatio = finiteRatios.length
    ? Number((finiteRatios.reduce((a, b) => a + b, 0) / finiteRatios.length).toFixed(3))
    : Infinity;

  const treasuryFailRow = rows.find((r) => r.treasury < inputs.treasuryMinimumReserve);
  const usesTreasury = inputs.monthlyTokenRewardBudget > 0 || inputs.treasuryStartingReserve > 0;
  const treasuryRunwayDays = usesTreasury
    ? treasuryFailRow
      ? treasuryFailRow.month * DAYS
      : null
    : null;
  const feeFailRow = rows.find((r) => r.feeReserve < 0);
  const feeRunwayDays =
    usesTreasury && inputs.feePerClaim * inputs.claimsPerMonth > 0
      ? feeFailRow
        ? feeFailRow.month * DAYS
        : null
      : null;

  const contentExhaustionMonth =
    failMonth.content_exhaustion ?? (contentRunsOut != null && contentRunsOut <= inputs.months ? contentRunsOut : null);

  const failCount = failureModes.filter((f) => f.estimatedMonth != null).length;
  const warningLevel: WarningLevel =
    failCount === 0
      ? avgRatio >= 0.9 && avgRatio <= 1.15
        ? "healthy"
        : "watch"
      : firstFailure && firstFailure.estimatedMonth! <= 3
        ? "critical"
        : failCount >= 3
          ? "critical"
          : "warning";

  if (avgRatio > 1.15) {
    notes.push(
      "Sources outpace sinks: currency is created faster than useful spending removes it. Consider stronger optional sinks before rewards grow.",
    );
  }
  if (avgRatio < 0.9 && Number.isFinite(avgRatio)) {
    notes.push(
      "Sinks outpace sources: players may struggle to participate comfortably. Consider easing costs or adding earn paths.",
    );
  }
  if (inputs.botPct > 0.1) {
    notes.push("Bot share above 10% of players — anti-farming controls should be planned before rewards carry value.");
  }
  if (treasuryRunwayDays != null) {
    notes.push(
      `Treasury is estimated to reach its minimum reserve in about ${treasuryRunwayDays} days under these assumptions.`,
    );
  }

  return {
    rows,
    failureModes,
    firstFailure,
    avgRatio,
    treasuryRunwayDays,
    feeRunwayDays,
    contentExhaustionMonth,
    warningLevel,
    notes,
    disclaimer: SIM_DISCLAIMER,
  };
}

export const FAILURE_MODE_DEFS: Omit<FailureModeResult, "estimatedMonth">[] = [
  {
    key: "treasury_exhaustion",
    name: "Treasury Exhaustion",
    explanation: "The treasury falls below its safety reserve.",
  },
  {
    key: "inflation_failure",
    name: "Inflation Failure",
    explanation: "Currency is created faster than useful spending can remove it.",
  },
  {
    key: "deflation_failure",
    name: "Deflation Failure",
    explanation: "Players cannot earn enough to participate comfortably.",
  },
  {
    key: "content_exhaustion",
    name: "Content Exhaustion",
    explanation: "Players have nothing valuable left to buy or unlock.",
  },
  {
    key: "farming_domination",
    name: "Reward Farming Domination",
    explanation: "Bots or maximizers receive too much of the economy.",
  },
  {
    key: "affordability_collapse",
    name: "New-Player Affordability Collapse",
    explanation: "Prices or player markets become inaccessible to new players.",
  },
  {
    key: "liquidity_failure",
    name: "Liquidity Failure",
    explanation: "A marketplace has assets listed but insufficient real buyers.",
  },
  {
    key: "retention_failure",
    name: "Retention Failure",
    explanation: "Players leave even though the financial economy still has funds.",
  },
  {
    key: "token_price_dependency",
    name: "Token-Price Dependency",
    explanation: "Gameplay rewards become unattractive after a token-price decline.",
  },
  {
    key: "fee_failure",
    name: "Fee Failure",
    explanation: "Blockchain fees become too expensive for the reward size.",
  },
];

/* ------------------------------------------------------------------ */
/* Stress-test scenarios                                                */
/* ------------------------------------------------------------------ */

export type ScenarioKey =
  | "base"
  | "optimistic"
  | "pessimistic"
  | "bot_attack"
  | "token_price_drop"
  | "growth_spike"
  | "player_collapse"
  | "sink_failure"
  | "content_delay"
  | "topup_ends"
  | "fee_spike"
  | "reward_surge";

export interface Scenario {
  key: ScenarioKey;
  name: string;
  description: string;
  apply: (base: EconomySimInputs) => EconomySimInputs;
}

function renormalizeShares(i: EconomySimInputs): EconomySimInputs {
  const sum = i.casualPct + i.regularPct + i.hardcorePct + i.maximizerPct + i.botPct;
  if (sum <= 0) return i;
  return {
    ...i,
    casualPct: i.casualPct / sum,
    regularPct: i.regularPct / sum,
    hardcorePct: i.hardcorePct / sum,
    maximizerPct: i.maximizerPct / sum,
    botPct: i.botPct / sum,
  };
}

export const scenarios: Scenario[] = [
  {
    key: "base",
    name: "Base Case",
    description: "Normal assumptions.",
    apply: (b) => ({ ...b }),
  },
  {
    key: "optimistic",
    name: "Optimistic Case",
    description: "Higher retention and spending.",
    apply: (b) => ({
      ...b,
      monthlyRetention: Math.min(1, b.monthlyRetention * 1.15),
      sinkParticipation: Math.min(1, b.sinkParticipation * 1.2),
    }),
  },
  {
    key: "pessimistic",
    name: "Pessimistic Case",
    description: "Lower retention and lower sink participation.",
    apply: (b) => ({
      ...b,
      monthlyRetention: b.monthlyRetention * 0.8,
      sinkParticipation: b.sinkParticipation * 0.7,
    }),
  },
  {
    key: "bot_attack",
    name: "Bot Attack",
    description: "Bots increase reward extraction.",
    apply: (b) =>
      renormalizeShares({
        ...b,
        botPct: Math.min(0.6, b.botPct + 0.25),
      }),
  },
  {
    key: "token_price_drop",
    name: "Token Price Drop",
    description: "Manually entered lower token-price assumption.",
    apply: (b) => ({ ...b, tokenPriceScenario: b.tokenPriceScenario * 0.35 }),
  },
  {
    key: "growth_spike",
    name: "Player Growth Spike",
    description: "Many new players enter quickly.",
    apply: (b) => ({ ...b, newPlayersPerDay: b.newPlayersPerDay * 5 }),
  },
  {
    key: "player_collapse",
    name: "Player Collapse",
    description: "Daily active users fall sharply.",
    apply: (b) => ({
      ...b,
      monthlyRetention: b.monthlyRetention * 0.5,
      newPlayersPerDay: b.newPlayersPerDay * 0.2,
    }),
  },
  {
    key: "sink_failure",
    name: "Sink Failure",
    description: "Players stop buying useful items.",
    apply: (b) => ({ ...b, sinkParticipation: b.sinkParticipation * 0.25 }),
  },
  {
    key: "content_delay",
    name: "Content Delay",
    description: "New content is delayed.",
    apply: (b) => ({
      ...b,
      contentDelayMonths: b.contentDelayMonths + 3,
      newItemsPerMonth: 0,
    }),
  },
  {
    key: "topup_ends",
    name: "Treasury Top-Up Ends",
    description: "No new external funding.",
    apply: (b) => ({ ...b, treasuryMonthlyTopUp: 0 }),
  },
  {
    key: "fee_spike",
    name: "Chain Fee Spike",
    description: "Transaction fees rise.",
    apply: (b) => ({ ...b, feePerClaim: b.feePerClaim * 8 }),
  },
  {
    key: "reward_surge",
    name: "Reward Campaign Surge",
    description: "A large event increases rewards temporarily.",
    apply: (b) => ({
      ...b,
      monthlyEventRewardsPerPlayer: b.monthlyEventRewardsPerPlayer + b.rewardPerActivity * 20,
      monthlyTokenRewardBudget: b.monthlyTokenRewardBudget * 1.5,
    }),
  },
];

export function runScenario(base: EconomySimInputs, key: ScenarioKey): EconomySimResult {
  const scenario = scenarios.find((s) => s.key === key);
  if (!scenario) throw new EconomySimError(`Unknown scenario: ${key}`);
  return runEconomySim(scenario.apply(base));
}

/** Sensible planning defaults for a small off-chain game (no token layer). */
export function defaultSimInputs(): EconomySimInputs {
  return {
    startingPlayers: 500,
    newPlayersPerDay: 10,
    monthlyRetention: 0.7,
    returningRate: 0.05,
    casualPct: 0.5,
    regularPct: 0.3,
    hardcorePct: 0.12,
    maximizerPct: 0.06,
    botPct: 0.02,
    rewardPerActivity: 6,
    activitiesPerCasual: 1,
    activitiesPerRegular: 3,
    activitiesPerHardcore: 6,
    activitiesPerMaximizer: 10,
    dailyRewardCap: 60,
    starterGrant: 250,
    monthlyEventRewardsPerPlayer: 20,
    sinkParticipation: 0.5,
    avgDailySpend: 16,
    monthlyCosmeticSpendPerPlayer: 30,
    destructionShare: 0.8,
    treasuryStartingReserve: 0,
    treasuryMinimumReserve: 0,
    treasuryMonthlyTopUp: 0,
    monthlyRevenueContribution: 0,
    monthlyTokenRewardBudget: 0,
    transactionFeeReserve: 0,
    feePerClaim: 0,
    claimsPerMonth: 0,
    newItemsPerMonth: 4,
    plannedContentMonths: 6,
    contentDelayMonths: 0,
    tokenPriceScenario: 1,
    tokenPriceBaseline: 1,
    marketplaceParticipation: 0,
    months: 12,
  };
}
