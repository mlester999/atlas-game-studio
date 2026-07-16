/**
 * Central typed data architecture for Game Studio Atlas.
 *
 * Every game workspace, template, simulator, and lab reads from these types.
 * Game information must never be scattered through JSX — it lives in
 * `src/data/*` (seeds) and in the browser database (owner edits, drafts,
 * experiments), always shaped by this file.
 */

import type { Status, Severity } from "./status";

export type { Status, Severity };

/* ------------------------------------------------------------------ */
/* Viewing modes                                                       */
/* ------------------------------------------------------------------ */

/** Presentation depth only — modes never change underlying data. */
export type ViewingMode = "simple" | "design" | "technical";

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export type CategoryKey =
  | "creature-collector"
  | "monster-battler"
  | "tower-defense"
  | "tower-strategy"
  | "cozy-farming"
  | "life-simulation"
  | "social-mmo"
  | "sailing-adventure"
  | "pirate-trading"
  | "exploration-rpg"
  | "crafting-game"
  | "survival"
  | "idle-incremental"
  | "pve-adventure"
  | "pvp-arena"
  | "blockchain-enabled"
  | "wallet-gated"
  | "off-chain-economy"
  | "hybrid-economy";

export interface GameCategory {
  key: CategoryKey;
  name: string;
  /** Which axis of a game this category usually describes. */
  axis: "gameplay" | "economy" | "multiplayer" | "visual" | "platform";
  typicalPlayerExperience: string;
  commonCoreLoops: string[];
  commonProgressionSystems: string[];
  expectedContentNeeds: string[];
  monetizationOpportunities: string[];
  economyRisks: string[];
  retentionStrengths: string[];
  developmentComplexity: "low" | "medium" | "high" | "very high";
  multiplayerComplexity: "none" | "low" | "medium" | "high" | "very high";
  commonFailureReasons: string[];
}

/* ------------------------------------------------------------------ */
/* Gameplay loops                                                      */
/* ------------------------------------------------------------------ */

export type LoopKind = "primary" | "secondary" | "long_term" | "social" | "economy";

export type LoopNodeKind =
  | "explore"
  | "battle"
  | "gather"
  | "plant"
  | "harvest"
  | "craft"
  | "cook"
  | "catch"
  | "train"
  | "evolve"
  | "defend"
  | "build"
  | "upgrade"
  | "trade"
  | "socialize"
  | "travel"
  | "wait"
  | "complete_activity"
  | "receive_reward"
  | "spend_reward"
  | "custom";

export interface LoopStep {
  id: string;
  kind: LoopNodeKind;
  label: string;
  /** Marks that analyzers use. */
  isReward?: boolean;
  isSpend?: boolean;
  isWait?: boolean;
  isSocial?: boolean;
  isFailureState?: boolean;
  isRetentionHook?: boolean;
  notes?: string;
}

export interface GameplayLoop {
  key: string;
  kind: LoopKind;
  name: string;
  steps: LoopStep[];
  repeatFrequency: string;
  playerMotivation: string;
  reward: string;
  spendingOpportunity: string;
  failureState: string;
  longTermPurpose: string;
  status: Status;
}

/* ------------------------------------------------------------------ */
/* Progression                                                         */
/* ------------------------------------------------------------------ */

export type ProgressionCategory =
  | "player_level"
  | "account_rank"
  | "creature_level"
  | "creature_evolution"
  | "tower_level"
  | "skill_level"
  | "profession_level"
  | "equipment_tier"
  | "world_region"
  | "quest"
  | "achievement"
  | "collection"
  | "reputation"
  | "seasonal"
  | "prestige";

export interface ProgressionSystem {
  key: string;
  category: ProgressionCategory;
  name: string;
  currentLevelCap: number | null;
  intendedLevelCap: number | null;
  experienceSources: string[];
  experienceCurve: string;
  unlocks: string[];
  pacing: string;
  resetBehavior: string;
  prestigeBehavior: string;
  pros: string[];
  cons: string[];
  risks: string[];
  status: Status;
}

/* ------------------------------------------------------------------ */
/* Game systems                                                        */
/* ------------------------------------------------------------------ */

export type SystemCategory =
  | "gameplay"
  | "progression"
  | "economy"
  | "social"
  | "multiplayer"
  | "content"
  | "graphics"
  | "technical"
  | "admin"
  | "security"
  | "blockchain"
  | "live_ops";

export interface GameSystem {
  key: string;
  category: SystemCategory;
  name: string;
  /** Mode-specific explanations. Presentation depth only. */
  simpleExplanation: string;
  designExplanation: string;
  technicalExplanation: string;
  purpose: string;
  playerExperience: string;
  implementationStatus: Status;
  hostedStatus: Status;
  ownerAcceptanceStatus: Status;
  publicationStatus: "published" | "unpublished" | "not_applicable";
  dependencies: string[];
  pros: string[];
  cons: string[];
  risks: string[];
  blockers: string[];
  missingItems: string[];
  tests: string[];
  nextActions: string[];
  evidence: string[];
  /** Safe to show in Public Share Mode. */
  publicSafe: boolean;
}

