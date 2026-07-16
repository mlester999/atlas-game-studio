import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "soltower/**",
    "atlas-game-center/**",
    "agent-sprite-forge/**",
    "ai-automation-portfolio/**",
    "dolly-s-legacy-launch/**",
    "home-veal-guide/**",
    "mythimon/**",
    "mythimon-game/**",
    "pokegame-assets/**",
    "pokemon-iso-game/**",
    "pokentara/**",
    "pos-project/**",
    "reel-script-admin/**",
    "reel-script-main/**",
    "sailana/**",
    "starville/**",
    "starville-command-center/**",
  ]),
]);

export default eslintConfig;
