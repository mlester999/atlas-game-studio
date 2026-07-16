# Game Studio Atlas

**Design, Economy, Progression, and Development Command Center**

A premium interactive planning studio for a multi-game portfolio. Atlas is a
website about the games — it never touches the game repositories themselves.
All data lives in the browser (IndexedDB + localStorage). There is no backend,
no accounts, no paid services, and nothing here fetches live cryptocurrency
prices.

## Honesty rules (read first)

Atlas is built around one idea: **the dashboard never lies to you.**

- Unknown information displays `NOT YET DEFINED` or `PLANNING REQUIRED`.
- Planning a feature marks it **PLANNED** — never implemented.
- Local implementation never counts as hosted acceptance.
- Completion percentages are never fabricated.
- Simulations always carry: *estimated planning runway — not a guarantee,
  not a financial forecast.*
- Token claims are disabled across all games until treasury planning,
  anti-farming controls, and legal review exist.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3400
npm run build      # production build
npm test           # vitest suite
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

The dev server uses port **3400** because sibling projects in this folder squat
3000/3001.

## Architecture

```
src/
  lib/types.ts            Central typed data architecture (GameProject, etc.)
  lib/status.ts           Status system (OWNER TESTED … NOT YET DEFINED)
  lib/draftFactory.ts     Wizard state → draft GameProject (all PLANNED)
  lib/sim/economy.ts      Economy Longevity Simulator + stress scenarios
  lib/sim/leveling.ts     Level-curve simulator
  lib/sim/content.ts      Content longevity model (six player archetypes)
  lib/analysis/           Gap Analyzer, loop analyzer, report import
  lib/storage/db.ts       IndexedDB persistence, JSON export/import
  data/seeds/             The five seeded game workspaces
  data/categories.ts      Category encyclopedia (19 categories)
  data/templates.ts       Category template library
  data/playToEarn.ts      Play-to-Earn education content
  store/gamesStore.ts     Seeds + drafts + experiments (Zustand)
  store/uiStore.ts        Preferences (localStorage; no secrets)
  components/             Shell, galaxy (R3F + 2D fallback), charts, labs
  app/                    Next.js routes
```

**Data flow:** seeds are read-only baselines defined in `src/data/seeds/`.
Owner-created content (drafts, experiments, test results, decisions, notes)
lives in IndexedDB and is merged in by `gamesStore`. Editing a seed's tests or
decisions stores an override — the seed object itself is never mutated.

## The five seeded games

| Game | Identity | Seeded with |
| --- | --- | --- |
| Starville | Cozy farming social MMO, off-chain DUST, $STAR-gated | Most complete workspace: currencies, candidates A–D, blocker, co-op activity |
| Pokentara | Pokémon-like Solana creature collector, wallet auth | Known identity only; battle/economy marked PLANNING REQUIRED |
| Mythimon | Pixel creature collector + town rebuilding | Themes and visual direction; economy is CONCEPT ONLY |
| Sailana | Premium 2D isometric tropical sailing adventure (Phaser) | World foundation known; sailing/trading are planning concepts |
| SolTower | 2D tower strategy, Solana-related concept | Almost everything NOT YET DEFINED — by design |

## Adding a game

Use **Add Game** (`/games/new`): a ten-step wizard covering identity, visual
identity, core loop (with the interactive loop builder), progression,
economy, multiplayer, content, technology, rule-based risk warnings, and
workspace creation. Every selection becomes a **PLANNED** item in a new draft
workspace. Drafts appear beside the seeds everywhere (galaxy, portfolio,
compare, studio snapshot).

## Selecting categories and using templates

- `/templates` holds the template library (creature collector, tower game,
  cozy farming, sailing & trading) and the full category encyclopedia.
- In the wizard, picking a matching primary category offers to prefill the
  template's typical core loop.

## Creating gameplay loops

The Gameplay Loop Builder (wizard step 3, Tinker Lab, and each game's
Gameplay workspace) lets you add/reorder/rename steps and mark rewards,
spending, waiting, social moments, failure states, and retention hooks. A
live analyzer flags missing rewards, missing spending, repetitive actions,
excessive waiting, and more.

## Planning progression and leveling

Each game has a Progression Lab and a Leveling Simulator
(`/games/[slug]/progression`, `/games/[slug]/leveling`). The level-curve
editor takes starting XP, growth rate, caps, activity rates, catch-up and
rested bonuses, and daily limits; it outputs milestones, pacing per phase,
grind warnings, and content-exhaustion warnings. Outputs are planning
estimates — they do not promise player behavior.

## Using the economy simulation

`/games/[slug]/economy/longevity` (and the Tinker Lab) run the Economy
Longevity Simulator: player population and archetypes, rewards, sinks,
treasury, content cadence, and manual token-price scenarios in; monthly
creation/destruction, source-to-sink ratio, balance percentiles, bot share,
beginner affordability, and ten separate failure modes out. Twelve stress
scenarios (bot attack, player collapse, sink failure, fee spike, …) show
which system fails first.

## Understanding treasury runway

If a game has a token layer, the simulator tracks the treasury against its
minimum reserve and reports estimated days until the floor is reached, plus a
separate transaction-fee runway. A pure off-chain economy reports no treasury
runway at all. These are assumptions-in, estimates-out — never forecasts.

## Using the Tinker Lab

`/tinker` clones any game into an experiment: add/remove currencies, sources,
and sinks, toggle trading, rebuild the loop, and run per-experiment economy
simulations. Duplicate, reset, compare side by side, export JSON, or promote
an experiment to a draft plan. **Experiments never alter the verified
project automatically.**

## Updating verified status

Statuses encode evidence: `OWNER TESTED`, `LOCALLY COMPLETE`,
`HOSTED PENDING`, `ACCEPTANCE PENDING`, `REPORTED COMPLETE`, `IN PROGRESS`,
`PLANNED`, `DEFERRED`, `DISABLED`, `BLOCKED`, `ADMIN ONLY`, `UNKNOWN`,
`NOT YET DEFINED`. Record outcomes in each game's Testing Lab; the seeds
themselves only change when you edit `src/data/seeds/` deliberately.

## Importing reports

Each game's Documentation workspace can import Markdown reports. Parsing is
deterministic, extracted claims are shown for owner review, and verified data
is never overwritten automatically — source text is preserved as evidence.

## Public and private data

Settings → Public Share Mode hides treasury reserves, security findings,
anti-abuse thresholds, private test notes, legal concerns, internal financial
assumptions, and unpublished decisions across the whole site. Data marked
`publicSafe: false` (including all drafts by default) stays private.

## Backups

Settings → Backup & restore exports one JSON file with drafts, experiments,
test results, decisions, and notes. Import merges it back. Reset deletes all
local data; seeded games are built in and always come back.

## Running tests

```bash
npm test
```

The suite covers: seed accuracy (unknowns stay unknown, token claims stay
disabled, Candidate D stays unpublished, the World Asset blocker stays
visible, SolTower stays unfabricated), the economy simulator (determinism,
stress scenarios, invalid inputs, no-guarantee language), leveling and
content models, the loop and gap analyzers, the draft factory (planning stays
planning), IndexedDB persistence, export/import round-trips, and store
behavior including experiment isolation.

## Building and deploying later

`npm run build` produces a standard Next.js production build. Nothing in
Version 1 requires a server — when the time comes, any static-capable Next.js
host works. Deployment is intentionally out of scope for now, and this
repository holds no secrets to configure.
