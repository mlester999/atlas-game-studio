"use client";

import { createContext, useContext } from "react";
import type { GameProject } from "@/lib/types";

const GameContext = createContext<GameProject | null>(null);

export function GameProvider({
  game,
  children,
}: {
  game: GameProject;
  children: React.ReactNode;
}) {
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGame(): GameProject {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used inside a game workspace");
  return game;
}
