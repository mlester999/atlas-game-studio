import { describe, expect, it } from "vitest";
import {
  defaultLevelCurveInputs,
  runLevelCurve,
  LevelingError,
  LEVELING_DISCLAIMER,
} from "./leveling";

describe("level curve simulator", () => {
  it("produces a milestone for every level after 1", () => {
    const inputs = defaultLevelCurveInputs();
    const result = runLevelCurve(inputs);
    expect(result.milestones).toHaveLength(inputs.maxLevel - 1);
    expect(result.milestones[0].level).toBe(2);
    expect(result.milestones.at(-1)!.level).toBe(inputs.maxLevel);
  });

  it("XP requirements grow with the growth rate", () => {
    const result = runLevelCurve(defaultLevelCurveInputs());
    for (let i = 1; i < result.milestones.length; i++) {
      expect(result.milestones[i].xpRequired).toBeGreaterThanOrEqual(
        result.milestones[i - 1].xpRequired,
      );
    }
  });

  it("steep late growth triggers the grind warning", () => {
    const result = runLevelCurve({
      ...defaultLevelCurveInputs(),
      xpGrowthRate: 1.35,
      maxLevel: 60,
    });
    expect(result.grindWarning).toMatch(/Grind warning/);
  });

  it("a curve players finish in days triggers the content-exhaustion warning", () => {
    const result = runLevelCurve({
      ...defaultLevelCurveInputs(),
      maxLevel: 5,
      xpGrowthRate: 1.01,
    });
    expect(result.contentExhaustionWarning).toMatch(/Content-exhaustion warning/);
  });

  it("daily activity limits slow leveling", () => {
    const unlimited = runLevelCurve(defaultLevelCurveInputs());
    const limited = runLevelCurve({ ...defaultLevelCurveInputs(), dailyActivityLimit: 3 });
    expect(limited.estimatedDaysToMax).toBeGreaterThan(unlimited.estimatedDaysToMax);
  });

  it("rejects invalid values", () => {
    const base = defaultLevelCurveInputs();
    expect(() => runLevelCurve({ ...base, startingXpRequirement: 0 })).toThrow(LevelingError);
    expect(() => runLevelCurve({ ...base, xpGrowthRate: 0.5 })).toThrow(LevelingError);
    expect(() => runLevelCurve({ ...base, maxLevel: 1 })).toThrow(LevelingError);
    expect(() => runLevelCurve({ ...base, avgXpPerActivity: Number.NaN })).toThrow(
      LevelingError,
    );
    expect(() => runLevelCurve({ ...base, restedXpBonus: 2 })).toThrow(LevelingError);
  });

  it("always states that estimates are not promises", () => {
    const result = runLevelCurve(defaultLevelCurveInputs());
    expect(result.disclaimer).toBe(LEVELING_DISCLAIMER);
    expect(LEVELING_DISCLAIMER).toMatch(/do not promise/i);
  });
});
