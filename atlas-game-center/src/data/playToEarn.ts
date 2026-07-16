/**
 * Play-to-Earn Education Center content.
 *
 * Teaching material, not promises: nothing here states that any earning
 * model is active, profitable, or guaranteed.
 */

export interface P2EModel {
  key: string;
  name: string;
  summary: string;
  howItWorks: string[];
  riskLevel: "low" | "medium" | "high" | "very high";
  pros: string[];
  cons: string[];
  notes?: string;
}

export const p2eModels: P2EModel[] = [
  {
    key: "play-for-fun",
    name: "Play for Fun with In-Game Rewards",
    summary:
      "Players earn game currency, items, progress, and cosmetics. Nothing leaves the game.",
    howItWorks: [
      "All rewards live inside the game's own economy.",
      "The studio controls issuance and can rebalance safely.",
      "No treasury of real-value tokens is at risk.",
    ],
    riskLevel: "low",
    pros: ["Simple", "Fast to balance", "No legal exposure", "No treasury risk"],
    cons: ["No direct crypto earning identity", "Rewards stay inside the game"],
  },
  {
    key: "play-and-own",
    name: "Play and Own",
    summary:
      "Players may own certain blockchain assets, but earnings are not guaranteed.",
    howItWorks: [
      "Selected assets (cosmetics, badges) can exist as blockchain assets the player holds.",
      "Ownership is the promise — income is not.",
      "Asset value, if any, comes from other players, not the studio.",
    ],
    riskLevel: "medium",
    pros: ["Real ownership story", "No promised income", "Capped studio liability"],
    cons: ["Wallet UX complexity", "Speculation can creep in", "Support burden"],
  },
  {
    key: "limited-events",
    name: "Limited Event Rewards",
    summary:
      "A capped treasury funds specific campaigns or competitions.",
    howItWorks: [
      "The studio allocates a fixed budget per event before it starts.",
      "When the budget is spent, the event reward pool is done.",
      "Eligibility rules and anti-farming checks run before payouts.",
    ],
    riskLevel: "medium",
    pros: ["Capped exposure", "Easier treasury budgeting", "Event excitement", "Easier eligibility review"],
    cons: ["Farming risk", "Legal review needed", "Wallet complexity", "Treasury cost", "Security complexity"],
  },
  {
    key: "creator-rewards",
    name: "Creator Rewards",
    summary:
      "Verified creators receive rewards for measurable contributions.",
    howItWorks: [
      "Creators apply and are verified before anything is paid.",
      "Rewards attach to measurable contributions (content, events, community).",
      "Budgets are fixed per period, not open-ended.",
    ],
    riskLevel: "medium",
    pros: [
      "Rewards meaningful contribution",
      "Encourages content and community",
      "Connects rewards to real value creation",
    ],
    cons: ["Review burden", "Plagiarism", "Intellectual-property issues", "Payment complexity"],
  },
  {
    key: "marketplace",
    name: "Marketplace Earnings",
    summary:
      "Players trade assets with other players when a safe marketplace exists.",
    howItWorks: [
      "Player-to-player trades set prices; the studio takes no position.",
      "The studio may charge a small marketplace fee.",
      "Requires real buyers — listings without demand are a liquidity failure.",
    ],
    riskLevel: "high",
    pros: ["Optional economy", "Player expression", "Possible fee revenue"],
    cons: ["Speculation", "Fraud", "Liquidity risk", "Moderation burden", "Consumer-protection risk"],
  },
  {
    key: "continuous-p2e",
    name: "Continuous Play-to-Earn",
    summary:
      "Players continuously earn external-value tokens through ordinary gameplay.",
    howItWorks: [
      "Every play session emits tokens with outside value.",
      "Emissions must be funded by something forever — usually they are not.",
      "The player base becomes financial: when earning drops, players leave.",
    ],
    riskLevel: "very high",
    pros: ["Strong earning identity", "Constant token incentive"],
    cons: [
      "Very high farming risk",
      "High inflation",
      "Treasury depletion",
      "Player behavior becomes financial",
      "Weak long-term sustainability",
      "Legal complexity",
    ],
    notes: "NOT CURRENTLY RECOMMENDED AS STARVILLE'S DEFAULT MODEL",
  },
];

/** Why continuous Play-to-Earn so often fails. */
export const continuousP2EFailureReasons: string[] = [
  "Unlimited emissions — tokens are created faster than anything removes them",
  "Bots — automated play captures rewards meant for people",
  "Multi-account farming — one person extracts many players' worth of rewards",
  "Speculative player base — many 'players' are only there for the token",
  "Insufficient revenue — no real income funds the rewards being paid out",
  "Treasury depletion — the reward pool drains and cannot refill",
  "Weak gameplay — the game is not fun enough to keep anyone after yields fall",
  "Player exits after token decline — earning drops, players leave, demand falls further",
  "Reward selling pressure — earners sell immediately, pushing the price down",
  "Unequal early-player advantage — late joiners fund early extractors",
  "Expensive security — fraud, sybil, and bot defense cost real money",
  "Legal uncertainty — real-value payouts carry securities and tax questions",
];

/** How external-value rewards should generally be funded. */
export const sustainableFundingSources: string[] = [
  "Limited treasury allocation",
  "Real game revenue",
  "Sponsorship",
  "Tournament budget",
  "Creator budget",
  "Marketplace fees",
  "Seasonal campaign allocation",
];

/** Patterns to avoid — each one is a known collapse mechanism. */
export const modelsToAvoid: { pattern: string; why: string }[] = [
  {
    pattern: "Endless new tokens fund old players",
    why: "This is the defining structure of a collapse: value flows from late joiners to early extractors until joining stops.",
  },
  {
    pattern: "All players expect guaranteed profit",
    why: "A game cannot guarantee profit to its own player base; the money must come from somewhere.",
  },
  {
    pattern: "Rewards depend only on new buyers",
    why: "Growth always slows. A model that only works while growing is already failing.",
  },
  {
    pattern: "DUST converts automatically into a token",
    why: "Automatic conversion turns every gameplay reward into a treasury liability and invites industrial farming.",
  },
  {
    pattern: "Holdings create gameplay power",
    why: "Pay-to-win via token holdings drives away everyone who will not pay, shrinking the game.",
  },
  {
    pattern: "Reward amount is controlled by the browser",
    why: "Anything the client controls will be exploited. Rewards must be server-authoritative.",
  },
  {
    pattern: "Farming has no limits",
    why: "Any reward worth earning is worth botting. Caps, cooldowns, and eligibility checks are mandatory.",
  },
  {
    pattern: "The treasury has no reserve floor",
    why: "Without a minimum reserve and an emergency stop, one bad month can end the whole program.",
  },
];
