import { openDB, type IDBPDatabase } from "idb";
import type {
  AtlasExport,
  DecisionRecord,
  Experiment,
  GameProject,
  TestCase,
} from "@/lib/types";

/**
 * Local persistence: IndexedDB for project data, localStorage for small
 * preferences (handled by the UI store). No secrets are ever stored.
 */

const DB_NAME = "atlas-game-center";
const DB_VERSION = 1;

export const STORES = {
  drafts: "drafts",
  experiments: "experiments",
  testOverrides: "testOverrides",
  decisionOverrides: "decisionOverrides",
  notes: "notes",
  simInputs: "simInputs",
} as const;

type DB = IDBPDatabase<unknown>;

let dbPromise: Promise<DB> | null = null;

export function getDb(): Promise<DB> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.drafts)) {
          db.createObjectStore(STORES.drafts, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.experiments)) {
          db.createObjectStore(STORES.experiments, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.testOverrides)) {
          db.createObjectStore(STORES.testOverrides);
        }
        if (!db.objectStoreNames.contains(STORES.decisionOverrides)) {
          db.createObjectStore(STORES.decisionOverrides);
        }
        if (!db.objectStoreNames.contains(STORES.notes)) {
          db.createObjectStore(STORES.notes);
        }
        if (!db.objectStoreNames.contains(STORES.simInputs)) {
          db.createObjectStore(STORES.simInputs);
        }
      },
    });
  }
  return dbPromise;
}

/** Test hook: reset the cached connection (used with fake-indexeddb). */
export function __resetDbForTests() {
  dbPromise = null;
}

/* Drafts --------------------------------------------------------------- */

export async function loadDrafts(): Promise<GameProject[]> {
  const db = await getDb();
  return (await db.getAll(STORES.drafts)) as GameProject[];
}

export async function saveDraft(draft: GameProject): Promise<void> {
  const db = await getDb();
  await db.put(STORES.drafts, draft);
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORES.drafts, id);
}

/* Experiments ----------------------------------------------------------- */

export async function loadExperiments(): Promise<Experiment[]> {
  const db = await getDb();
  return (await db.getAll(STORES.experiments)) as Experiment[];
}

export async function saveExperiment(exp: Experiment): Promise<void> {
  const db = await getDb();
  await db.put(STORES.experiments, exp);
}

export async function deleteExperiment(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORES.experiments, id);
}

/* Test / decision overrides (per game slug) ------------------------------ */

export async function loadTestOverrides(slug: string): Promise<TestCase[] | undefined> {
  const db = await getDb();
  return (await db.get(STORES.testOverrides, slug)) as TestCase[] | undefined;
}

export async function saveTestOverrides(slug: string, tests: TestCase[]): Promise<void> {
  const db = await getDb();
  await db.put(STORES.testOverrides, tests, slug);
}

export async function loadAllTestOverrides(): Promise<Record<string, TestCase[]>> {
  const db = await getDb();
  const keys = (await db.getAllKeys(STORES.testOverrides)) as string[];
  const out: Record<string, TestCase[]> = {};
  for (const key of keys) {
    out[key] = (await db.get(STORES.testOverrides, key)) as TestCase[];
  }
  return out;
}

export async function loadDecisionOverrides(
  slug: string,
): Promise<DecisionRecord[] | undefined> {
  const db = await getDb();
  return (await db.get(STORES.decisionOverrides, slug)) as DecisionRecord[] | undefined;
}

export async function saveDecisionOverrides(
  slug: string,
  decisions: DecisionRecord[],
): Promise<void> {
  const db = await getDb();
  await db.put(STORES.decisionOverrides, decisions, slug);
}

export async function loadAllDecisionOverrides(): Promise<Record<string, DecisionRecord[]>> {
  const db = await getDb();
  const keys = (await db.getAllKeys(STORES.decisionOverrides)) as string[];
  const out: Record<string, DecisionRecord[]> = {};
  for (const key of keys) {
    out[key] = (await db.get(STORES.decisionOverrides, key)) as DecisionRecord[];
  }
  return out;
}

/* Notes ------------------------------------------------------------------ */

export async function loadNote(key: string): Promise<string | undefined> {
  const db = await getDb();
  return (await db.get(STORES.notes, key)) as string | undefined;
}

export async function saveNote(key: string, note: string): Promise<void> {
  const db = await getDb();
  await db.put(STORES.notes, note, key);
}

export async function loadAllNotes(): Promise<Record<string, string>> {
  const db = await getDb();
  const keys = (await db.getAllKeys(STORES.notes)) as string[];
  const out: Record<string, string> = {};
  for (const key of keys) {
    out[key] = (await db.get(STORES.notes, key)) as string;
  }
  return out;
}

/* Simulator inputs -------------------------------------------------------- */

export async function loadSimInputs<T>(key: string): Promise<T | undefined> {
  const db = await getDb();
  return (await db.get(STORES.simInputs, key)) as T | undefined;
}

export async function saveSimInputs<T>(key: string, inputs: T): Promise<void> {
  const db = await getDb();
  await db.put(STORES.simInputs, inputs, key);
}

/* Export / import ---------------------------------------------------------- */

export async function buildExport(): Promise<AtlasExport> {
  return {
    format: "atlas-game-center",
    version: 1,
    exportedAt: new Date().toISOString(),
    drafts: await loadDrafts(),
    experiments: await loadExperiments(),
    testOverrides: await loadAllTestOverrides(),
    decisionOverrides: await loadAllDecisionOverrides(),
    notes: await loadAllNotes(),
  };
}

export class ImportError extends Error {}

export function validateImport(data: unknown): AtlasExport {
  if (typeof data !== "object" || data === null) {
    throw new ImportError("Import failed: not a JSON object");
  }
  const d = data as Partial<AtlasExport>;
  if (d.format !== "atlas-game-center") {
    throw new ImportError("Import failed: not an Atlas export (missing format marker)");
  }
  if (d.version !== 1) {
    throw new ImportError(`Import failed: unsupported export version ${String(d.version)}`);
  }
  return {
    format: "atlas-game-center",
    version: 1,
    exportedAt: typeof d.exportedAt === "string" ? d.exportedAt : new Date(0).toISOString(),
    drafts: Array.isArray(d.drafts) ? d.drafts : [],
    experiments: Array.isArray(d.experiments) ? d.experiments : [],
    testOverrides: d.testOverrides && typeof d.testOverrides === "object" ? d.testOverrides : {},
    decisionOverrides:
      d.decisionOverrides && typeof d.decisionOverrides === "object" ? d.decisionOverrides : {},
    notes: d.notes && typeof d.notes === "object" ? d.notes : {},
  };
}

export async function applyImport(data: AtlasExport): Promise<void> {
  for (const draft of data.drafts) {
    if (draft && typeof draft.id === "string") await saveDraft(draft);
  }
  for (const exp of data.experiments) {
    if (exp && typeof exp.id === "string") await saveExperiment(exp);
  }
  for (const [slug, tests] of Object.entries(data.testOverrides)) {
    if (Array.isArray(tests)) await saveTestOverrides(slug, tests);
  }
  for (const [slug, decisions] of Object.entries(data.decisionOverrides)) {
    if (Array.isArray(decisions)) await saveDecisionOverrides(slug, decisions);
  }
  for (const [key, note] of Object.entries(data.notes)) {
    if (typeof note === "string") await saveNote(key, note);
  }
}
