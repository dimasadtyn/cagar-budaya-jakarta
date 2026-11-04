import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules: { "@next/next/no-img-element": "off" } },
  globalIgnores([
    ".next/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/maplibre-gl-worker.js",
    "public/meshopt-decoder.js",
  ]),
]);
