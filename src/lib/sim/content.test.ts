import { describe, expect, it } from "vitest";
import {
  defaultContentInputs,
  runContentLongevity,
  ContentSimError,
  CONTENT_DISCLAIMER,
} from "./content";

describe("content longevity model", () => {
  it("estimates longevity for all six player archetypes", () => {
    const result = runContentLongevity(defaultContentInputs());
    expect(result.archetypes.map((a) => a.archetype)).toEqual([
      "Casual player",
      "Regular player",
      "Hardcore player",
      "Reward maximizer",
      "Collector",
      "Social player",
    ]);
  });

  it("hardcore players exhaust content no later than casual players", () => {
    const result = runContentLongevity({
      ...defaultContentInputs(),
      releaseCadencePerMonth: 0,
    });
    const casual = result.archetypes.find((a) => a.archetype === "Casual player")!;
    const hardcore = result.archetypes.find((a) => a.archetype === "Hardcore player")!;
    expect(hardcore.monthsUntilExhaustion).not.toBeNull();
    expect(casual.monthsUntilExhaustion).not.toBeNull();
    expect(hardcore.monthsUntilExhaustion!).toBeLessThanOrEqual(
      casual.monthsUntilExhaustion!,
    );
  });

  it("a strong release cadence can outpace some players entirely", () => {
    const result = runContentLongevity({
      ...defaultContentInputs(),
      releaseCadencePerMonth: 30,
      avgHoursPerPiece: 2,
    });
    expect(result.archetypes.some((a) => a.monthsUntilExhaustion === null)).toBe(true);
  });

  it("zero cadence is flagged as a bottleneck", () => {
    const result = runContentLongevity({
      ...defaultContentInputs(),
      releaseCadencePerMonth: 0,
    });
    expect(result.bottlenecks.join(" ")).toMatch(/No release cadence/);
  });

  it("replayability extends effective hours", () => {
    const flat = runContentLongevity({
      ...defaultContentInputs(),
      replayabilityFactor: 0,
      multiplayerReplayValue: 0,
      seasonalContent: false,
      liveEvents: false,
    });
    const replayable = runContentLongevity({
      ...defaultContentInputs(),
      replayabilityFactor: 1,
      multiplayerReplayValue: 1,
      seasonalContent: true,
      liveEvents: true,
    });
    expect(replayable.effectiveHours).toBeGreaterThan(flat.effectiveHours);
  });

  it("rejects negative or non-finite inputs", () => {
    expect(() =>
      runContentLongevity({ ...defaultContentInputs(), quests: -1 }),
    ).toThrow(ContentSimError);
    expect(() =>
      runContentLongevity({ ...defaultContentInputs(), avgHoursPerPiece: Number.NaN }),
    ).toThrow(ContentSimError);
  });

  it("never states one guaranteed lifespan", () => {
    const result = runContentLongevity(defaultContentInputs());
    expect(result.disclaimer).toBe(CONTENT_DISCLAIMER);
    expect(CONTENT_DISCLAIMER).toMatch(/never one guaranteed lifespan/);
  });
});
