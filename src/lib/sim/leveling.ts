/**
 * Progression / level-curve simulator.
 *
 * Planning estimates based on assumptions — the UI must never present these
 * as promises about exact player behavior.
 */

export interface LevelCurveInputs {
  startingXpRequirement: number;
  /** Multiplicative growth per level, e.g. 1.12 = +12% per level. */
  xpGrowthRate: number;
  maxLevel: number;
  avgXpPerActivity: number;
  activitiesPerSession: number;
  sessionsPerDay: number;
  /** Multiplier applied to XP for players below the median level (0 = off). */
  catchUpMultiplier: number;
  /** Extra XP fraction from rested bonuses (0..1). */
  restedXpBonus: number;
  /** Max activities counted per day (0 = unlimited). */
  dailyActivityLimit: number;
  targetDaysToMax: number;
}

export interface LevelMilestone {
  level: number;
  xpRequired: number;
  cumulativeXp: number;
  activitiesNeeded: number;
  hoursEstimate: number;
  daysEstimate: number;
}

export interface LevelCurveResult {
  milestones: LevelMilestone[];
  totalXpToMax: number;
  totalActivitiesToMax: number;
  estimatedDaysToMax: number;
  estimatedHoursToMax: number;
  newPlayerPacing: string;
  midgamePacing: string;
  endgamePacing: string;
  grindWarning: string | null;
  contentExhaustionWarning: string | null;
  meetsTarget: boolean | null;
  disclaimer: string;
}

export const LEVELING_DISCLAIMER =
  "These are planning estimates based on assumptions. They do not promise exact player behavior.";

export class LevelingError extends Error {}

