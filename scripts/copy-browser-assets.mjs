import { cpSync, readFileSync, writeFileSync } from "node:fs";

cpSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre-gl-worker.js");

const meshopt = readFileSync("node_modules/three/examples/jsm/libs/meshopt_decoder.module.js", "utf8");
writeFileSync("public/meshopt-decoder.js", meshopt.replace(/^export \{ MeshoptDecoder \};\s*$/m, ""));
