import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { useGamesStore, selectAllGames, selectGameBySlug } from "./gamesStore";
import { __resetDbForTests } from "@/lib/storage/db";
import { buildDraftProject, emptyWizardState, newId, uniqueSlug } from "@/lib/draftFactory";
import { seedGames, starville } from "@/data/seeds";
import type { Experiment, GameProject } from "@/lib/types";

function draft(name: string): GameProject {
  return buildDraftProject({ ...emptyWizardState(), name }, []);
}

function experimentFrom(base: GameProject): Experiment {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: `${base.name} experiment`,
    baseGameSlug: base.slug,
    createdAt: now,
    updatedAt: now,
    notes: "",
    snapshot: structuredClone(base),
    simulatorInputs: null,
    promotedToDraft: false,
  };
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  __resetDbForTests();
  useGamesStore.setState({
    hydrated: false,
    drafts: [],
    experiments: [],
    testOverrides: {},
    decisionOverrides: {},
  });
});

describe("multi-game store", () => {
  it("lists the five seeds plus drafts, seeds first", async () => {
    const d = draft("Sixth Game");
    await useGamesStore.getState().addDraft(d);
    const games = selectAllGames(useGamesStore.getState());
    expect(games).toHaveLength(6);
    expect(games.slice(0, 5).map((g) => g.slug)).toEqual(seedGames.map((g) => g.slug));
    expect(games[5].slug).toBe(d.slug);
  });

  it("creates, edits, and deletes a draft", async () => {
    const d = draft("Editable Game");
    const store = useGamesStore.getState();
    await store.addDraft(d);
    await store.updateDraft({ ...d, tagline: "Now with a better tagline" });
    expect(
      useGamesStore.getState().drafts.find((x) => x.id === d.id)?.tagline,
    ).toBe("Now with a better tagline");
    await store.removeDraft(d.id);
    expect(useGamesStore.getState().drafts).toHaveLength(0);
  });

  it("duplicates a game as an independent draft", async () => {
    const original = draft("Original");
    const copy: GameProject = {
      ...structuredClone(original),
      id: newId(),
      slug: uniqueSlug(original.slug, [original.slug]),
      name: `${original.name} (copy)`,
    };
    const store = useGamesStore.getState();
    await store.addDraft(original);
    await store.addDraft(copy);
    await store.updateDraft({ ...copy, tagline: "changed copy" });
    const state = useGamesStore.getState();
    expect(state.drafts.find((d) => d.id === original.id)?.tagline).not.toBe(
      "changed copy",
    );
    expect(copy.slug).not.toBe(original.slug);
  });

  it("looks up games by slug, drafts included", async () => {
    const d = draft("Findable");
    await useGamesStore.getState().addDraft(d);
    const state = useGamesStore.getState();
    expect(selectGameBySlug(state, "starville")?.name).toBe("Starville");
    expect(selectGameBySlug(state, d.slug)?.name).toBe("Findable");
    expect(selectGameBySlug(state, "no-such-game")).toBeUndefined();
  });

  it("keeps experiments isolated: editing a snapshot never touches the seed", async () => {
    const exp = experimentFrom(starville);
    const store = useGamesStore.getState();
    await store.addExperiment(exp);

    const mutated: Experiment = {
      ...exp,
      snapshot: {
        ...exp.snapshot,
        currencies: [],
        economySources: [],
        name: "Starville But Broken",
      },
    };
    await store.updateExperiment(mutated);

    // The verified seed is untouched.
    expect(starville.name).toBe("Starville");
    expect(starville.currencies.length).toBeGreaterThan(0);
    const state = useGamesStore.getState();
    expect(selectGameBySlug(state, "starville")?.currencies.length).toBeGreaterThan(0);
    // The experiment carries the change.
    expect(state.experiments[0].snapshot.name).toBe("Starville But Broken");
  });

  it("applies test overrides per game without mutating the seed object", async () => {
    const store = useGamesStore.getState();
    const tests = starville.tests.map((t) => ({ ...t, state: "passed" as const }));
    await store.setTests("starville", tests);
    const merged = selectGameBySlug(useGamesStore.getState(), "starville");
    expect(merged?.tests.every((t) => t.state === "passed")).toBe(true);
    // Seed itself is untouched.
    expect(starville.tests.some((t) => t.state !== "passed")).toBe(true);
  });

  it("hydrates persisted drafts after a reload", async () => {
    const d = draft("Persistent");
    await useGamesStore.getState().addDraft(d);
    // Simulate a fresh session against the same database.
    useGamesStore.setState({
      hydrated: false,
      drafts: [],
      experiments: [],
      testOverrides: {},
      decisionOverrides: {},
    });
    await useGamesStore.getState().hydrate();
    expect(useGamesStore.getState().drafts.map((x) => x.id)).toEqual([d.id]);
  });
});
