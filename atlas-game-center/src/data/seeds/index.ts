import type { GameProject } from "@/lib/types";
import { starville } from "./starville";
import { pokentara } from "./pokentara";
import { mythimon } from "./mythimon";
import { sailana } from "./sailana";
import { soltower } from "./soltower";

/** The five seeded game workspaces. Order matters for the studio snapshot. */
export const seedGames: GameProject[] = [
  starville,
  pokentara,
  mythimon,
  sailana,
  soltower,
];

export const seedGameMap: Record<string, GameProject> = Object.fromEntries(
  seedGames.map((g) => [g.slug, g]),
);

export { starville, pokentara, mythimon, sailana, soltower };

/** Galaxy category clusters shown on the home constellation. */
export const galaxyClusters: {
  key: string;
  name: string;
  gameSlugs: string[];
}[] = [
  { key: "creature-collectors", name: "Creature Collectors", gameSlugs: ["mythimon", "pokentara"] },
  { key: "cozy-worlds", name: "Cozy Worlds", gameSlugs: ["starville"] },
  { key: "ocean-adventures", name: "Ocean Adventures", gameSlugs: ["sailana"] },
  { key: "tower-strategy", name: "Tower and Strategy", gameSlugs: ["soltower"] },
  { key: "future-concepts", name: "Future Concepts", gameSlugs: [] },
];
