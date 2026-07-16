# atlas-game-studio

Monorepo for **Game Studio Atlas** (Next.js planning studio) plus the
SolTower game project.

| Path | What |
| --- | --- |
| **repo root** (`package.json`, `src/`, …) | **Game Studio Atlas** — deploy this to Vercel |
| `soltower/` | SolTower game project (not deployed with Atlas) |

## Deploy Atlas to Vercel

The Next.js app lives at the **repository root** so Vercel framework detection
works with no Root Directory override.

1. Import this GitHub repo in Vercel (or reconnect if already linked).
2. **Root Directory**: leave empty / `.` (repo root).
3. Framework: **Next.js** (auto-detected).
4. Leave **Output Directory** empty.

If a previous project had Root Directory set to `atlas-game-center`, clear it
in **Settings → Build and Deployment → Root Directory**.

## Local development

```bash
npm install
npm run dev        # http://localhost:3400
npm run build      # production build
npm test           # vitest suite
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

The dev server uses port **3400** because sibling projects may use 3000/3001.

---

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
| Starville | Cozy farming social MMO, off-chain DUST, $STAR-gated | Most complete workspace |
| Pokentara | Pokémon-like Solana creature collector, wallet auth | Known identity only |
| Mythimon | Pixel creature collector + town rebuilding | Themes and visual direction |
| Sailana | Premium 2D isometric tropical sailing adventure | World foundation known |
| SolTower | 2D tower strategy, Solana-related concept | Mostly NOT YET DEFINED |