/* ------------------------------------------------------------------ */
/* Economy                                                             */
/* ------------------------------------------------------------------ */

export type CurrencyType = "soft" | "premium" | "seasonal" | "token" | "material";

export interface Currency {
  key: string;
  name: string;
  symbol: string;
  type: CurrencyType;
  onChain: boolean;
  withdrawable: boolean;
  transferable: boolean;
  convertible: boolean;
  purpose: string;
  sources: string[];
  sinks: string[];
  limits: string[];
  issuancePolicy: string;
  destructionPolicy: string;
  inflationRisk: "low" | "medium" | "high" | "unknown";
  sustainabilityStatus: Status;
}

export interface EconomySource {
  key: string;
  name: string;
  category: string;
  /** Amount per completion, in the game's soft currency. */
  amount: number | null;
  frequency: string;
  cooldown: string;
  dailyLimit: number | null;
  eligibility: string;
  abuseRisk: "low" | "medium" | "high";
  fundingOrigin: string;
  status: Status;
}

export interface EconomySink {
  key: string;
  name: string;
  category: string;
  cost: number | null;
  repeatability: "one_time" | "repeatable" | "consumable" | "unknown";
  playerValue: string;
  mandatory: boolean;
  optional: boolean;
  sustainabilityImpact: string;
  status: Status;
}

export interface TreasuryModel {
  startingReserve: number | null;
  minimumReserve: number | null;
  monthlyFunding: number | null;
  rewardBudget: number | null;
  feeReserve: number | null;
  pendingLiability: number | null;
  activeClaims: number | null;
  runwayAssumptions: string[];
  status: Status;
}

export type EarningRewardType = "in_game" | "token" | "real_world";

export interface PlayerEarningPath {
  key: string;
  name: string;
  rewardType: EarningRewardType;
  active: boolean;
  earningMethod: string;
  playerRequirements: string[];
  limits: string[];
  sustainabilityMechanism: string;
  abuseControls: string[];
  treasuryDependency: "none" | "low" | "medium" | "high";
  legalReviewRequired: boolean;
  risks: string[];
  status: Status;
}

