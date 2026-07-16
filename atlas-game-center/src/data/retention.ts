/** Retention systems encyclopedia: pros, cons, fatigue and abuse risks. */

export interface RetentionSystem {
  key: string;
  name: string;
  pros: string[];
  cons: string[];
  fatigueRisk: string;
  abuseRisk: string;
}

export const retentionSystems: RetentionSystem[] = [
  {
    key: "daily-quests",
    name: "Daily quests",
    pros: ["Reliable daily habit", "Cheap to produce"],
    cons: ["Feels like chores when mandatory"],
    fatigueRisk: "High if rewards make dailies feel required",
    abuseRisk: "Multi-account farming when rewards are transferable",
  },
  {
    key: "weekly-quests",
    name: "Weekly quests",
    pros: ["Flexible for busy players", "Bigger, more interesting goals"],
    cons: ["Weaker daily pull"],
    fatigueRisk: "Low — resets are forgiving",
    abuseRisk: "Low",
  },
  {
    key: "streaks",
    name: "Streaks",
    pros: ["Powerful habit formation"],
    cons: ["Breaking a streak feels punishing and can end play entirely"],
    fatigueRisk: "Very high — manipulative streak pressure drives resentment",
    abuseRisk: "Low",
  },
  {
    key: "activities",
    name: "Repeatable activities",
    pros: ["Session variety", "Natural reward pacing"],
    cons: ["Need enough variety to avoid repetition"],
    fatigueRisk: "Medium",
    abuseRisk: "Bot farming when rewards are worth extracting",
  },
  {
    key: "social-groups",
    name: "Social groups, parties, guilds",
    pros: ["The strongest retention force in games", "Players return for people"],
    cons: ["Requires moderation and management tools"],
    fatigueRisk: "Low",
    abuseRisk: "Harassment without moderation; guild-level collusion",
  },
  {
    key: "collections",
    name: "Collections",
    pros: ["Long-horizon goals", "Completionist satisfaction"],
    cons: ["Impossible-feeling collections backfire"],
    fatigueRisk: "Medium — respect the player's realistic timeline",
    abuseRisk: "Trading exploits around rare pieces",
  },
  {
    key: "achievements",
    name: "Achievements",
    pros: ["Free goals layered over existing content"],
    cons: ["Rarely retain on their own"],
    fatigueRisk: "Low",
    abuseRisk: "Low",
  },
  {
    key: "leaderboards",
    name: "Leaderboards",
    pros: ["Motivates competitive players"],
    cons: ["Demotivates everyone below the top 1%", "Invites botting"],
    fatigueRisk: "Medium",
    abuseRisk: "High — cheating pressure scales with visibility",
  },
  {
    key: "seasons",
    name: "Seasons",
    pros: ["Fresh starts re-activate lapsed players", "Natural catch-up mechanism"],
    cons: ["Content production treadmill"],
    fatigueRisk: "Medium — seasonal FOMO accumulates",
    abuseRisk: "Low",
  },
  {
    key: "events",
    name: "Events",
    pros: ["Appointment play", "Community moments"],
    cons: ["Punishes players who miss them"],
    fatigueRisk: "Medium — artificial scarcity resentment",
    abuseRisk: "Reward-surge farming during events",
  },
  {
    key: "housing",
    name: "Housing",
    pros: ["Deep identity investment", "Natural cosmetic sink"],
    cons: ["Heavy asset production"],
    fatigueRisk: "Low",
    abuseRisk: "Low",
  },
  {
    key: "customization",
    name: "Customization",
    pros: ["Expression is self-renewing motivation"],
    cons: ["Catalog production burden"],
    fatigueRisk: "Low",
    abuseRisk: "Low",
  },
  {
    key: "trading",
    name: "Trading",
    pros: ["Player-driven goals and social glue"],
    cons: ["Fraud, scams, and real-money black markets"],
    fatigueRisk: "Low",
    abuseRisk: "Very high — needs atomic settlement and moderation",
  },
  {
    key: "crafting",
    name: "Crafting",
    pros: ["Mastery identity", "Material sinks"],
    cons: ["Recipe grind can feel like homework"],
    fatigueRisk: "Medium",
    abuseRisk: "Material bot farming",
  },
  {
    key: "progression",
    name: "Progression",
    pros: ["The core forward pull"],
    cons: ["Ends unless designed with long arcs"],
    fatigueRisk: "Grind fatigue when curves steepen",
    abuseRisk: "XP exploit hunting",
  },
  {
    key: "exploration",
    name: "Exploration",
    pros: ["Curiosity is powerful and cheap to trigger"],
    cons: ["Consumed once unless layered with secrets"],
    fatigueRisk: "Low",
    abuseRisk: "Low",
  },
  {
    key: "pvp",
    name: "PvP",
    pros: ["Infinite content from other players"],
    cons: ["Balance and toxicity management forever"],
    fatigueRisk: "Loss-streak burnout",
    abuseRisk: "Cheating, win-trading, smurfing",
  },
  {
    key: "coop",
    name: "Cooperative content",
    pros: ["Friendship + gameplay in one loop", "Cozy-friendly"],
    cons: ["Scheduling friction"],
    fatigueRisk: "Low",
    abuseRisk: "Carry-selling in reward-heavy co-op",
  },
  {
    key: "creator-content",
    name: "Creator content",
    pros: ["Community-made longevity"],
    cons: ["Moderation and IP review burden"],
    fatigueRisk: "Low",
    abuseRisk: "Plagiarism, inappropriate content",
  },
];

export const retentionWarnings: string[] = [
  "Manipulative streak pressure",
  "Excessive fear of missing out",
  "Artificial scarcity",
  "Mandatory daily chores",
  "Pay-to-win retention",
  "Unsustainable reward inflation",
];
