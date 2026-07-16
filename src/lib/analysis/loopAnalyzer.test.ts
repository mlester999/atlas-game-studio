import { describe, expect, it } from "vitest";
import { analyzeLoopSteps, loopHealth } from "./loopAnalyzer";
import type { LoopStep } from "@/lib/types";

let id = 0;
function step(kind: LoopStep["kind"], flags: Partial<LoopStep> = {}): LoopStep {
  id += 1;
  return { id: `s${id}`, kind, label: kind, ...flags };
}

describe("gameplay loop analyzer", () => {
  it("flags an empty loop", () => {
    const findings = analyzeLoopSteps([]);
    expect(findings.map((f) => f.key)).toContain("empty");
    expect(loopHealth(findings)).toBe("critical");
  });

  it("flags a loop with no reward", () => {
    const findings = analyzeLoopSteps([
      step("explore"),
      step("gather"),
      step("spend_reward", { isSpend: true }),
    ]);
    expect(findings.map((f) => f.key)).toContain("no-reward");
  });

  it("flags a loop with no spending opportunity", () => {
    const findings = analyzeLoopSteps([
      step("explore"),
      step("battle"),
      step("receive_reward", { isReward: true }),
    ]);
    expect(findings.map((f) => f.key)).toContain("no-spending");
  });

  it("flags a repetitive loop", () => {
    const findings = analyzeLoopSteps([
      step("gather"),
      step("gather"),
      step("gather"),
      step("gather"),
    ]);
    expect(findings.map((f) => f.key)).toContain("repetitive-actions");
  });

  it("flags excessive waiting", () => {
    const findings = analyzeLoopSteps([
      step("plant"),
      step("wait", { isWait: true }),
      step("wait", { isWait: true }),
      step("harvest", { isReward: true }),
    ]);
    expect(findings.map((f) => f.key)).toContain("excessive-waiting");
  });

  it("accepts a well-rounded loop", () => {
    const findings = analyzeLoopSteps([
      step("explore"),
      step("battle", { isFailureState: true }),
      step("receive_reward", { isReward: true }),
      step("spend_reward", { isSpend: true }),
      step("socialize", { isSocial: true }),
      step("build", { isRetentionHook: true }),
    ]);
    expect(findings.filter((f) => f.severity === "high")).toHaveLength(0);
    expect(loopHealth(findings)).not.toBe("critical");
  });
});
