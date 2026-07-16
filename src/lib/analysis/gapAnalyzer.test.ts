import { describe, expect, it } from "vitest";
import { analyzeGaps } from "./gapAnalyzer";
import { starville, soltower } from "@/data/seeds";
import { buildDraftProject, emptyWizardState } from "@/lib/draftFactory";
import type { GameProject } from "@/lib/types";

function blankDraft(): GameProject {
  return buildDraftProject({ ...emptyWizardState(), name: "Gap Test" }, []);
}

describe("gap analyzer", () => {
  it("flags a game with no defined core loop", () => {
    const findings = analyzeGaps(blankDraft());
    expect(findings.map((f) => f.ruleKey)).toContain("undefined-core-loop");
  });

  it("flags multiplayer without moderation", () => {
    const draft = blankDraft();
    draft.multiplayer = { ...draft.multiplayer, mode: "channels" };
    const findings = analyzeGaps(draft);
    expect(findings.map((f) => f.ruleKey)).toContain("multiplayer-without-moderation");
    expect(
      findings.find((f) => f.ruleKey === "multiplayer-without-moderation")!.severity,
    ).toBe("critical");
  });

  it("flags strong sources with no sinks", () => {
    const draft = buildDraftProject(
      { ...emptyWizardState(), name: "Faucet Game", sources: ["Daily reward"] },
      [],
    );
    const findings = analyzeGaps(draft);
    expect(findings.map((f) => f.ruleKey)).toContain("strong-sources-weak-sinks");
  });

  it("blocks active token rewards without a treasury plan", () => {
    const draft = blankDraft();
    draft.earningPaths = [
      {
        key: "test-token",
        name: "Test token path",
        rewardType: "token",
        active: true,
        earningMethod: "test",
        playerRequirements: [],
        limits: [],
        sustainabilityMechanism: "emission-based",
        abuseControls: [],
        treasuryDependency: "high",
        legalReviewRequired: true,
        risks: [],
        status: "planned",
      },
    ];
    const keys = analyzeGaps(draft).map((f) => f.ruleKey);
    expect(keys).toContain("token-rewards-without-treasury");
    expect(keys).toContain("token-payouts-without-legal");
    expect(keys).toContain("continuous-p2e-without-revenue");
    expect(keys).toContain("rewards-without-antibot");
  });

  it("orders findings by severity, worst first", () => {
    const draft = blankDraft();
    draft.multiplayer = { ...draft.multiplayer, mode: "channels" };
    const findings = analyzeGaps(draft);
    const order = ["critical", "blocked", "high", "medium", "low", "info"];
    const ranks = findings.map((f) => order.indexOf(f.severity));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("flags Starville's locally-complete-but-unhosted debt honestly", () => {
    const keys = analyzeGaps(starville).map((f) => f.ruleKey);
    expect(keys).toContain("local-but-unhosted");
  });

  it("does not fire evidence-based rules on SolTower's empty workspace", () => {
    const keys = analyzeGaps(soltower).map((f) => f.ruleKey);
    // SolTower has nothing implemented, so implementation-debt rules stay silent.
    expect(keys).not.toContain("local-but-unhosted");
    expect(keys).not.toContain("token-rewards-without-treasury");
    // Its missing core loop is real and must be flagged.
    expect(keys).toContain("undefined-core-loop");
  });
});
