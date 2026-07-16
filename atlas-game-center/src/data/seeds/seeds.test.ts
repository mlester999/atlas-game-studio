import { describe, expect, it } from "vitest";
import { seedGames, seedGameMap, galaxyClusters } from "./index";
import { starville } from "./starville";
import { pokentara } from "./pokentara";
import { mythimon } from "./mythimon";
import { sailana } from "./sailana";
import { soltower } from "./soltower";

/**
 * Accuracy tests: the seeds must stay honest.
 * Unknown data remains unknown, planning remains planning, and no seed may
 * quietly fabricate implementation progress.
 */

describe("seed registry", () => {
  it("contains exactly the five known games", () => {
    expect(seedGames.map((g) => g.slug)).toEqual([
      "starville",
      "pokentara",
      "mythimon",
      "sailana",
      "soltower",
    ]);
    expect(Object.keys(seedGameMap)).toHaveLength(5);
  });

  it("places every game in a galaxy cluster", () => {
    const clustered = galaxyClusters.flatMap((c) => c.gameSlugs);
    for (const game of seedGames) {
      expect(clustered).toContain(game.slug);
    }
  });

  it("marks every seed with seed origin", () => {
    for (const game of seedGames) {
      expect(game.origin).toBe("seed");
    }
  });

  it("never fabricates completion percentages anywhere", () => {
    // No seed field carries a percent-complete claim about implementation.
    const json = JSON.stringify(seedGames);
    expect(json).not.toMatch(/\d+% complete/i);
    expect(json).not.toMatch(/percent complete/i);
  });
});

describe("Starville seed", () => {
  it("keeps DUST off-chain, non-withdrawable, and not player-transferable", () => {
    const dust = starville.currencies.find((c) => c.key === "dust");
    expect(dust).toBeDefined();
    expect(dust!.onChain).toBe(false);
    expect(dust!.withdrawable).toBe(false);
    expect(dust!.transferable).toBe(false);
    expect(dust!.convertible).toBe(false);
  });

  it("keeps token claims disabled", () => {
    const tokenPaths = starville.earningPaths.filter((p) => p.rewardType === "token");
    expect(tokenPaths.length).toBeGreaterThan(0);
    for (const path of tokenPaths) {
      expect(path.active).toBe(false);
    }
  });

  it("keeps all four economy candidates unpublished, with D recommended", () => {
    const candidates = starville.economyCandidates;
    expect(candidates.map((c) => c.code).sort()).toEqual(["A", "B", "C", "D"]);
    for (const c of candidates) {
      expect(c.unpublished).toBe(true);
    }
    const ratios = Object.fromEntries(candidates.map((c) => [c.code, c.ratio180dBalanced]));
    expect(ratios).toEqual({ A: 1.433, B: 1.052, C: 1.209, D: 1.094 });
    const recommended = candidates.filter((c) => c.isRecommended);
    expect(recommended).toHaveLength(1);
    expect(recommended[0].code).toBe("D");
  });

  it("keeps the World Asset Version Upload blocker visible", () => {
    expect(starville.currentBlocker).toMatch(/World Asset Version Upload/);
    expect(starville.currentBlocker).toMatch(/503/);
    expect(starville.currentBlocker).toMatch(/ASSET_VERSION_UPLOAD_FAILED/);
  });

  it("tracks Moonpetal Harvest Help as awaiting owner acceptance", () => {
    const moonpetal = starville.systems.find((s) => s.name.includes("Moonpetal"));
    expect(moonpetal).toBeDefined();
    expect(moonpetal!.ownerAcceptanceStatus).not.toBe("owner_tested");
  });

  it("targets approximately 40 players per channel", () => {
    expect(starville.multiplayer.channelCapacity).toBe(40);
  });
});

describe("Pokentara seed — unknowns stay unknown", () => {
  it("does not invent progression or economy details", () => {
    expect(pokentara.progressionSummary).toMatch(/PLANNING REQUIRED/);
    expect(pokentara.economySummary).toMatch(/PLANNING REQUIRED/);
    expect(pokentara.multiplayerSummary).toMatch(/NOT YET DEFINED/);
  });

  it("keeps every system unimplemented (planning statuses only)", () => {
    for (const system of pokentara.systems) {
      expect(["planned", "not_yet_defined", "in_progress", "unknown", "disabled"]).toContain(
        system.implementationStatus,
      );
    }
  });

  it("is wallet-connected by identity", () => {
    const cats = [pokentara.primaryCategory, ...pokentara.secondaryCategories];
    expect(cats).toContain("wallet-gated");
  });
});

describe("Mythimon seed — concept only", () => {
  it("marks the previous economy direction as concept, not implementation", () => {
    expect(mythimon.economySummary).toMatch(/CONCEPT ONLY/);
  });

  it("claims no implemented systems", () => {
    for (const system of mythimon.systems) {
      expect(system.implementationStatus).not.toBe("owner_tested");
      expect(system.implementationStatus).not.toBe("locally_complete");
      expect(system.implementationStatus).not.toBe("reported_complete");
    }
  });
});

describe("Sailana seed — its own identity", () => {
  it("never reuses the Mythimon identity", () => {
    // The reference notes may state the separation explicitly; the identity
    // fields themselves must never borrow from Mythimon.
    const identity = [
      sailana.name,
      sailana.tagline,
      sailana.description,
      sailana.visualCategory,
      sailana.visualIdentity.characterStyle,
      sailana.visualIdentity.environmentStyle,
      ...sailana.systems.map((s) => `${s.name} ${s.simpleExplanation}`),
      ...sailana.coreLoops.map((l) => l.name),
    ]
      .join(" ")
      .toLowerCase();
    expect(identity).not.toContain("mythimon");
    expect(sailana.visualIdentity.pixelArt).toBe(false);
  });

  it("keeps possible gameplay concepts as planning", () => {
    expect(sailana.economySummary).toMatch(/NOT YET DEFINED/);
    for (const loop of sailana.coreLoops) {
      expect(["planned", "not_yet_defined", "in_progress"]).toContain(loop.status);
    }
  });
});

describe("SolTower seed — nothing fabricated", () => {
  it("keeps core design questions open", () => {
    expect(soltower.economySummary).toBe("NOT YET DEFINED");
    expect(soltower.multiplayerSummary).toBe("NOT YET DEFINED");
    expect(soltower.technologySummary).toBe("NOT YET DEFINED");
    expect(soltower.multiplayer.mode).toBe("not_yet_defined");
  });

  it("has no primary core loop defined", () => {
    expect(soltower.coreLoops.filter((l) => l.kind === "primary" && l.steps.length > 0)).toHaveLength(0);
  });

  it("claims no implemented or hosted systems", () => {
    for (const system of soltower.systems) {
      expect(["planned", "not_yet_defined", "disabled", "unknown"]).toContain(
        system.implementationStatus,
      );
      expect(["not_yet_defined", "hosted_pending", "unknown", "disabled"]).toContain(
        system.hostedStatus,
      );
    }
  });

  it("keeps Play-to-Earn disabled until designed", () => {
    for (const path of soltower.earningPaths) {
      expect(path.active).toBe(false);
    }
  });
});
