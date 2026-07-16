import type {
  CategoryKey,
  Currency,
  CurrencyType,
  DevelopmentStage,
  EconomySink,
  EconomySource,
  GameProject,
  GameplayLoop,
  LoopStep,
  MultiplayerProfile,
  ProgressionCategory,
  ProgressionSystem,
  VisualIdentity,
} from "@/lib/types";
import { howToPlaySkeleton, undefinedTreasury } from "@/data/seeds/helpers";

/**
 * Builds draft GameProjects from Add Game wizard selections.
 *
 * Everything a wizard produces is a plan: statuses are "planned" or
 * "not_yet_defined" — never implemented, never hosted, never accepted.
 */

export interface WizardCurrency {
  name: string;
  symbol: string;
  type: CurrencyType;
  onChain: boolean;
}

export interface WizardContentType {
  contentType: string;
  initialQuantity: number | null;
}

export type WizardBlockchainStatus =
  | "none"
  | "wallet_gated"
  | "token_rewards_planned"
  | "undecided";

export interface WizardState {
  /* Step 1 — identity */
  name: string;
  slug: string;
  tagline: string;
  description: string;
  primaryCategory: CategoryKey;
  secondaryCategories: CategoryKey[];
  targetAudience: string;
  platforms: string[];
  developmentStage: DevelopmentStage;
  /* Step 2 — visual identity */
  dimension: VisualIdentity["dimension"];
  pixelArt: boolean | null;
  viewpoint: VisualIdentity["viewpoint"];
  cameraBehavior: string;
  characterStyle: string;
  environmentStyle: string;
  colorPalette: string;
  animationStyle: string;
  referenceNotes: string;
  /* Step 3 — core gameplay loop */
  loopSteps: LoopStep[];
  /* Step 4 — progression */
  progressionPicks: ProgressionCategory[];
  /* Step 5 — economy */
  currencies: WizardCurrency[];
  sources: string[];
  sinks: string[];
  rewardFrequency: string;
  monetizationNotes: string;
  blockchainStatus: WizardBlockchainStatus;
  /* Step 6 — multiplayer */
  multiplayerMode: MultiplayerProfile["mode"];
  multiplayerFeatures: string[];
  /* Step 7 — content */
  contentTypes: WizardContentType[];
  /* Step 8 — technology */
  technology: {
    renderer: string;
    frontend: string;
    api: string;
    realtime: string;
    database: string;
    authentication: string;
    wallet: string;
    hosting: string;
    adminPortal: string;
    assetPipeline: string;
  };
}