export interface EconomyCandidate {
  id: string;
  code: string;
  name: string;
  planningChange: string;
  ratio180dBalanced: number;
  beginnerAffordability: number;
  review: string;
  isRecommended: boolean;
  unpublished: boolean;
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export interface ContentPlan {
  key: string;
  contentType: string;
  initialQuantity: number | null;
  releaseCadence: string;
  productionCost: "low" | "medium" | "high" | "unknown";
  replayability: "low" | "medium" | "high" | "unknown";
  dependency: string;
  exhaustionRisk: "low" | "medium" | "high" | "unknown";
  status: Status;
}

/* ------------------------------------------------------------------ */
/* Risks                                                               */
/* ------------------------------------------------------------------ */

export interface Risk {
  key: string;
  title: string;
  severity: Severity;
  category: string;
  explanation: string;
  impact: string;
  likelihood: "low" | "medium" | "high" | "unknown";
  prevention: string;
  detection: string;
  response: string;
  ownerAction: string;
  status: "open" | "mitigated" | "accepted" | "closed";
  /** Safe to show in Public Share Mode (exploit details never are). */
  publicSafe: boolean;
}

/* ------------------------------------------------------------------ */
/* Testing                                                             */
/* ------------------------------------------------------------------ */

export type TestState = "not_tested" | "passed" | "failed" | "blocked" | "skipped";

export interface TestCase {
  key: string;
  group: string;
  title: string;
  instructions: string[];
  expectedResult: string[];
  state: TestState;
  notes: string;
  evidence: string;
  testedAt: string | null;
  testedBy: string | null;
}

/* ------------------------------------------------------------------ */
/* Decisions                                                           */
/* ------------------------------------------------------------------ */

export type DecisionApproval =
  | "open"
  | "recommended"
  | "accepted"
  | "rejected"
  | "deferred";

export interface DecisionRecord {
  key: string;
  title: string;
  question: string;
  context: string;
  options: string[];
  pros: string[];
  cons: string[];
  risks: string[];
  selectedOption: string | null;
  approvalStatus: DecisionApproval;
  evidence: string[];
  reviewDate: string | null;
  reversalConditions: string;
  publicSafe: boolean;
}

/* ------------------------------------------------------------------ */
/* Visual identity / graphics                                          */
/* ------------------------------------------------------------------ */

export interface VisualIdentity {
  dimension: "2d" | "3d" | "not_yet_defined";
  pixelArt: boolean | null;
  viewpoint:
    | "top_down"
    | "side_view"
    | "isometric"
    | "perspective"
    | "not_yet_defined";
  cameraBehavior: string;
  characterStyle: string;
  environmentStyle: string;
  colorPalette: string;
  animationStyle: string;
  referenceNotes: string;
  productionArtReadiness: Status;
  placeholderCount: number | null;
  missingAssets: string[];
}

/* ------------------------------------------------------------------ */
/* Multiplayer                                                         */
/* ------------------------------------------------------------------ */

export interface MultiplayerProfile {
  mode:
    | "single_player"
    | "nearby_multiplayer"
    | "channels"
    | "cooperative"
    | "competitive"
    | "mixed"
    | "not_yet_defined";
  channelCapacity: number | null;
  features: GameSystem[];
  moderationStatus: Status;
  summary: string;
}

/* ------------------------------------------------------------------ */
/* Live operations                                                     */
/* ------------------------------------------------------------------ */

export interface LiveOpsEntry {
  key: string;
  name: string;
  cadence:
    | "daily"
    | "weekly"
    | "monthly"
    | "seasonal"
    | "one_off"
    | "not_yet_defined";
  rewardBudget: string;
  contentDependency: string;
  economyImpact: string;
  requiredModeration: string;
  requiredSupport: string;
  requiredTesting: string;
  releaseOwner: string;
  rollbackPlan: string;
  status: Status;
}

/* ------------------------------------------------------------------ */
/* Roadmap                                                             */
/* ------------------------------------------------------------------ */

export interface RoadmapItem {
  key: string;
  name: string;
  description: string;
  phase: string;
  status: Status;
  blockers: string[];
  publicSafe: boolean;
}

/* ------------------------------------------------------------------ */
/* How to Play                                                         */
/* ------------------------------------------------------------------ */

export interface HowToPlaySection {
  key: string;
  title: string;
  /** null / empty content means the explanation is missing and highlighted. */
  content: string | null;
  status: Status;
}

/* ------------------------------------------------------------------ */
/* Game project                                                        */
/* ------------------------------------------------------------------ */

export type DevelopmentStage =
  | "concept"
  | "planning"
  | "prototype"
  | "in_development"
  | "testing"
  | "near_launch"
  | "live"
  | "paused";

export type GalaxyWorldKind =
  | "cozy_planet"
  | "creature_habitat"
  | "pixel_town"
  | "tropical_island"
  | "tower"
  | "draft_nebula";

export interface GameProject {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  primaryCategory: CategoryKey;
  secondaryCategories: CategoryKey[];
  coreLoopCategory: CategoryKey | null;
  economyCategory: CategoryKey | null;
  multiplayerCategory: CategoryKey | null;
  visualCategory: string;
  targetAudience: string;
  platforms: string[];
  developmentStage: DevelopmentStage;
  currentFocus: string;
  galaxyWorld: GalaxyWorldKind;
  visualIdentity: VisualIdentity;
  coreLoops: GameplayLoop[];
  howToPlay: HowToPlaySection[];
  progressionSystems: ProgressionSystem[];
  systems: GameSystem[];
  currencies: Currency[];
  economySources: EconomySource[];
  economySinks: EconomySink[];
  treasury: TreasuryModel;
  economyCandidates: EconomyCandidate[];
  earningPaths: PlayerEarningPath[];
  contentPlans: ContentPlan[];
  liveOps: LiveOpsEntry[];
  risks: Risk[];
  tests: TestCase[];
  decisions: DecisionRecord[];
  roadmap: RoadmapItem[];
  multiplayer: MultiplayerProfile;
  progressionSummary: string;
  economySummary: string;
  multiplayerSummary: string;
  technologySummary: string;
  currentBlocker: string | null;
  recommendedNextAction: string;
  latestVerifiedUpdate: string;
  /** Whether this project may appear at all in Public Share Mode. */
  publicSafe: boolean;
  /** Seeded games are read-only baselines; drafts are owner-created. */
  origin: "seed" | "draft" | "experiment";
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export interface GameTemplate {
  key: string;
  name: string;
  forCategories: CategoryKey[];
  typicalCoreLoop: string[];
  possibleSystems: string[];
  risks: string[];
  description: string;
}

/* ------------------------------------------------------------------ */
/* Tinker Lab experiments                                              */
/* ------------------------------------------------------------------ */

export interface Experiment {
  id: string;
  name: string;
  baseGameSlug: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  /** A full editable copy — never mutates the verified project. */
  snapshot: GameProject;
  simulatorInputs: Record<string, unknown> | null;
  promotedToDraft: boolean;
}

/* ------------------------------------------------------------------ */
/* Export / import                                                     */
/* ------------------------------------------------------------------ */

export interface AtlasExport {
  format: "atlas-game-center";
  version: 1;
  exportedAt: string;
  drafts: GameProject[];
  experiments: Experiment[];
  testOverrides: Record<string, TestCase[]>;
  decisionOverrides: Record<string, DecisionRecord[]>;
  notes: Record<string, string>;
}
