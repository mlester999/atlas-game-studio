# atlas-game-studio

Monorepo:

| Path | What |
| --- | --- |
| `atlas-game-center/` | **Game Studio Atlas** — Next.js planning studio (**deploy this**) |
| `soltower/` | SolTower game project |

## Deploy Atlas to Vercel

1. Import / open this GitHub repo in Vercel.
2. **Root Directory must be:** `atlas-game-center`  
   (Settings → Build and Deployment → Root Directory)
3. Framework: **Next.js** (auto-detected from that folder)
4. Leave **Output Directory** empty.

If Root Directory is empty / `.`, production will 404 (`NOT_FOUND`) because
there is no `package.json` at the monorepo root.

## Local development

```bash
cd atlas-game-center
npm install
npm run dev   # http://localhost:3400
```
