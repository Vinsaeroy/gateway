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
    "marketing/**",
    "scripts/**",
    "A-TSUKASA-REWORK-ESM_FIX_ADEXTERNAL+JPM/**",
  ]),
  {
    // Aturan lint disesuaikan untuk codebase gateway WA (banyak bungkus
    // library bertipe longgar spt Baileys). Yang murni gaya & BUKAN bug
    // dimatikan; yang berpotensi menandai isu nyata tetap "warn".
    rules: {
      // Bukan bug — dimatikan (mengurangi noise tanpa risiko):
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "react/no-unescaped-entities": "off",
      // Tetap warn (sinyal berguna, tidak mematahkan build):
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "prefer-const": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