export function runLevelCurve(inputs: LevelCurveInputs): LevelCurveResult {
  const {
    startingXpRequirement,
    xpGrowthRate,
    maxLevel,
    avgXpPerActivity,
    activitiesPerSession,
    sessionsPerDay,
    catchUpMultiplier,
    restedXpBonus,
    dailyActivityLimit,
    targetDaysToMax,
  } = inputs;

  for (const [name, v] of Object.entries(inputs)) {
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new LevelingError(`Invalid input: ${name} must be a finite number`);
    }
  }
  if (startingXpRequirement <= 0) throw new LevelingError("Invalid input: startingXpRequirement must be positive");
  if (xpGrowthRate < 1 || xpGrowthRate > 3) throw new LevelingError("Invalid input: xpGrowthRate must be between 1 and 3");
  if (maxLevel < 2 || maxLevel > 1000) throw new LevelingError("Invalid input: maxLevel must be between 2 and 1000");
  if (avgXpPerActivity <= 0) throw new LevelingError("Invalid input: avgXpPerActivity must be positive");
  if (activitiesPerSession <= 0) throw new LevelingError("Invalid input: activitiesPerSession must be positive");
  if (sessionsPerDay <= 0) throw new LevelingError("Invalid input: sessionsPerDay must be positive");
  if (restedXpBonus < 0 || restedXpBonus > 1) throw new LevelingError("Invalid input: restedXpBonus must be between 0 and 1");
  if (catchUpMultiplier < 0) throw new LevelingError("Invalid input: catchUpMultiplier must not be negative");
  if (dailyActivityLimit < 0) throw new LevelingError("Invalid input: dailyActivityLimit must not be negative");

  const rawActivitiesPerDay = activitiesPerSession * sessionsPerDay;
  const activitiesPerDay =
    dailyActivityLimit > 0 ? Math.min(rawActivitiesPerDay, dailyActivityLimit) : rawActivitiesPerDay;
  const effectiveXpPerActivity = avgXpPerActivity * (1 + restedXpBonus);
  // Session length assumption: ~20 activities/hour for the hour estimate.
  const activitiesPerHour = 20;

  const milestones: LevelMilestone[] = [];
  let cumulativeXp = 0;
  let cumulativeActivities = 0;

  for (let level = 2; level <= maxLevel; level++) {
    const xpRequired = startingXpRequirement * Math.pow(xpGrowthRate, level - 2);
    cumulativeXp += xpRequired;
    // Catch-up applies below midpoint level.
    const catchUp =
      catchUpMultiplier > 0 && level <= maxLevel / 2 ? 1 + catchUpMultiplier : 1;
    const activitiesNeeded = xpRequired / (effectiveXpPerActivity * catchUp);
    cumulativeActivities += activitiesNeeded;
    milestones.push({
      level,
      xpRequired: Math.round(xpRequired),
      cumulativeXp: Math.round(cumulativeXp),
      activitiesNeeded: Math.round(activitiesNeeded * 10) / 10,
      hoursEstimate: Math.round((cumulativeActivities / activitiesPerHour) * 10) / 10,
      daysEstimate: Math.round((cumulativeActivities / activitiesPerDay) * 10) / 10,
    });
  }

  const totalActivities = cumulativeActivities;
  const estimatedDaysToMax = totalActivities / activitiesPerDay;
  const estimatedHoursToMax = totalActivities / activitiesPerHour;

  const third = Math.max(1, Math.floor(milestones.length / 3));
  const earlyDays = milestones[third - 1]?.daysEstimate ?? 0;
  const midDays = (milestones[third * 2 - 1]?.daysEstimate ?? 0) - earlyDays;
  const endDays = estimatedDaysToMax - earlyDays - midDays;

  const describePacing = (days: number, phase: string) => {
    if (days < 3) return `${phase}: fast (~${days.toFixed(1)} days)`;
    if (days < 21) return `${phase}: moderate (~${days.toFixed(1)} days)`;
    return `${phase}: slow (~${days.toFixed(1)} days)`;
  };

  // Grind warning: any single late level taking more than 3 days of play.
  const worstLevel = milestones.reduce(
    (worst, m) => (m.activitiesNeeded > worst.activitiesNeeded ? m : worst),
    milestones[0],
  );
  const worstLevelDays = worstLevel.activitiesNeeded / activitiesPerDay;
  const grindWarning =
    worstLevelDays > 3
      ? `Grind warning: level ${worstLevel.level} alone needs ~${worstLevelDays.toFixed(1)} days of typical play. Late-curve growth may be too steep.`
      : null;

  const contentExhaustionWarning =
    estimatedDaysToMax < 14
      ? `Content-exhaustion warning: typical players reach max level in ~${estimatedDaysToMax.toFixed(1)} days. Plan endgame content or slow the curve.`
      : null;

  const meetsTarget =
    targetDaysToMax > 0
      ? Math.abs(estimatedDaysToMax - targetDaysToMax) / targetDaysToMax <= 0.25
      : null;

  return {
    milestones,
    totalXpToMax: Math.round(cumulativeXp),
    totalActivitiesToMax: Math.round(totalActivities),
    estimatedDaysToMax: Math.round(estimatedDaysToMax * 10) / 10,
    estimatedHoursToMax: Math.round(estimatedHoursToMax * 10) / 10,
    newPlayerPacing: describePacing(earlyDays, "New-player pacing"),
    midgamePacing: describePacing(midDays, "Midgame pacing"),
    endgamePacing: describePacing(endDays, "Endgame pacing"),
    grindWarning,
    contentExhaustionWarning,
    meetsTarget,
    disclaimer: LEVELING_DISCLAIMER,
  };
}

export function defaultLevelCurveInputs(): LevelCurveInputs {
  return {
    startingXpRequirement: 100,
    xpGrowthRate: 1.12,
    maxLevel: 50,
    avgXpPerActivity: 25,
    activitiesPerSession: 10,
    sessionsPerDay: 1.5,
    catchUpMultiplier: 0,
    restedXpBonus: 0,
    dailyActivityLimit: 0,
    targetDaysToMax: 90,
  };
}
