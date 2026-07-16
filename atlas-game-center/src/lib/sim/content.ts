/**
 * Content Longevity model.
 *
 * Estimates how long content lasts for different player archetypes.
 * Scenario-based — never a single guaranteed lifespan.
 */

export interface ContentInputs {
  worlds: number;
  areas: number;
  creatures: number;
  towers: number;
  crops: number;
  recipes: number;
  quests: number;
  activities: number;
  bosses: number;
  items: number;
  cosmetics: number;
  achievements: number;
  /** New meaningful content pieces released per month. */
  releaseCadencePerMonth: number;
  /** Average hours to fully experience one content piece. */
  avgHoursPerPiece: number;
  /** 0..1 — how much content invites replay (procedural, social, mastery). */
  replayabilityFactor: number;
  /** 0..1 — multiplayer replay value. */
  multiplayerReplayValue: number;
  seasonalContent: boolean;
  liveEvents: boolean;
}

export interface ArchetypeLongevity {
  archetype: string;
  hoursPerWeek: number;
  monthsUntilExhaustion: number | null;
  note: string;
}

export interface ContentLongevityResult {
  totalPieces: number;
  totalBaseHours: number;
  effectiveHours: number;
  earlyGameMonths: number;
  midGameMonths: number;
  endGameMonths: number;
  archetypes: ArchetypeLongevity[];
  bottlenecks: string[];
  productionBurden: string;
  recommendedCadence: string;
  replayabilityIdeas: string[];
  disclaimer: string;
}

export const CONTENT_DISCLAIMER =
  "Scenario estimates from your assumptions — content longevity is never one guaranteed lifespan.";

export class ContentSimError extends Error {}

const ARCHETYPES: { archetype: string; hoursPerWeek: number; consumptionRate: number }[] = [
  { archetype: "Casual player", hoursPerWeek: 3, consumptionRate: 0.6 },
  { archetype: "Regular player", hoursPerWeek: 8, consumptionRate: 0.85 },
  { archetype: "Hardcore player", hoursPerWeek: 20, consumptionRate: 1 },
  { archetype: "Reward maximizer", hoursPerWeek: 25, consumptionRate: 1.1 },
  { archetype: "Collector", hoursPerWeek: 12, consumptionRate: 0.95 },
  { archetype: "Social player", hoursPerWeek: 10, consumptionRate: 0.5 },
];

export function runContentLongevity(inputs: ContentInputs): ContentLongevityResult {
  for (const [name, v] of Object.entries(inputs)) {
    if (typeof v === "number" && (!Number.isFinite(v) || v < 0)) {
      throw new ContentSimError(`Invalid input: ${name} must be a non-negative finite number`);
    }
  }

  const countPieces =
    inputs.worlds * 8 +
    inputs.areas * 3 +
    inputs.creatures +
    inputs.towers * 2 +
    inputs.crops +
    inputs.recipes +
    inputs.quests +
    inputs.activities * 2 +
    inputs.bosses * 2 +
    inputs.items * 0.25 +
    inputs.cosmetics * 0.1 +
    inputs.achievements * 0.2;

  const totalPieces = Math.round(countPieces);
  const totalBaseHours = countPieces * inputs.avgHoursPerPiece;

  const replayMultiplier =
    1 +
    inputs.replayabilityFactor * 1.5 +
    inputs.multiplayerReplayValue * 1.2 +
    (inputs.seasonalContent ? 0.3 : 0) +
    (inputs.liveEvents ? 0.2 : 0);
  const effectiveHours = totalBaseHours * replayMultiplier;

  const monthlyNewHours = inputs.releaseCadencePerMonth * inputs.avgHoursPerPiece * replayMultiplier;

  const archetypes: ArchetypeLongevity[] = ARCHETYPES.map((a) => {
    const hoursPerMonth = a.hoursPerWeek * 4.33 * a.consumptionRate;
    if (hoursPerMonth <= monthlyNewHours) {
      return {
        archetype: a.archetype,
        hoursPerWeek: a.hoursPerWeek,
        monthsUntilExhaustion: null,
        note: "Release cadence keeps pace with this player's consumption — no exhaustion under these assumptions.",
      };
    }
    const months = effectiveHours / (hoursPerMonth - monthlyNewHours);
    return {
      archetype: a.archetype,
      hoursPerWeek: a.hoursPerWeek,
      monthsUntilExhaustion: Math.round(months * 10) / 10,
      note:
        months < 2
          ? "Exhausts content quickly — needs endgame or replayable systems."
          : months < 6
            ? "Comfortable for a season; plan the next content beat."
            : "Long horizon under these assumptions.",
    };
  });

  const hardcore = archetypes.find((a) => a.archetype === "Hardcore player");
  const casual = archetypes.find((a) => a.archetype === "Casual player");
  const earlyGameMonths = Math.round(((casual?.monthsUntilExhaustion ?? 12) * 0.25) * 10) / 10;
  const midGameMonths = Math.round(((casual?.monthsUntilExhaustion ?? 12) * 0.5) * 10) / 10;
  const endGameMonths = hardcore?.monthsUntilExhaustion ?? 12;

  const bottlenecks: string[] = [];
  if (inputs.quests < 10) bottlenecks.push("Quest count is low — guided goals run out early.");
  if (inputs.activities < 3) bottlenecks.push("Few repeatable activities — daily sessions get repetitive.");
  if (inputs.bosses === 0) bottlenecks.push("No boss milestones — progression lacks punctuation.");
  if (inputs.cosmetics < 10) bottlenecks.push("Small cosmetic catalog — expression and long-tail goals are thin.");
  if (inputs.releaseCadencePerMonth === 0) bottlenecks.push("No release cadence — every archetype eventually exhausts content.");

  const productionBurden =
    inputs.releaseCadencePerMonth >= 8
      ? "High: this cadence likely needs dedicated content staffing."
      : inputs.releaseCadencePerMonth >= 3
        ? "Moderate: sustainable for a small team with good tooling."
        : "Low: light cadence — replayable systems must carry longevity.";

  const hardcoreMonths = hardcore?.monthsUntilExhaustion;
  const recommendedCadence =
    hardcoreMonths != null && hardcoreMonths < 3
      ? "Increase cadence or add replayable/endgame systems: hardcore players exhaust content within a quarter."
      : "Current cadence looks workable; revisit after retention data exists.";

  const replayabilityIdeas = [
    "Procedural variation on repeatable activities",
    "Seasonal rotations that refresh existing content",
    "Social/cooperative modes that make old content new with friends",
    "Collection and mastery layers over existing content",
    "Challenge modifiers that reuse content at higher skill",
  ];

  return {
    totalPieces,
    totalBaseHours: Math.round(totalBaseHours),
    effectiveHours: Math.round(effectiveHours),
    earlyGameMonths,
    midGameMonths,
    endGameMonths: endGameMonths ?? 12,
    archetypes,
    bottlenecks,
    productionBurden,
    recommendedCadence,
    replayabilityIdeas,
    disclaimer: CONTENT_DISCLAIMER,
  };
}

export function defaultContentInputs(): ContentInputs {
  return {
    worlds: 1,
    areas: 5,
    creatures: 0,
    towers: 0,
    crops: 12,
    recipes: 20,
    quests: 15,
    activities: 4,
    bosses: 0,
    items: 60,
    cosmetics: 30,
    achievements: 40,
    releaseCadencePerMonth: 3,
    avgHoursPerPiece: 0.75,
    replayabilityFactor: 0.5,
    multiplayerReplayValue: 0.4,
    seasonalContent: false,
    liveEvents: false,
  };
}
