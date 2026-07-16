"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ViewingMode } from "@/lib/types";

/**
 * Small preferences persisted in localStorage. Viewing modes change
 * presentation depth only — never underlying data. No secrets stored.
 */

interface UiState {
  viewingMode: ViewingMode;
  publicShareMode: boolean;
  galaxyPreference: "3d" | "2d" | "auto";
  soundEnabled: boolean;
  selectedGameSlug: string | null;
  portfolioFilter: string;
  setViewingMode: (mode: ViewingMode) => void;
  setPublicShareMode: (on: boolean) => void;
  setGalaxyPreference: (pref: "3d" | "2d" | "auto") => void;
  setSoundEnabled: (on: boolean) => void;
  setSelectedGameSlug: (slug: string | null) => void;
  setPortfolioFilter: (filter: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      viewingMode: "simple",
      publicShareMode: false,
      galaxyPreference: "auto",
      soundEnabled: false, // sounds disabled by default (accessibility)
      selectedGameSlug: null,
      portfolioFilter: "all",
      setViewingMode: (viewingMode) => set({ viewingMode }),
      setPublicShareMode: (publicShareMode) => set({ publicShareMode }),
      setGalaxyPreference: (galaxyPreference) => set({ galaxyPreference }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSelectedGameSlug: (selectedGameSlug) => set({ selectedGameSlug }),
      setPortfolioFilter: (portfolioFilter) => set({ portfolioFilter }),
    }),
    { name: "atlas-ui-preferences" },
  ),
);
