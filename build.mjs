// Build script (run via `npm run build`). Uses esbuild's JS API so the CJS
// footer — which contains `;` — needs no cross-platform shell quoting.
import { build } from "esbuild";

const common = { bundle: true, logLevel: "info" };

await Promise.all([
  // ESM — for bundlers / modern Node ("import" condition).
  build({
    ...common,
    entryPoints: ["src/index.js"],
    format: "esm",
    outfile: "dist/idle-until.mjs"
  }),

  // CJS — for `require()` ("require" condition). The footer makes
  // `module.exports` the function itself (callable), with `.default` aliased
  // back to it for interop.
  build({
    ...common,
    entryPoints: ["src/index.js"],
    format: "cjs",
    outfile: "dist/idle-until.cjs",
    footer: {
      js: "module.exports=module.exports.default;module.exports.default=module.exports;"
    }
  }),

  // IIFE (minified) — for <script> tag / CDN usage; sets window.idleUntil.
  build({
    ...common,
    entryPoints: ["src/browser.js"],
    format: "iife",
    minify: true,
    outfile: "dist/idle-until.min.js"
  })
]);
