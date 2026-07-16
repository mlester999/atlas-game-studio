import type {
  HowToPlaySection,
  TreasuryModel,
  VisualIdentity,
} from "@/lib/types";

/**
 * Seed helpers. Unknown information must stay visibly unknown — these
 * factories produce honest "Not Yet Defined" placeholders instead of
 * invented detail.
 */

export const NOT_YET_DEFINED = "NOT YET DEFINED";
export const PLANNING_REQUIRED = "PLANNING REQUIRED";

export function undefinedTreasury(): TreasuryModel {
  return {
    startingReserve: null,
    minimumReserve: null,
    monthlyFunding: null,
    rewardBudget: null,
    feeReserve: null,
    pendingLiability: null,
    activeClaims: null,
    runwayAssumptions: [],
    status: "not_yet_defined",
  };
}

export function undefinedVisualIdentity(
  overrides: Partial<VisualIdentity> = {},
): VisualIdentity {
  return {
    dimension: "not_yet_defined",
    pixelArt: null,
    viewpoint: "not_yet_defined",
    cameraBehavior: NOT_YET_DEFINED,
    characterStyle: NOT_YET_DEFINED,
    environmentStyle: NOT_YET_DEFINED,
    colorPalette: NOT_YET_DEFINED,
    animationStyle: NOT_YET_DEFINED,
    referenceNotes: "",
    productionArtReadiness: "not_yet_defined",
    placeholderCount: null,
    missingAssets: [],
    ...overrides,
  };
}

/** Standard How to Play skeleton. Sections without content render as missing. */
export function howToPlaySkeleton(
  known: Partial<Record<HowToPlayKey, string>> = {},
  knownStatus: Partial<Record<HowToPlayKey, HowToPlaySection["status"]>> = {},
): HowToPlaySection[] {
  return HOW_TO_PLAY_SECTIONS.map(({ key, title }) => ({
    key,
    title,
    content: known[key] ?? null,
    status: known[key] ? (knownStatus[key] ?? "planned") : "not_yet_defined",
  }));
}

export type HowToPlayKey =
  | "objective"
  | "first-five-minutes"
  | "first-hour"
  | "first-day"
  | "first-week"
  | "first-month"
  | "controls"
  | "movement"
  | "activity-rules"
  | "earning"
  | "spending"
  | "leveling"
  | "unlocking"
  | "social"
  | "failure-recovery"
  | "long-term-goals"
  | "endgame"
  | "returning-player";

export const HOW_TO_PLAY_SECTIONS: { key: HowToPlayKey; title: string }[] = [
  { key: "objective", title: "Player objective" },
  { key: "first-five-minutes", title: "First five minutes" },
  { key: "first-hour", title: "First hour" },
  { key: "first-day", title: "First day" },
  { key: "first-week", title: "First week" },
  { key: "first-month", title: "First month" },
  { key: "controls", title: "Controls" },
  { key: "movement", title: "Movement" },
  { key: "activity-rules", title: "Combat or activity rules" },
  { key: "earning", title: "Earning" },
  { key: "spending", title: "Spending" },
  { key: "leveling", title: "Leveling" },
  { key: "unlocking", title: "Unlocking" },
  { key: "social", title: "Social features" },
  { key: "failure-recovery", title: "Failure and recovery" },
  { key: "long-term-goals", title: "Long-term goals" },
  { key: "endgame", title: "Endgame" },
  { key: "returning-player", title: "Returning-player experience" },
];
