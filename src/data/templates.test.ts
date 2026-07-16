import { describe, expect, it } from "vitest";
import { templates } from "./templates";
import { categories, categoryMap } from "./categories";

describe("category template library", () => {
  it("covers the four core game types", () => {
    expect(templates.map((t) => t.key)).toEqual(
      expect.arrayContaining([
        "creature-collector",
        "tower-game",
        "cozy-farming",
        "sailing-trading",
      ]),
    );
  });

  it("every template has a loop, systems, and honest risks", () => {
    for (const t of templates) {
      expect(t.typicalCoreLoop.length).toBeGreaterThanOrEqual(5);
      expect(t.possibleSystems.length).toBeGreaterThan(0);
      expect(t.risks.length).toBeGreaterThan(0);
      expect(t.description).not.toHaveLength(0);
    }
  });

  it("template categories all exist in the category system", () => {
    for (const t of templates) {
      for (const key of t.forCategories) {
        expect(categoryMap[key], `missing category ${key}`).toBeDefined();
      }
    }
  });
});

describe("category system", () => {
  it("documents every category completely", () => {
    expect(categories.length).toBeGreaterThanOrEqual(19);
    for (const c of categories) {
      expect(c.typicalPlayerExperience).not.toHaveLength(0);
      expect(c.commonCoreLoops.length).toBeGreaterThan(0);
      expect(c.economyRisks.length).toBeGreaterThan(0);
      expect(c.commonFailureReasons.length).toBeGreaterThan(0);
    }
  });
});