export function emptyWizardState(): WizardState {
  return {
    name: "",
    slug: "",
    tagline: "",
    description: "",
    primaryCategory: "creature-collector",
    secondaryCategories: [],
    targetAudience: "",
    platforms: [],
    developmentStage: "concept",
    dimension: "not_yet_defined",
    pixelArt: null,
    viewpoint: "not_yet_defined",
    cameraBehavior: "",
    characterStyle: "",
    environmentStyle: "",
    colorPalette: "",
    animationStyle: "",
    referenceNotes: "",
    loopSteps: [],
    progressionPicks: [],
    currencies: [],
    sources: [],
    sinks: [],
    rewardFrequency: "",
    monetizationNotes: "",
    blockchainStatus: "undecided",
    multiplayerMode: "not_yet_defined",
    multiplayerFeatures: [],
    contentTypes: [],
    technology: {
      renderer: "",
      frontend: "",
      api: "",
      realtime: "",
      database: "",
      authentication: "",
      wallet: "",
      hosting: "",
      adminPortal: "",
      assetPipeline: "",
    },
  };
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Returns a slug not already used by any existing game. */
export function uniqueSlug(base: string, taken: string[]): string {
  const root = base || "untitled-game";
  if (!taken.includes(root)) return root;
  let n = 2;
  while (taken.includes(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const PROGRESSION_LABELS: Record<ProgressionCategory, string> = {
  player_level: "Player levels",
  account_rank: "Account rank",
  creature_level: "Creature levels",
  creature_evolution: "Creature evolution",
  tower_level: "Tower levels",
  skill_level: "Skill levels",
  profession_level: "Profession levels",
  equipment_tier: "Equipment tiers",
  world_region: "World regions",
  quest: "Quests",
  achievement: "Achievements",
  collection: "Collections",
  reputation: "Reputation",
  seasonal: "Seasons",
  prestige: "Prestige",
};

export const PROGRESSION_OPTIONS = Object.entries(PROGRESSION_LABELS) as [
  ProgressionCategory,
  string,
][];

function plannedProgression(category: ProgressionCategory): ProgressionSystem {
  return {
    key: `planned-${category}`,
    category,
    name: PROGRESSION_LABELS[category],
    currentLevelCap: null,
    intendedLevelCap: null,
    experienceSources: [],
    experienceCurve: "NOT YET DEFINED",
    unlocks: [],
    pacing: "NOT YET DEFINED",
    resetBehavior: "NOT YET DEFINED",
    prestigeBehavior: "NOT YET DEFINED",
    pros: [],
    cons: [],
    risks: [],
    status: "planned",
  };
}

function plannedCurrency(c: WizardCurrency): Currency {
  return {
    key: slugify(c.name) || "currency",
    name: c.name,
    symbol: c.symbol || c.name.slice(0, 4).toUpperCase(),
    type: c.type,
    onChain: c.onChain,
    withdrawable: false,
    transferable: false,
    convertible: false,
    purpose: "NOT YET DEFINED",
    sources: [],
    sinks: [],
    limits: [],
    issuancePolicy: "NOT YET DEFINED",
    destructionPolicy: "NOT YET DEFINED",
    inflationRisk: "unknown",
    sustainabilityStatus: "planned",
  };
}

function plannedSource(name: string): EconomySource {
  return {
    key: slugify(name) || "source",
    name,
    category: "planned",
    amount: null,
    frequency: "NOT YET DEFINED",
    cooldown: "NOT YET DEFINED",
    dailyLimit: null,
    eligibility: "NOT YET DEFINED",
    abuseRisk: "medium",
    fundingOrigin: "NOT YET DEFINED",
    status: "planned",
  };
}

function plannedSink(name: string): EconomySink {
  return {
    key: slugify(name) || "sink",
    name,
    category: "planned",
    cost: null,
    repeatability: "unknown",
    playerValue: "NOT YET DEFINED",
    mandatory: false,
    optional: true,
    sustainabilityImpact: "NOT YET DEFINED",
    status: "planned",
  };
}

/**
 * Builds a draft GameProject from wizard selections. Every selected feature
 * is marked PLANNED — the wizard can never create implemented features.
 */
export function buildDraftProject(
  state: WizardState,
  existingSlugs: string[],
): GameProject {
  const slug = uniqueSlug(state.slug || slugify(state.name), existingSlugs);
  const name = state.name.trim() || "Untitled Game";

  const primaryLoop: GameplayLoop | null =
    state.loopSteps.length > 0
      ? {
          key: "primary",
          kind: "primary",
          name: "Primary loop (planned)",
          steps: state.loopSteps,
          repeatFrequency: "NOT YET DEFINED",
          playerMotivation: "NOT YET DEFINED",
          reward: state.loopSteps.some((s) => s.isReward)
            ? "Planned reward step in loop"
            : "NOT YET DEFINED",
          spendingOpportunity: state.loopSteps.some((s) => s.isSpend)
            ? "Planned spending step in loop"
            : "NOT YET DEFINED",
          failureState: state.loopSteps.some((s) => s.isFailureState)
            ? "Planned failure step in loop"
            : "NOT YET DEFINED",
          longTermPurpose: "NOT YET DEFINED",
          status: "planned",
        }
      : null;

  const multiplayerSummary =
    state.multiplayerMode === "not_yet_defined"
      ? "NOT YET DEFINED"
      : `Planned: ${state.multiplayerMode.replace(/_/g, " ")}${
          state.multiplayerFeatures.length
            ? ` with ${state.multiplayerFeatures.join(", ").toLowerCase()}`
            : ""
        }. Nothing is implemented.`;

  const techEntries = Object.entries(state.technology).filter(([, v]) => v.trim());
  const technologySummary = techEntries.length
    ? `Planned stack: ${techEntries.map(([k, v]) => `${k}: ${v}`).join("; ")}.`
    : "NOT YET DEFINED";

  return {
    id: newId(),
    slug,
    name,
    tagline: state.tagline || "Planning draft",
    description: state.description || "PLANNING REQUIRED",
    primaryCategory: state.primaryCategory,
    secondaryCategories: state.secondaryCategories,
    coreLoopCategory: null,
    economyCategory:
      state.blockchainStatus === "none"
        ? "off-chain-economy"
        : state.blockchainStatus === "token_rewards_planned"
          ? "hybrid-economy"
          : null,
    multiplayerCategory: null,
    visualCategory:
      state.dimension === "not_yet_defined"
        ? "NOT YET DEFINED"
        : `${state.dimension.toUpperCase()}${state.pixelArt ? " pixel" : ""} ${
            state.viewpoint === "not_yet_defined" ? "" : state.viewpoint.replace(/_/g, "-")
          }`.trim(),
    targetAudience: state.targetAudience || "NOT YET DEFINED",
    platforms: state.platforms,
    developmentStage: state.developmentStage,
    currentFocus: "Planning — created with the Add Game wizard.",
    galaxyWorld: "draft_nebula",
    visualIdentity: {
      dimension: state.dimension,
      pixelArt: state.pixelArt,
      viewpoint: state.viewpoint,
      cameraBehavior: state.cameraBehavior || "NOT YET DEFINED",
      characterStyle: state.characterStyle || "NOT YET DEFINED",
      environmentStyle: state.environmentStyle || "NOT YET DEFINED",
      colorPalette: state.colorPalette || "NOT YET DEFINED",
      animationStyle: state.animationStyle || "NOT YET DEFINED",
      referenceNotes: state.referenceNotes,
      productionArtReadiness: "not_yet_defined",
      placeholderCount: null,
      missingAssets: [],
    },
    coreLoops: primaryLoop ? [primaryLoop] : [],
    howToPlay: howToPlaySkeleton(),
    progressionSystems: state.progressionPicks.map(plannedProgression),
    systems: state.multiplayerFeatures.map((f) => ({
      key: `planned-${slugify(f)}`,
      category: "multiplayer" as const,
      name: f,
      simpleExplanation: `${f} is planned for this game. It does not exist yet.`,
      designExplanation: "Planned during the Add Game wizard — design details pending.",
      technicalExplanation: "NOT YET DEFINED",
      purpose: "NOT YET DEFINED",
      playerExperience: "NOT YET DEFINED",
      implementationStatus: "planned" as const,
      hostedStatus: "not_yet_defined" as const,
      ownerAcceptanceStatus: "not_yet_defined" as const,
      publicationStatus: "unpublished" as const,
      dependencies: [],
      pros: [],
      cons: [],
      risks: [],
      blockers: [],
      missingItems: [],
      tests: [],
      nextActions: [],
      evidence: [],
      publicSafe: true,
    })),
    currencies: state.currencies.filter((c) => c.name.trim()).map(plannedCurrency),
    economySources: state.sources.filter((s) => s.trim()).map(plannedSource),
    economySinks: state.sinks.filter((s) => s.trim()).map(plannedSink),
    treasury: undefinedTreasury(),
    economyCandidates: [],
    earningPaths: [],
    contentPlans: state.contentTypes
      .filter((c) => c.contentType.trim())
      .map((c) => ({
        key: slugify(c.contentType),
        contentType: c.contentType,
        initialQuantity: c.initialQuantity,
        releaseCadence: "NOT YET DEFINED",
        productionCost: "unknown" as const,
        replayability: "unknown" as const,
        dependency: "NOT YET DEFINED",
        exhaustionRisk: "unknown" as const,
        status: "planned" as const,
      })),
    liveOps: [],
    risks: [],
    tests: [],
    decisions: [],
    roadmap: [],
    multiplayer: {
      mode: state.multiplayerMode,
      channelCapacity: null,
      features: [],
      moderationStatus: "not_yet_defined",
      summary: multiplayerSummary,
    },
    progressionSummary: state.progressionPicks.length
      ? `Planned progression tracks: ${state.progressionPicks
          .map((p) => PROGRESSION_LABELS[p].toLowerCase())
          .join(", ")}. Curves and caps: NOT YET DEFINED.`
      : "NOT YET DEFINED",
    economySummary: state.currencies.length
      ? `Planned currencies: ${state.currencies
          .filter((c) => c.name.trim())
          .map((c) => c.name)
          .join(", ")}. Sources, sinks, and balancing: PLANNING REQUIRED.`
      : "NOT YET DEFINED",
    multiplayerSummary,
    technologySummary,
    currentBlocker: null,
    recommendedNextAction:
      "Refine this draft in its workspace: define the core loop, onboarding, and economy sinks first.",
    latestVerifiedUpdate: "Draft created with the Add Game wizard — nothing implemented.",
    publicSafe: false,
    origin: "draft",
  };
}

/**
 * Wizard-specific planning warnings that fire before the draft exists,
 * complementing the Gap Analyzer rules that run on the built project.
 */
export interface WizardWarning {
  key: string;
  severity: "critical" | "blocked" | "high" | "medium";
  title: string;
  detail: string;
}

export function wizardWarnings(state: WizardState): WizardWarning[] {
  const warnings: WizardWarning[] = [];
  const features = state.multiplayerFeatures.map((f) => f.toLowerCase());

  if (state.blockchainStatus === "token_rewards_planned") {
    warnings.push({
      key: "token-rewards-planning",
      severity: "blocked",
      title: "Token rewards need treasury planning and legal review",
      detail:
        "You selected planned token rewards. Before these can ever activate, the game needs a treasury model (reserve, floor, funding) and legal review. The workspace will keep them BLOCKED until then.",
    });
  }
  if (
    state.multiplayerMode !== "single_player" &&
    state.multiplayerMode !== "not_yet_defined" &&
    !features.some((f) => f.includes("moderation") || f.includes("report"))
  ) {
    warnings.push({
      key: "multiplayer-moderation",
      severity: "critical",
      title: "Multiplayer without moderation",
      detail:
        "You planned multiplayer but no moderation features (report, block, mute). Shared spaces without moderation become unsafe quickly.",
    });
  }
  if (features.some((f) => f.includes("trad"))) {
    warnings.push({
      key: "trading-settlement",
      severity: "critical",
      title: "Trading needs atomic settlement",
      detail:
        "Player trading is planned. Trades must be designed as atomic, server-authoritative settlements or the economy can be destroyed by duplication exploits.",
    });
  }
  if (state.sources.filter((s) => s.trim()).length > 0 && state.sinks.filter((s) => s.trim()).length === 0) {
    warnings.push({
      key: "sources-without-sinks",
      severity: "high",
      title: "Currency sources without sinks",
      detail:
        "You planned ways for players to earn but nothing for them to spend on. Earning without spending inflates balances until rewards feel meaningless.",
    });
  }
  if (state.sinks.filter((s) => s.trim()).length > 0 && state.sources.filter((s) => s.trim()).length === 0) {
    warnings.push({
      key: "sinks-without-sources",
      severity: "high",
      title: "Currency sinks without sources",
      detail:
        "You planned costs but no earning paths. Players who cannot earn enough to participate comfortably leave.",
    });
  }
  if (state.currencies.some((c) => c.onChain)) {
    warnings.push({
      key: "onchain-currency",
      severity: "high",
      title: "On-chain currency increases every risk",
      detail:
        "An on-chain currency adds bot pressure, treasury liability, fee costs, and legal obligations. Plan the off-chain version of the economy first.",
    });
  }
  if (state.loopSteps.length === 0) {
    warnings.push({
      key: "no-core-loop",
      severity: "high",
      title: "No core loop yet",
      detail:
        "Without a core gameplay loop every other design decision floats. You can create the workspace anyway, but the loop is the first thing to define.",
    });
  }
  return warnings;
}
