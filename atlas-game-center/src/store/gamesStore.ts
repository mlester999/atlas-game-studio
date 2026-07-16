"use client";

import { create } from "zustand";
import type {
  DecisionRecord,
  Experiment,
  GameProject,
  TestCase,
} from "@/lib/types";
import { seedGames } from "@/data/seeds";
import * as db from "@/lib/storage/db";

/**
 * The games store merges the read-only seeds with owner-created drafts and
 * per-game overrides (tests, decisions) persisted in IndexedDB.
 *
 * Seeds are baselines: editing a seed's tests/decisions stores an override;
 * the seed itself is never mutated. Experiments live entirely apart and
 * never alter verified projects automatically.
 */

interface GamesState {
  hydrated: boolean;
  drafts: GameProject[];
  experiments: Experiment[];
  testOverrides: Record<string, TestCase[]>;
  decisionOverrides: Record<string, DecisionRecord[]>;
  hydrate: () => Promise<void>;
  addDraft: (draft: GameProject) => Promise<void>;
  updateDraft: (draft: GameProject) => Promise<void>;
  removeDraft: (id: string) => Promise<void>;
  addExperiment: (exp: Experiment) => Promise<void>;
  updateExperiment: (exp: Experiment) => Promise<void>;
  removeExperiment: (id: string) => Promise<void>;
  setTests: (slug: string, tests: TestCase[]) => Promise<void>;
  setDecisions: (slug: string, decisions: DecisionRecord[]) => Promise<void>;
}

export const useGamesStore = create<GamesState>()((set, get) => ({
  hydrated: false,
  drafts: [],
  experiments: [],
  testOverrides: {},
  decisionOverrides: {},

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const [drafts, experiments, testOverrides, decisionOverrides] = await Promise.all([
        db.loadDrafts(),
        db.loadExperiments(),
        db.loadAllTestOverrides(),
        db.loadAllDecisionOverrides(),
      ]);
      set({ hydrated: true, drafts, experiments, testOverrides, decisionOverrides });
    } catch {
      // IndexedDB unavailable (private browsing, etc.) — run in-memory.
      set({ hydrated: true });
    }
  },

  addDraft: async (draft) => {
    set((s) => ({ drafts: [...s.drafts, draft] }));
    try {
      await db.saveDraft(draft);
    } catch {
      /* in-memory fallback */
    }
  },

  updateDraft: async (draft) => {
    set((s) => ({ drafts: s.drafts.map((d) => (d.id === draft.id ? draft : d)) }));
    try {
      await db.saveDraft(draft);
    } catch {
      /* in-memory fallback */
    }
  },

  removeDraft: async (id) => {
    set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) }));
    try {
      await db.deleteDraft(id);
    } catch {
      /* in-memory fallback */
    }
  },

  addExperiment: async (exp) => {
    set((s) => ({ experiments: [...s.experiments, exp] }));
    try {
      await db.saveExperiment(exp);
    } catch {
      /* in-memory fallback */
    }
  },

  updateExperiment: async (exp) => {
    set((s) => ({
      experiments: s.experiments.map((e) => (e.id === exp.id ? exp : e)),
    }));
    try {
      await db.saveExperiment(exp);
    } catch {
      /* in-memory fallback */
    }
  },

  removeExperiment: async (id) => {
    set((s) => ({ experiments: s.experiments.filter((e) => e.id !== id) }));
    try {
      await db.deleteExperiment(id);
    } catch {
      /* in-memory fallback */
    }
  },

  setTests: async (slug, tests) => {
    set((s) => ({ testOverrides: { ...s.testOverrides, [slug]: tests } }));
    try {
      await db.saveTestOverrides(slug, tests);
    } catch {
      /* in-memory fallback */
    }
  },

  setDecisions: async (slug, decisions) => {
    set((s) => ({ decisionOverrides: { ...s.decisionOverrides, [slug]: decisions } }));
    try {
      await db.saveDecisionOverrides(slug, decisions);
    } catch {
      /* in-memory fallback */
    }
  },
}));

/* Selectors --------------------------------------------------------------- */

/** All games: seeds plus drafts. Seeds first, in studio order. */
export function selectAllGames(state: Pick<GamesState, "drafts">): GameProject[] {
  return [...seedGames, ...state.drafts];
}

export function selectGameBySlug(
  state: Pick<GamesState, "drafts" | "testOverrides" | "decisionOverrides">,
  slug: string,
): GameProject | undefined {
  const base =
    seedGames.find((g) => g.slug === slug) ?? state.drafts.find((g) => g.slug === slug);
  if (!base) return undefined;
  const tests = state.testOverrides[slug];
  const decisions = state.decisionOverrides[slug];
  if (!tests && !decisions) return base;
  return {
    ...base,
    tests: tests ?? base.tests,
    decisions: decisions ?? base.decisions,
  };
}
