import type { GameplayLoop, LoopStep } from "@/lib/types";

/**
 * Gameplay-loop analyzer: inspects a loop's steps for structural problems.
 */

export interface LoopFinding {
  key: string;
  title: string;
  severity: "high" | "medium" | "low";
  detail: string;
}

export function analyzeLoopSteps(steps: LoopStep[]): LoopFinding[] {
  const findings: LoopFinding[] = [];

  if (steps.length === 0) {
    return [
      {
        key: "empty",
        title: "Empty loop",
        severity: "high",
        detail: "Add steps to describe what the player actually does.",
      },
    ];
  }

  if (steps.length < 3) {
    findings.push({
      key: "unclear-goal",
      title: "Unclear goal",
      severity: "medium",
      detail:
        "Very short loops rarely express a goal. What is the player trying to achieve each cycle?",
    });
  }

  if (!steps.some((s) => s.isReward)) {
    findings.push({
      key: "no-reward",
      title: "No reward",
      severity: "high",
      detail:
        "No step is marked as a reward. Players need a payoff every cycle — mark where the reward lands.",
    });
  }

  if (!steps.some((s) => s.isSpend)) {
    findings.push({
      key: "no-spending",
      title: "No spending opportunity",
      severity: "high",
      detail:
        "Nothing removes currency or resources. Without spending, rewards pile up and lose meaning.",
    });
  }

  const waitSteps = steps.filter((s) => s.isWait);
  if (waitSteps.length >= 2 || (steps.length > 0 && waitSteps.length / steps.length > 0.34)) {
    findings.push({
      key: "excessive-waiting",
      title: "Excessive waiting",
      severity: "medium",
      detail:
        "A large share of the loop is waiting. Waiting can pace a game, but too much pushes players away (or toward paid skips).",
    });
  }

  const kinds = steps.map((s) => s.kind);
  const distinctActionKinds = new Set(
    kinds.filter((k) => k !== "wait" && k !== "receive_reward" && k !== "spend_reward"),
  );
  if (steps.length >= 4 && distinctActionKinds.size <= 1) {
    findings.push({
      key: "repetitive-actions",
      title: "Repetitive actions",
      severity: "medium",
      detail:
        "The loop repeats one kind of action. Variety per cycle keeps sessions from feeling like a chore.",
    });
  }

  // Excessive grind: many action steps between reward steps.
  const rewardIdx = steps.findIndex((s) => s.isReward);
  if (rewardIdx > 5) {
    findings.push({
      key: "excessive-grind",
      title: "Excessive grind before reward",
      severity: "medium",
      detail:
        "Many steps pass before the first reward. Consider smaller rewards along the way.",
    });
  }

  if (!steps.some((s) => s.isSocial)) {
    findings.push({
      key: "no-multiplayer-value",
      title: "No multiplayer value",
      severity: "low",
      detail:
        "No social moment in the loop. Fine for solo games — otherwise, a shared moment strengthens retention.",
    });
  }

  if (!steps.some((s) => s.isRetentionHook)) {
    findings.push({
      key: "no-long-term-purpose",
      title: "No long-term purpose",
      severity: "medium",
      detail:
        "Nothing in the loop feeds a long-term goal. Mark the step that builds toward something lasting.",
    });
  }

  const hasChoice = distinctActionKinds.size >= 3;
  if (!hasChoice && steps.length >= 5) {
    findings.push({
      key: "weak-player-choice",
      title: "Weak player choice",
      severity: "low",
      detail:
        "The cycle looks fixed. Where can players choose between meaningful options?",
    });
  }

  if (!steps.some((s) => s.isFailureState) && steps.length >= 5) {
    findings.push({
      key: "no-failure-state",
      title: "No failure state",
      severity: "low",
      detail:
        "No step can fail. Gentle games can skip failure, but stakes usually make rewards feel earned.",
    });
  }

  return findings;
}

export function analyzeLoop(loop: GameplayLoop): LoopFinding[] {
  return analyzeLoopSteps(loop.steps);
}

/** Health summary used for badges: high findings weigh most. */
export function loopHealth(findings: LoopFinding[]): "good" | "warn" | "critical" {
  if (findings.some((f) => f.severity === "high")) return "critical";
  if (findings.filter((f) => f.severity === "medium").length >= 2) return "warn";
  return "good";
}
