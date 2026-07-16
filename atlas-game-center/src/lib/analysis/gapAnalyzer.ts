import type { GameProject, Severity } from "@/lib/types";

/**
 * Rule-based Gap Analyzer.
 *
 * Each rule inspects a GameProject and reports a finding when a risky gap
 * exists. Rules never guess: they only fire on evidence in the data.
 */

export interface GapFinding {
  ruleKey: string;
  title: string;
  severity: Severity;
  whyItMatters: string;
  affectedSystems: string[];
  recommendedAction: string;
  relatedTest: string | null;
  relatedDecision: string | null;
}

interface GapRule {
  key: string;
  title: string;
  severity: Severity;
  whyItMatters: string;
  recommendedAction: string;
  check: (game: GameProject) => { fires: boolean; affected: string[] };
}

const hasMultiplayer = (g: GameProject) =>
  g.multiplayer.mode !== "single_player" && g.multiplayer.mode !== "not_yet_defined";

const rules: GapRule[] = [
  {
    key: "multiplayer-without-moderation",
    title: "Multiplayer without moderation",
    severity: "critical",
    whyItMatters:
      "Shared spaces without working moderation become unsafe quickly, and trust is very hard to win back.",
    recommendedAction:
      "Design and accept moderation (report, block, mute, chat filtering) before promoting multiplayer.",
    check: (g) => ({
      fires:
        hasMultiplayer(g) &&
        (g.multiplayer.moderationStatus === "not_yet_defined" ||
          g.multiplayer.moderationStatus === "unknown"),
      affected: ["multiplayer"],
    }),
  },
  {
    key: "trading-without-atomic-settlement",
    title: "Trading without atomic settlement",
    severity: "critical",
    whyItMatters:
      "Non-atomic trades allow item duplication and theft — the classic way game economies are destroyed.",
    recommendedAction:
      "Specify atomic, server-authoritative settlement before enabling any trading.",
    check: (g) => {
      const tradingSystems = g.systems.filter(
        (s) =>
          s.name.toLowerCase().includes("trad") &&
          s.implementationStatus !== "not_yet_defined" &&
          s.implementationStatus !== "disabled",
      );
      const lacksSettlement = tradingSystems.filter(
        (s) =>
          !s.technicalExplanation.toLowerCase().includes("atomic") &&
          !s.technicalExplanation.toLowerCase().includes("receipt") &&
          !s.technicalExplanation.toLowerCase().includes("ledger"),
      );
      return {
        fires: lacksSettlement.length > 0,
        affected: lacksSettlement.map((s) => s.key),
      };
    },
  },
  {
    key: "token-rewards-without-treasury",
    title: "Token rewards without treasury planning",
    severity: "blocked",
    whyItMatters:
      "Token rewards with no treasury plan means unbounded liability — the treasury question must be answered first.",
    recommendedAction:
      "Complete a treasury model (reserve, floor, funding, budget) before activating any token earning path.",
    check: (g) => {
      const activeToken = g.earningPaths.filter(
        (p) => p.rewardType === "token" && p.active,
      );
      return {
        fires: activeToken.length > 0 && g.treasury.status !== "owner_tested" && g.treasury.status !== "locally_complete",
        affected: activeToken.map((p) => p.key),
      };
    },
  },
  {
    key: "token-payouts-without-legal",
    title: "Token payouts without legal review",
    severity: "blocked",
    whyItMatters:
      "Real-value payouts carry securities, tax, and consumer-protection obligations that vary by jurisdiction.",
    recommendedAction: "Obtain legal review before any real-value payout goes live.",
    check: (g) => {
      const risky = g.earningPaths.filter(
        (p) => p.active && p.legalReviewRequired && p.rewardType !== "in_game",
      );
      return { fires: risky.length > 0, affected: risky.map((p) => p.key) };
    },
  },
  {
    key: "strong-sources-weak-sinks",
    title: "Currency with strong sources but weak sinks",
    severity: "high",
    whyItMatters:
      "When earning outpaces useful spending, balances balloon, rewards lose meaning, and shops die.",
    recommendedAction:
      "Add or strengthen optional, repeatable sinks players actually want.",
    check: (g) => {
      const fires =
        g.economySources.length > 0 &&
        g.economySinks.length === 0;
      return { fires, affected: g.currencies.map((c) => c.key) };
    },
  },
  {
    key: "excessive-sinks",
    title: "Currency with excessive sinks",
    severity: "high",
    whyItMatters:
      "Mandatory costs without matching earnings block progression and drive players away.",
    recommendedAction: "Rebalance mandatory sinks or add reliable earn paths.",
    check: (g) => {
      const mandatory = g.economySinks.filter((s) => s.mandatory);
      const fires = mandatory.length > 0 && g.economySources.length === 0;
      return { fires, affected: mandatory.map((s) => s.key) };
    },
  },
  {
    key: "no-onboarding",
    title: "No clear onboarding",
    severity: "high",
    whyItMatters:
      "Players decide in the first five minutes. Without a designed opening, most never see the good parts.",
    recommendedAction: "Define the first five minutes in the How to Play workspace.",
    check: (g) => {
      const first5 = g.howToPlay.find((s) => s.key === "first-five-minutes");
      return { fires: !first5?.content, affected: ["how-to-play"] };
    },
  },
  {
    key: "no-late-progression",
    title: "No progression beyond early game",
    severity: "high",
    whyItMatters:
      "If every progression system stops early, players have nothing to chase after the first sessions.",
    recommendedAction: "Plan midgame and long-term progression arcs.",
    check: (g) => ({
      fires:
        g.progressionSystems.length > 0 &&
        g.progressionSystems.every(
          (p) => p.status === "not_yet_defined" || p.status === "unknown",
        ),
      affected: g.progressionSystems.map((p) => p.key),
    }),
  },
  {
    key: "no-endgame",
    title: "No endgame",
    severity: "high",
    whyItMatters:
      "Dedicated players hit the ceiling first and are the loudest when nothing is there.",
    recommendedAction: "Define the endgame section in How to Play.",
    check: (g) => {
      const endgame = g.howToPlay.find((s) => s.key === "endgame");
      return { fires: !endgame?.content, affected: ["how-to-play"] };
    },
  },
  {
    key: "no-content-cadence",
    title: "No content cadence",
    severity: "high",
    whyItMatters:
      "Without a release rhythm, content exhaustion is a matter of when, not if.",
    recommendedAction: "Commit to a content release cadence in the Content Longevity Lab.",
    check: (g) => ({
      fires:
        g.contentPlans.length > 0 &&
        g.contentPlans.every(
          (c) =>
            c.releaseCadence.includes("NOT YET DEFINED") ||
            c.releaseCadence.includes("PLANNING"),
        ),
      affected: g.contentPlans.map((c) => c.key),
    }),
  },
  {
    key: "no-catchup",
    title: "No new-player catch-up",
    severity: "medium",
    whyItMatters:
      "In long-lived games, newcomers who can never catch up stop joining — the population ages out.",
    recommendedAction: "Plan a catch-up mechanic (rested XP, scaling, seasonal resets).",
    check: (g) => {
      const hasCatchup = g.progressionSystems.some(
        (p) =>
          p.pacing.toLowerCase().includes("catch") ||
          p.resetBehavior.toLowerCase().includes("season"),
      );
      return {
        fires:
          g.progressionSystems.length > 0 &&
          !hasCatchup &&
          g.developmentStage !== "concept",
        affected: g.progressionSystems.map((p) => p.key),
      };
    },
  },
  {
    key: "dev-markers-in-production",
    title: "Production worlds using many development markers",
    severity: "medium",
    whyItMatters:
      "Placeholder art in production reads as broken and undermines the premium feel.",
    recommendedAction: "Schedule production-art replacement in the Graphics and Asset Lab.",
    check: (g) => ({
      fires: (g.visualIdentity.placeholderCount ?? 0) > 10,
      affected: ["graphics"],
    }),
  },
  {
    key: "local-but-unhosted",
    title: "Locally complete but unhosted",
    severity: "high",
    whyItMatters:
      "Local completeness can quietly masquerade as production readiness — hosted validation is a different bar.",
    recommendedAction: "Track and schedule hosted validation for locally complete systems.",
    check: (g) => {
      const local = g.systems.filter(
        (s) =>
          s.implementationStatus === "locally_complete" &&
          (s.hostedStatus === "hosted_pending" || s.hostedStatus === "not_yet_defined"),
      );
      return { fires: local.length > 0, affected: local.map((s) => s.key) };
    },
  },
  {
    key: "no-owner-acceptance",
    title: "No owner acceptance",
    severity: "medium",
    whyItMatters:
      "Systems nobody has personally accepted accumulate silent risk — reported complete is not verified.",
    recommendedAction: "Run owner acceptance passes in the Testing Lab.",
    check: (g) => {
      const pending = g.systems.filter(
        (s) =>
          s.implementationStatus !== "not_yet_defined" &&
          s.implementationStatus !== "planned" &&
          (s.ownerAcceptanceStatus === "acceptance_pending" ||
            s.ownerAcceptanceStatus === "deferred"),
      );
      return { fires: pending.length > 0, affected: pending.map((s) => s.key) };
    },
  },
  {
    key: "rewards-without-antibot",
    title: "Player rewards without anti-bot protection",
    severity: "high",
    whyItMatters:
      "Any reward worth earning is worth botting. Unprotected reward paths get farmed.",
    recommendedAction: "Add abuse controls (caps, receipts, eligibility) to active earning paths.",
    check: (g) => {
      const unprotected = g.earningPaths.filter(
        (p) => p.active && p.abuseControls.length === 0,
      );
      return { fires: unprotected.length > 0, affected: unprotected.map((p) => p.key) };
    },
  },
  {
    key: "marketplace-without-liquidity",
    title: "Marketplace without liquidity planning",
    severity: "high",
    whyItMatters:
      "A marketplace with listings but no buyers signals a dead economy louder than no marketplace at all.",
    recommendedAction: "Model buyer demand before building a marketplace.",
    check: (g) => {
      const market = g.systems.filter(
        (s) =>
          s.name.toLowerCase().includes("marketplace") &&
          s.implementationStatus !== "not_yet_defined" &&
          s.implementationStatus !== "disabled",
      );
      return { fires: market.length > 0, affected: market.map((s) => s.key) };
    },
  },
  {
    key: "undefined-core-loop",
    title: "No defined core loop",
    severity: "high",
    whyItMatters:
      "Without a core loop, every other design decision floats — this is the first thing to define.",
    recommendedAction: "Build the core loop in the Gameplay Loop Builder.",
    check: (g) => ({
      fires: g.coreLoops.filter((l) => l.kind === "primary").length === 0,
      affected: ["core-loop"],
    }),
  },
  {
    key: "continuous-p2e-without-revenue",
    title: "Continuous Play-to-Earn without real revenue",
    severity: "critical",
    whyItMatters:
      "Continuous token earnings funded by nothing but new buyers is the defining Play-to-Earn collapse pattern.",
    recommendedAction:
      "Do not activate continuous Play-to-Earn without real revenue funding — see the Play-to-Earn Education Center.",
    check: (g) => {
      const continuous = g.earningPaths.filter(
        (p) =>
          p.rewardType === "token" &&
          p.active &&
          p.sustainabilityMechanism.toLowerCase().includes("emission"),
      );
      return { fires: continuous.length > 0, affected: continuous.map((p) => p.key) };
    },
  },
];

export function analyzeGaps(game: GameProject): GapFinding[] {
  const findings: GapFinding[] = [];
  for (const rule of rules) {
    const { fires, affected } = rule.check(game);
    if (!fires) continue;
    findings.push({
      ruleKey: rule.key,
      title: rule.title,
      severity: rule.severity,
      whyItMatters: rule.whyItMatters,
      affectedSystems: affected,
      recommendedAction: rule.recommendedAction,
      relatedTest: game.tests.find((t) => affected.some((a) => t.key.includes(a)))?.key ?? null,
      relatedDecision:
        game.decisions.find((d) => affected.some((a) => d.key.includes(a)))?.key ?? null,
    });
  }
  const order: Severity[] = ["critical", "blocked", "high", "medium", "low", "info"];
  return findings.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
}

export const GAP_RULE_COUNT = rules.length;
