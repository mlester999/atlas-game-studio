import type { GameCategory } from "@/lib/types";

/**
 * The Atlas category encyclopedia. Each entry teaches what a category is,
 * how games in it usually work, and why they commonly fail.
 */
export const categories: GameCategory[] = [
  {
    key: "creature-collector",
    name: "Creature Collector",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players explore a world, discover creatures, catch or recruit them, and slowly assemble a collection and a team they are proud of.",
    commonCoreLoops: [
      "Explore → Encounter → Catch → Train → Evolve → Battle → Unlock new areas",
      "Complete collection pages for milestone rewards",
    ],
    commonProgressionSystems: [
      "Creature levels and evolution stages",
      "Trainer / account level",
      "Region and badge-style unlocks",
      "Collection completion percentage",
    ],
    expectedContentNeeds: [
      "A large creature roster with distinct identities",
      "Multiple regions or habitats",
      "Trainers, quests, and challenge areas",
      "Regular new-creature releases after launch",
    ],
    monetizationOpportunities: [
      "Cosmetics for trainers and creatures",
      "Expansion regions",
      "Convenience (storage, healing shortcuts) — with pay-to-win caution",
    ],
    economyRisks: [
      "Duplicate-creature inflation",
      "Rarity tuned so high that collection feels impossible",
      "Pay-to-win creatures poisoning PvP",
    ],
    retentionStrengths: [
      "Collection instinct is a powerful long-term hook",
      "New creature releases re-activate lapsed players",
      "Team-building depth supports theorycrafting communities",
    ],
    developmentComplexity: "high",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "Creatures without memorable identity",
      "Power creep that invalidates old collections",
      "Grind walls that make catching feel like a chore",
      "PvP imbalance driving away competitive players",
    ],
  },
  {
    key: "monster-battler",
    name: "Monster Battler",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players assemble a team of monsters and focus on tactical battles — type matchups, abilities, and counterplay matter more than collecting everything.",
    commonCoreLoops: [
      "Build team → Battle → Earn rewards → Improve team → Battle harder opponents",
    ],
    commonProgressionSystems: [
      "Monster levels, abilities, and gear",
      "Ranked ladders and seasons",
      "Story or tower-style PvE ladders",
    ],
    expectedContentNeeds: [
      "A balanced ability and type system",
      "Regular balance patches",
      "New monsters or moves each season",
    ],
    monetizationOpportunities: [
      "Cosmetics and battle effects",
      "Season passes tied to ranked play",
    ],
    economyRisks: [
      "Pay-to-win monster acquisition",
      "Reward inflation from ranked payouts",
    ],
    retentionStrengths: [
      "Competitive ladders retain skilled players for years",
      "Metagame shifts keep discussion alive",
    ],
    developmentComplexity: "high",
    multiplayerComplexity: "high",
    commonFailureReasons: [
      "One dominant strategy with no counterplay",
      "Balance patches that repeatedly invalidate player investment",
      "Matchmaking that feeds new players to veterans",
    ],
  },
  {
    key: "tower-defense",
    name: "Tower Defense",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players place towers or units to stop waves of enemies, upgrading between waves and learning enemy patterns.",
    commonCoreLoops: [
      "Place towers → Survive wave → Earn resources → Upgrade → Harder wave",
    ],
    commonProgressionSystems: [
      "Tower unlocks and upgrade tiers",
      "Level or floor completion with star ratings",
      "Meta-progression between runs",
    ],
    expectedContentNeeds: [
      "Many maps or floors with distinct layouts",
      "Enemy variety that forces strategy changes",
      "Boss and challenge modifiers",
    ],
    monetizationOpportunities: [
      "Map packs and challenge modes",
      "Cosmetic tower skins",
    ],
    economyRisks: [
      "Stat inflation making late waves unwinnable without purchases",
      "Idle farming of early floors",
    ],
    retentionStrengths: [
      "Puzzle-like mastery loop",
      "Daily challenges with modifiers are cheap to run",
    ],
    developmentComplexity: "medium",
    multiplayerComplexity: "low",
    commonFailureReasons: [
      "One optimal tower build dominating everything",
      "Repetitive waves with no strategic variety",
      "Difficulty spikes tuned to force purchases",
    ],
  },
  {
    key: "tower-strategy",
    name: "Tower Strategy",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players climb, manage, or conquer a vertical tower structure — clearing floors, unlocking tiers, and making build decisions between milestones.",
    commonCoreLoops: [
      "Enter tower → Clear floor → Earn resources → Upgrade → Face harder floors → Milestone → Prestige when appropriate",
    ],
    commonProgressionSystems: [
      "Floor / tier progression",
      "Unit, hero, and equipment unlocks",
      "Prestige and reset systems",
    ],
    expectedContentNeeds: [
      "Floor variety and boss milestones",
      "Challenge modifiers and endless modes",
      "Seasonal ladders",
    ],
    monetizationOpportunities: [
      "Season passes tied to tower ladders",
      "Cosmetic floors and unit skins",
    ],
    economyRisks: [
      "Endless currency growth from repeatable floors",
      "Prestige abuse loops",
    ],
    retentionStrengths: [
      "Clear visible goal: the next floor",
      "Prestige gives long-term players a reason to replay",
    ],
    developmentComplexity: "medium",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "Exponential scaling that turns into a hard wall",
      "Shallow floor variety",
      "Pay-to-win upgrades deciding ladder position",
    ],
  },
  {
    key: "cozy-farming",
    name: "Cozy Farming",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players tend crops, decorate, cook, craft, and settle into gentle routines. Progress is measured in comfort and completion, not combat.",
    commonCoreLoops: [
      "Plant → Water → Wait → Harvest → Craft/Cook → Sell → Improve farm → Unlock new crops",
    ],
    commonProgressionSystems: [
      "Farming / cooking / crafting skill levels",
      "Farm and home upgrades",
      "Villager friendship levels",
      "Seasonal calendars and festivals",
    ],
    expectedContentNeeds: [
      "Crops per season, recipes, furniture and decoration sets",
      "Villagers with dialogue and friendship arcs",
      "Festivals and seasonal events",
    ],
    monetizationOpportunities: [
      "Cosmetic decoration packs",
      "Expansion areas",
      "Optional convenience with strong pay-to-win caution",
    ],
    economyRisks: [
      "Currency inflation from unlimited crop selling",
      "Excessive waiting timers pushed toward paid skips",
    ],
    retentionStrengths: [
      "Daily routines feel comforting rather than demanding",
      "Decoration and collection goals run for months",
      "Strong social-visit potential",
    ],
    developmentComplexity: "medium",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "Chores outweighing delight",
      "Content exhaustion after the first year of seasons",
      "Weak long-term goals once the farm is optimized",
    ],
  },
  {
    key: "life-simulation",
    name: "Life Simulation",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players live a parallel life — building relationships, customizing homes, and expressing identity inside a gentle simulated world.",
    commonCoreLoops: [
      "Do activities → Earn currency → Customize → Socialize → Unlock new activities",
    ],
    commonProgressionSystems: [
      "Skill levels per activity",
      "Relationship levels",
      "Home and wardrobe expansion",
    ],
    expectedContentNeeds: [
      "Large customization catalogs",
      "Activity variety",
      "Social spaces and events",
    ],
    monetizationOpportunities: [
      "Cosmetics and furniture are natural, fair monetization",
      "Season passes around events",
    ],
    economyRisks: [
      "Catalog price inflation locking out new players",
      "Gacha-style cosmetic gambling pressure",
    ],
    retentionStrengths: [
      "Identity investment — players return to the self they built",
      "Social ties anchor retention",
    ],
    developmentComplexity: "high",
    multiplayerComplexity: "high",
    commonFailureReasons: [
      "Not enough to do after customization novelty fades",
      "Toxic social spaces without moderation",
      "Aggressive monetization souring a cozy audience",
    ],
  },
  {
    key: "social-mmo",
    name: "Social MMO",
    axis: "multiplayer",
    typicalPlayerExperience:
      "Players share a persistent world with many others — chatting, forming parties and friendships, and doing activities together.",
    commonCoreLoops: [
      "Log in → See friends → Do shared activities → Earn → Socialize → Return tomorrow",
    ],
    commonProgressionSystems: [
      "Account level and reputation",
      "Social unlocks (parties, guilds, housing)",
    ],
    expectedContentNeeds: [
      "Shared spaces that stay lively",
      "Cooperative activities",
      "Events that concentrate players in time and place",
    ],
    monetizationOpportunities: [
      "Cosmetics visible to others (highest perceived value)",
      "Housing and expression items",
    ],
    economyRisks: [
      "Trading channels enabling real-money black markets",
      "Bot farming in shared spaces",
    ],
    retentionStrengths: [
      "Friend graphs are the strongest retention force in games",
      "Live events create appointment play",
    ],
    developmentComplexity: "very high",
    multiplayerComplexity: "very high",
    commonFailureReasons: [
      "Empty-world feeling from poor channel design",
      "Moderation gaps making spaces unsafe",
      "Server costs outpacing revenue",
    ],
  },
  {
    key: "sailing-adventure",
    name: "Sailing Adventure",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players captain a ship across open water, discovering islands, managing cargo and crew, and upgrading toward bigger voyages.",
    commonCoreLoops: [
      "Buy cargo → Sail → Explore islands → Sell cargo → Upgrade ship → Unlock routes",
    ],
    commonProgressionSystems: [
      "Ship classes and upgrades",
      "Crew hiring and levels",
      "Route and region unlocks",
      "Reputation with harbors",
    ],
    expectedContentNeeds: [
      "Distinct islands worth discovering",
      "Ocean hazards and weather variety",
      "Fishing, treasure, and side activities during travel",
    ],
    monetizationOpportunities: [
      "Ship cosmetics, sails, figureheads",
      "Expansion seas",
    ],
    economyRisks: [
      "Trade-route exploitation and market manipulation",
      "Bots automating profitable routes",
    ],
    retentionStrengths: [
      "Exploration horizon — there is always another island",
      "Fleet play with friends",
    ],
    developmentComplexity: "high",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "Travel time that feels empty",
      "One dominant route trivializing the trade game",
      "Ocean content too thin for the map size",
    ],
  },
  {
    key: "pirate-trading",
    name: "Pirate Trading",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players buy low and sell high across ports, with piracy, smuggling, or naval conflict adding risk to every voyage.",
    commonCoreLoops: [
      "Buy cargo → Risk the voyage → Sell high → Reinvest → Bigger ship, bigger risks",
    ],
    commonProgressionSystems: [
      "Wealth and fleet growth",
      "Faction reputation",
      "Port unlocks",
    ],
    expectedContentNeeds: [
      "Dynamic market prices per port",
      "Pirate encounters and escort options",
    ],
    monetizationOpportunities: ["Cosmetics", "Expansion regions"],
    economyRisks: [
      "Market manipulation by organized groups",
      "PvP piracy driving away trader players",
    ],
    retentionStrengths: ["Risk-reward tension keeps sessions exciting"],
    developmentComplexity: "high",
    multiplayerComplexity: "high",
    commonFailureReasons: [
      "Unfair PvP piracy without opt-outs or escorts",
      "Static markets that reward one memorized route",
    ],
  },
  {
    key: "exploration-rpg",
    name: "Exploration RPG",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players venture into unknown regions, complete quests, grow characters, and uncover the world's story.",
    commonCoreLoops: [
      "Explore → Quest → Fight/Gather → Level up → Unlock new region",
    ],
    commonProgressionSystems: [
      "Character levels and skill trees",
      "Quest chains and region unlocks",
      "Equipment tiers",
    ],
    expectedContentNeeds: [
      "Handcrafted regions and quests",
      "Story content — expensive to produce, quickly consumed",
    ],
    monetizationOpportunities: ["Expansions", "Cosmetics"],
    economyRisks: ["Gear inflation across expansions"],
    retentionStrengths: ["Story pull and region curiosity"],
    developmentComplexity: "high",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "Content consumed faster than it can be produced",
      "Filler quests that feel like padding",
    ],
  },
  {
    key: "crafting-game",
    name: "Crafting Game",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players gather materials and transform them into useful or beautiful things, mastering recipe trees and production chains.",
    commonCoreLoops: [
      "Gather → Craft → Use or sell → Unlock better recipes → Gather rarer materials",
    ],
    commonProgressionSystems: [
      "Crafting skill levels and recipe unlocks",
      "Tool tiers",
      "Profession specialization",
    ],
    expectedContentNeeds: [
      "Deep recipe trees",
      "Material variety across regions",
    ],
    monetizationOpportunities: ["Cosmetic blueprints", "Storage convenience (caution)"],
    economyRisks: [
      "Crafted-item oversupply crashing player markets",
      "Material bot farming",
    ],
    retentionStrengths: ["Mastery and specialization identity"],
    developmentComplexity: "medium",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "Recipes without meaningful use",
      "Grind-heavy material requirements",
    ],
  },
  {
    key: "survival",
    name: "Survival",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players manage hunger, shelter, and threats while building a foothold in a hostile world.",
    commonCoreLoops: [
      "Gather → Build → Defend → Expand → Face bigger threats",
    ],
    commonProgressionSystems: ["Base tiers", "Tech trees", "Boss gates"],
    expectedContentNeeds: ["Biome variety", "Threat escalation", "Boss content"],
    monetizationOpportunities: ["Cosmetics", "Private servers"],
    economyRisks: ["Raid-loss frustration", "Offline-raid griefing"],
    retentionStrengths: ["Base investment", "Group survival bonds"],
    developmentComplexity: "high",
    multiplayerComplexity: "high",
    commonFailureReasons: [
      "Wipe cycles erasing attachment",
      "Griefing driving away builders",
    ],
  },
  {
    key: "idle-incremental",
    name: "Idle / Incremental",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players set up systems that generate progress over time, checking in to spend, upgrade, and prestige.",
    commonCoreLoops: [
      "Earn passively → Check in → Upgrade → Prestige → Earn faster",
    ],
    commonProgressionSystems: ["Exponential upgrade tiers", "Prestige layers"],
    expectedContentNeeds: ["New mechanics per prestige layer"],
    monetizationOpportunities: ["Time skips (caution)", "Cosmetic themes"],
    economyRisks: [
      "Numbers growing beyond meaning",
      "Paid time-skips collapsing the core loop",
    ],
    retentionStrengths: ["Low-effort daily habit", "Prestige novelty"],
    developmentComplexity: "low",
    multiplayerComplexity: "none",
    commonFailureReasons: [
      "Progression walls tuned for monetization",
      "Nothing new after the third prestige",
    ],
  },
  {
    key: "pve-adventure",
    name: "PvE Adventure",
    axis: "gameplay",
    typicalPlayerExperience:
      "Players fight computer-controlled enemies through dungeons, raids, or missions, alone or cooperatively.",
    commonCoreLoops: ["Prepare → Enter content → Fight → Loot → Improve → Harder content"],
    commonProgressionSystems: ["Gear tiers", "Difficulty ladders"],
    expectedContentNeeds: ["Dungeon and boss variety", "Loot tables worth chasing"],
    monetizationOpportunities: ["Expansions", "Cosmetics"],
    economyRisks: ["Loot inflation", "Run farming"],
    retentionStrengths: ["Loot chase", "Co-op scheduling with friends"],
    developmentComplexity: "high",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "Content drought at endgame",
      "Reward tables that feel unrewarding",
    ],
  },
  {
    key: "pvp-arena",
    name: "PvP Arena",
    axis: "multiplayer",
    typicalPlayerExperience:
      "Players compete directly against each other in matches, climbing ranked ladders.",
    commonCoreLoops: ["Queue → Match → Win/learn → Rank up → Queue again"],
    commonProgressionSystems: ["Ranked tiers and seasons", "Cosmetic mastery tracks"],
    expectedContentNeeds: ["Balance patches", "Seasonal rewards", "Anti-cheat"],
    monetizationOpportunities: ["Cosmetics", "Battle passes"],
    economyRisks: ["Pay-to-win items destroying competitive trust"],
    retentionStrengths: ["Competitive drive", "Seasonal resets"],
    developmentComplexity: "high",
    multiplayerComplexity: "very high",
    commonFailureReasons: [
      "Small matchmaking populations causing long queues and stomps",
      "Cheating without fast enforcement",
    ],
  },
  {
    key: "blockchain-enabled",
    name: "Blockchain-Enabled",
    axis: "platform",
    typicalPlayerExperience:
      "Some game assets or access rights live on a blockchain. Players may hold tokens or assets in their own wallets.",
    commonCoreLoops: [
      "Play normally → Optionally hold/own on-chain assets → Optional marketplace activity",
    ],
    commonProgressionSystems: ["Same as base genre — the chain is infrastructure, not gameplay"],
    expectedContentNeeds: [
      "Everything the base genre needs, plus wallet UX and asset provenance",
    ],
    monetizationOpportunities: [
      "Primary asset sales",
      "Marketplace fees (where legal and safe)",
    ],
    economyRisks: [
      "Token-price dependency infecting gameplay motivation",
      "Speculative players leaving after price declines",
      "Regulatory uncertainty",
    ],
    retentionStrengths: ["Ownership can deepen investment for some players"],
    developmentComplexity: "very high",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "Economy designed for speculation instead of fun",
      "Unlimited token emissions",
      "Security incidents destroying trust",
    ],
  },
  {
    key: "wallet-gated",
    name: "Wallet-Gated",
    axis: "platform",
    typicalPlayerExperience:
      "Players connect a crypto wallet to enter — holding a token or asset acts as the membership key. Authentication is wallet-based, not email/password.",
    commonCoreLoops: ["Connect wallet → Verify holdings → Play normally"],
    commonProgressionSystems: ["Same as base genre"],
    expectedContentNeeds: ["Clear messaging for players without the required holdings"],
    monetizationOpportunities: ["Access token value accrues to holders (indirect)"],
    economyRisks: [
      "Access-token price volatility changes who can afford entry",
      "Gate threshold tuning excludes real fans",
    ],
    retentionStrengths: ["Gated communities can feel exclusive and tight-knit"],
    developmentComplexity: "medium",
    multiplayerComplexity: "low",
    commonFailureReasons: [
      "Gate set before the game is worth gating",
      "Wallet UX friction turning away non-crypto players",
    ],
  },
  {
    key: "off-chain-economy",
    name: "Off-Chain Economy",
    axis: "economy",
    typicalPlayerExperience:
      "All currencies and items live on the game's own servers. The server is the single authority; nothing is withdrawable to a blockchain.",
    commonCoreLoops: ["Earn in game → Spend in game"],
    commonProgressionSystems: ["Standard currency + item progression"],
    expectedContentNeeds: ["Shops, sinks, and content that make earning meaningful"],
    monetizationOpportunities: ["Standard game monetization, unconstrained by chain rules"],
    economyRisks: [
      "Inflation if sources outpace sinks",
      "Duping bugs if server authority is weak",
    ],
    retentionStrengths: [
      "Full control: rewards can be tuned, corrected, and reconciled",
      "No token-price dependency",
    ],
    developmentComplexity: "medium",
    multiplayerComplexity: "low",
    commonFailureReasons: [
      "Weak sinks producing meaningless balances",
      "Client-trusted reward logic exploited by cheaters",
    ],
  },
  {
    key: "hybrid-economy",
    name: "Hybrid Economy",
    axis: "economy",
    typicalPlayerExperience:
      "Everyday play uses safe off-chain currency; a separate, carefully limited layer may involve on-chain assets or capped token events.",
    commonCoreLoops: [
      "Earn off-chain daily → Occasional capped on-chain events or ownership",
    ],
    commonProgressionSystems: ["Off-chain progression with optional on-chain ownership"],
    expectedContentNeeds: [
      "Everything the base genre needs, plus treasury planning and claim architecture",
    ],
    monetizationOpportunities: [
      "Standard monetization plus limited primary sales",
    ],
    economyRisks: [
      "The boundary between layers must be enforced server-side",
      "Treasury exhaustion if token events are uncapped",
      "Legal review required for any real-value flow",
    ],
    retentionStrengths: [
      "Fun-first economy with ownership upside for those who want it",
    ],
    developmentComplexity: "very high",
    multiplayerComplexity: "medium",
    commonFailureReasons: [
      "The on-chain layer leaking into gameplay power (pay-to-win)",
      "Automatic conversion between layers destroying tunability",
      "Launching token features before the game is fun",
    ],
  },
];

export const categoryMap: Record<string, GameCategory> = Object.fromEntries(
  categories.map((c) => [c.key, c]),
);

export function getCategory(key: string): GameCategory | undefined {
  return categoryMap[key];
}
