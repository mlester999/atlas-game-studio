import { describe, expect, it } from "vitest";
import {
  buildDraftProject,
  emptyWizardState,
  slugify,
  uniqueSlug,
  wizardWarnings,
  type WizardState,
} from "./draftFactory";

function state(patch: Partial<WizardState> = {}): WizardState {
  return { ...emptyWizardState(), name: "Test Game", ...patch };
}

describe("slug helpers", () => {
  it("slugifies names safely", () => {
    expect(slugify("My Néxt Game!  ")).toBe("my-n-xt-game");
    expect(slugify("---")).toBe("");
  });

  it("avoids collisions with existing slugs", () => {
    expect(uniqueSlug("starville", ["starville"])).toBe("starville-2");
    expect(uniqueSlug("starville", ["starville", "starville-2"])).toBe("starville-3");
    expect(uniqueSlug("", [])).toBe("untitled-game");
  });
});

describe("buildDraftProject — planning stays planning", () => {
  it("marks every wizard selection as planned, never implemented", () => {
    const draft = buildDraftProject(
      state({
        loopSteps: [
          { id: "a", kind: "explore", label: "Explore" },
          { id: "b", kind: "receive_reward", label: "Reward", isReward: true },
        ],
        progressionPicks: ["player_level", "collection"],
        currencies: [{ name: "Sparks", symbol: "SPK", type: "soft", onChain: false }],
        sources: ["Daily quest"],
        sinks: ["Shop"],
        multiplayerMode: "cooperative",
        multiplayerFeatures: ["Chat"],
        contentTypes: [{ contentType: "Quests", initialQuantity: 10 }],
      }),
      [],
    );

    expect(draft.origin).toBe("draft");
    for (const loop of draft.coreLoops) expect(loop.status).toBe("planned");
    for (const p of draft.progressionSystems) expect(p.status).toBe("planned");
    for (const c of draft.currencies) expect(c.sustainabilityStatus).toBe("planned");
    for (const s of draft.economySources) expect(s.status).toBe("planned");
    for (const s of draft.economySinks) expect(s.status).toBe("planned");
    for (const c of draft.contentPlans) expect(c.status).toBe("planned");
    for (const sys of draft.systems) {
      expect(sys.implementationStatus).toBe("planned");
      expect(sys.hostedStatus).toBe("not_yet_defined");
      expect(sys.ownerAcceptanceStatus).toBe("not_yet_defined");
    }
  });

  it("keeps unknown fields visibly unknown", () => {
    const draft = buildDraftProject(state(), []);
    expect(draft.progressionSummary).toBe("NOT YET DEFINED");
    expect(draft.economySummary).toBe("NOT YET DEFINED");
    expect(draft.multiplayerSummary).toBe("NOT YET DEFINED");
    expect(draft.technologySummary).toBe("NOT YET DEFINED");
    expect(draft.treasury.status).toBe("not_yet_defined");
  });

  it("never creates withdrawable or transferable currencies from the wizard", () => {
    const draft = buildDraftProject(
      state({
        currencies: [{ name: "Gold", symbol: "G", type: "token", onChain: true }],
      }),
      [],
    );
    expect(draft.currencies[0].withdrawable).toBe(false);
    expect(draft.currencies[0].transferable).toBe(false);
  });

  it("resolves slug collisions against existing games", () => {
    const draft = buildDraftProject(state({ name: "Starville" }), ["starville"]);
    expect(draft.slug).toBe("starville-2");
  });

  it("keeps drafts out of public share mode by default", () => {
    expect(buildDraftProject(state(), []).publicSafe).toBe(false);
  });
});

describe("wizard warnings", () => {
  it("blocks token reward plans pending treasury and legal review", () => {
    const warnings = wizardWarnings(state({ blockchainStatus: "token_rewards_planned" }));
    const w = warnings.find((x) => x.key === "token-rewards-planning");
    expect(w).toBeDefined();
    expect(w!.severity).toBe("blocked");
  });

  it("warns critically about multiplayer without moderation", () => {
    const warnings = wizardWarnings(
      state({ multiplayerMode: "channels", multiplayerFeatures: ["Chat"] }),
    );
    expect(warnings.map((w) => w.key)).toContain("multiplayer-moderation");
  });

  it("stays quiet about moderation when moderation tools are planned", () => {
    const warnings = wizardWarnings(
      state({
        multiplayerMode: "channels",
        multiplayerFeatures: ["Chat", "Moderation tools (report, block, mute)"],
      }),
    );
    expect(warnings.map((w) => w.key)).not.toContain("multiplayer-moderation");
  });

  it("warns about trading, one-sided economies, and on-chain currencies", () => {
    const keys = wizardWarnings(
      state({
        multiplayerMode: "mixed",
        multiplayerFeatures: ["Item Trading"],
        sources: ["Quest"],
        currencies: [{ name: "Coin", symbol: "C", type: "token", onChain: true }],
      }),
    ).map((w) => w.key);
    expect(keys).toContain("trading-settlement");
    expect(keys).toContain("sources-without-sinks");
    expect(keys).toContain("onchain-currency");
  });

  it("notes a missing core loop", () => {
    expect(wizardWarnings(state()).map((w) => w.key)).toContain("no-core-loop");
  });
});
