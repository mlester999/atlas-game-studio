import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import * as db from "./db";
import { buildDraftProject, emptyWizardState } from "@/lib/draftFactory";
import type { Experiment, GameProject, TestCase } from "@/lib/types";
import { starville } from "@/data/seeds";

function draft(name: string): GameProject {
  return buildDraftProject({ ...emptyWizardState(), name }, []);
}

function experiment(base: GameProject): Experiment {
  const now = new Date().toISOString();
  return {
    id: `exp-${Math.random().toString(36).slice(2)}`,
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
  // Fresh database per test.
  globalThis.indexedDB = new IDBFactory();
  db.__resetDbForTests();
});

describe("IndexedDB persistence", () => {
  it("saves and restores drafts", async () => {
    const d = draft("Persisted Game");
    await db.saveDraft(d);
    const loaded = await db.loadDrafts();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(d);
  });

  it("deletes drafts", async () => {
    const d = draft("Doomed Game");
    await db.saveDraft(d);
    await db.deleteDraft(d.id);
    expect(await db.loadDrafts()).toHaveLength(0);
  });

  it("stores experiments apart from drafts (experiment isolation)", async () => {
    const exp = experiment(starville);
    await db.saveExperiment(exp);
    expect(await db.loadDrafts()).toHaveLength(0);
    const loaded = await db.loadExperiments();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].snapshot.slug).toBe("starville");
  });

  it("saves per-game test overrides without touching other games", async () => {
    const tests: TestCase[] = [
      {
        key: "t1",
        group: "onboarding",
        title: "First five minutes",
        instructions: ["Start the game"],
        expectedResult: ["Tutorial appears"],
        state: "passed",
        notes: "",
        evidence: "",
        testedAt: new Date().toISOString(),
        testedBy: "owner",
      },
    ];
    await db.saveTestOverrides("starville", tests);
    expect(await db.loadTestOverrides("starville")).toEqual(tests);
    expect(await db.loadTestOverrides("pokentara")).toBeUndefined();
  });
});

describe("export and import", () => {
  it("round-trips a full backup", async () => {
    const d = draft("Backup Game");
    const exp = experiment(starville);
    await db.saveDraft(d);
    await db.saveExperiment(exp);
    await db.saveNote("studio", "remember the sinks");

    const backup = await db.buildExport();
    expect(backup.format).toBe("atlas-game-center");
    expect(backup.version).toBe(1);

    // Wipe and re-import.
    globalThis.indexedDB = new IDBFactory();
    db.__resetDbForTests();
    await db.applyImport(db.validateImport(JSON.parse(JSON.stringify(backup))));

    expect(await db.loadDrafts()).toEqual([d]);
    expect(await db.loadExperiments()).toEqual([exp]);
    expect(await db.loadNote("studio")).toBe("remember the sinks");
  });

  it("rejects files that are not Atlas exports", () => {
    expect(() => db.validateImport(null)).toThrow(db.ImportError);
    expect(() => db.validateImport("hello")).toThrow(db.ImportError);
    expect(() => db.validateImport({ format: "something-else" })).toThrow(db.ImportError);
    expect(() => db.validateImport({ format: "atlas-game-center", version: 99 })).toThrow(
      /unsupported export version/,
    );
  });

  it("tolerates missing sections in a valid export", () => {
    const data = db.validateImport({ format: "atlas-game-center", version: 1 });
    expect(data.drafts).toEqual([]);
    expect(data.experiments).toEqual([]);
    expect(data.notes).toEqual({});
  });
});
