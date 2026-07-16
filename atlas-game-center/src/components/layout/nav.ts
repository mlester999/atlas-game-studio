export interface NavItem {
  href: string;
  label: string;
  icon: string;
  description: string;
}

export const primaryNav: NavItem[] = [
  { href: "/", label: "Galaxy", icon: "✦", description: "Studio home and game galaxy" },
  { href: "/games", label: "Games", icon: "◈", description: "All game workspaces" },
  { href: "/games/new", label: "Add Game", icon: "＋", description: "Plan a new game" },
  { href: "/tinker", label: "Tinker Lab", icon: "⚗", description: "Safe experiments" },
  { href: "/templates", label: "Templates", icon: "▤", description: "Category template library" },
  { href: "/compare", label: "Compare", icon: "⇄", description: "Compare games side by side" },
  { href: "/studio", label: "Studio", icon: "◐", description: "Studio snapshot" },
  { href: "/learn/play-to-earn", label: "P2E School", icon: "✎", description: "Play-to-Earn education" },
  { href: "/settings", label: "Settings", icon: "⚙", description: "Preferences, export, import" },
];

export interface GameNavItem {
  segment: string;
  label: string;
  group: "design" | "economy" | "production" | "operations";
}

export const gameNav: GameNavItem[] = [
  { segment: "", label: "Overview", group: "design" },
  { segment: "gameplay", label: "Gameplay Loops", group: "design" },
  { segment: "player-journey", label: "How to Play", group: "design" },
  { segment: "progression", label: "Progression Lab", group: "design" },
  { segment: "leveling", label: "Leveling Sim", group: "design" },
  { segment: "world", label: "World & Content", group: "design" },
  { segment: "multiplayer", label: "Multiplayer & Social", group: "design" },
  { segment: "activities", label: "Activities & Retention", group: "design" },
  { segment: "economy", label: "Economy Lab", group: "economy" },
  { segment: "economy/longevity", label: "Longevity Simulator", group: "economy" },
  { segment: "earnings", label: "Player Earnings", group: "economy" },
  { segment: "monetization", label: "Monetization", group: "economy" },
  { segment: "blockchain", label: "Blockchain", group: "economy" },
  { segment: "graphics", label: "Graphics & Assets", group: "production" },
  { segment: "content-longevity", label: "Content Longevity", group: "production" },
  { segment: "live-operations", label: "Live Operations", group: "operations" },
  { segment: "testing", label: "Testing Lab", group: "operations" },
  { segment: "risks", label: "Risks & Gaps", group: "operations" },
  { segment: "roadmap", label: "Roadmap", group: "operations" },
  { segment: "decisions", label: "Decision Journal", group: "operations" },
  { segment: "documentation", label: "Documentation", group: "operations" },
];
