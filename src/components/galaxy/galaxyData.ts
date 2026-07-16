import type { GameProject } from "@/lib/types";
import { galaxyClusters } from "@/data/seeds";

/** Minimal, serializable data the galaxy scenes need. */
export interface GalaxyGame {
  slug: string;
  name: string;
  world: GameProject["galaxyWorld"];
  stage: string;
  hasBlocker: boolean;
  /** Orbiting system nodes: name + tone for status. */
  nodes: { name: string; tone: "verified" | "good" | "warn" | "critical" | "faint" }[];
}

export interface GalaxyCluster {
  key: string;
  name: string;
  games: GalaxyGame[];
}

function toneFor(g: GameProject, idx: number): GalaxyGame["nodes"][number]["tone"] {
  const s = g.systems[idx];
  if (!s) return "faint";
  if (s.ownerAcceptanceStatus === "owner_tested") return "verified";
  if (s.implementationStatus === "blocked") return "critical";
  if (s.implementationStatus === "locally_complete") return "good";
  if (s.implementationStatus === "in_progress") return "warn";
  return "faint";
}

export function buildGalaxyClusters(games: GameProject[]): GalaxyCluster[] {
  const bySlug = Object.fromEntries(games.map((g) => [g.slug, g]));
  const clusters: GalaxyCluster[] = galaxyClusters.map((c) => ({
    key: c.key,
    name: c.name,
    games: c.gameSlugs
      .map((slug) => bySlug[slug])
      .filter(Boolean)
      .map((g) => toGalaxyGame(g)),
  }));
  // Owner drafts appear in Future Concepts.
  const draftGames = games.filter((g) => g.origin !== "seed");
  const future = clusters.find((c) => c.key === "future-concepts");
  if (future) {
    future.games.push(...draftGames.map((g) => toGalaxyGame(g)));
  }
  return clusters;
}

function toGalaxyGame(g: GameProject): GalaxyGame {
  return {
    slug: g.slug,
    name: g.name,
    world: g.galaxyWorld,
    stage: g.developmentStage.replace(/_/g, " "),
    hasBlocker: g.currentBlocker != null,
    nodes: g.systems.slice(0, 8).map((s, i) => ({ name: s.name, tone: toneFor(g, i) })),
  };
}

export const NODE_TONE_COLOR: Record<GalaxyGame["nodes"][number]["tone"], string> = {
  verified: "#6ecf9b",
  good: "#2d8a66",
  warn: "#e0b85c",
  critical: "#e07a6a",
  faint: "#4a5d55",
};
