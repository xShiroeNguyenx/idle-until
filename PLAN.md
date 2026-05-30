# idle-until — Development Plan

> Run JavaScript only when it won't hurt performance.

Working roadmap for `idle-until`, grouped by milestone. **v0.2.0 shipped** the new triggers,
the safe-default DX, and CI/CD. The originally-planned trigger refactor + safety hardening
moved to **v0.3.0**, then new features in v0.4.0+.

Priority legend: **P0** = blocks the milestone · **P1** = important · **P2** = nice-to-have.
Status: `TODO` · `WIP` · `DONE`.

## Current state (v0.2.0 released 2026-05-30)

- **Core:** chainable controller with an `idle → armed → executed` state machine, run-once
  guarantee, automatic listener/timer cleanup, and caught errors (`src/core.js`).
- **Triggers:** `when("idle")`, `after("delay" | "lcp" | "fcp" | "interaction")`,
  `on("interaction" | "visible" | "scroll")`, plus a **safe default** (no trigger → idle) and `.lazy()`.
- **Build:** esbuild → minified IIFE (`dist/idle-until.min.js`, gitignored, built in CI); ESM source via `module`.
- **CI/CD:** GitHub Actions test matrix (Node 18/20) + automated npm publish on GitHub Release.

## Milestone v0.2.0 — Released (2026-05-30)

| # | Item | What & where | Status |
|---|------|--------------|--------|
| 1 | FCP + interaction triggers | `after("fcp")` and `after("interaction")` (with 5s fallback). | DONE |
| 2 | Trigger-selection DX | Safe default (`idleUntil(fn)` → idle), `.lazy()` alias, "Which trigger should I use?" cheat sheet. Verified by `test/behavior.test.mjs`. | DONE |
| 3 | CI/CD pipeline | `ci.yml` (push/PR, Node 18+20: `npm ci` → build → test → 4KB size guard) + `publish.yml` (npm publish w/ provenance, gated on Release; needs `NPM_TOKEN`). | DONE |
| 4 | Demos | Reworked `demo/index.html` (Eager-vs-idle metrics) + `demo/script-tag.html` (trigger playground). | DONE |
| 5 | Release hygiene | Bump to `0.2.0`, finalize CHANGELOG, fix `repository.url`, publish via CI. | DONE |

## Milestone v0.3.0 — Refactor, Quality & DX (next)

| # | Item | What & where | Priority | Status |
|---|------|--------------|----------|--------|
| 6 | Modularize triggers | Move each trigger into `src/triggers/*.js` (`idle`, `delay`, `lcp`, `fcp`, `interaction`, `visible`, `scroll`); make `core.js` a thin dispatcher. Wire up / reuse the existing `observeFCP` in `src/triggers/fcp.js` and **remove the dead import** at `core.js:1`. | P0 | TODO |
| 7 | Unify `interaction` logic | Single shared implementation for `after("interaction")` and `on("interaction")`. `after` keeps the 5s fallback; `on` is pure event-driven. | P0 | TODO |
| 8 | Passive scroll listener | Add `{ passive: true }` to the `scroll` listener in `core.js`. | P0 | TODO |
| 9 | SSR / non-browser guard | No-op safely when `window`/`document` are undefined across **all** triggers (the safe default is already guarded). | P1 | TODO |
| 10 | Public `cancel()` | Expose a method that runs cleanups **without** executing `fn`; document it. | P1 | TODO |
| 11 | Full test suite | Grow `test/behavior.test.mjs` into a Vitest + happy-dom suite: every trigger, cleanup on cancel, fallback timeouts, error catching, `PerformanceObserver`/`requestIdleCallback` absent. | P0 | WIP |
| 12 | TypeScript types | Ship `index.d.ts` with a typed chainable API (literal union trigger names + option shapes; include `lazy`). Add JSDoc to source. | P0 | TODO |
| 13 | Packaging fix | Add an `exports` map; build ESM (`.mjs`) + CJS + IIFE + sourcemaps; fix `main`/`module`/`types`. Today `main` points at the IIFE, breaking `require()`. | P0 | TODO |
| 14 | Contributor setup | `CONTRIBUTING.md` + a linter (ESLint or Biome) wired into CI. | P2 | TODO |

## Milestone v0.4.0+ — New Features

| # | Item | What & where | Priority | Status |
|---|------|--------------|----------|--------|
| 15 | INP-aware trigger | `after("inp")` — defer until input responsiveness is safe (Event Timing API). | P1 | TODO |
| 16 | Combined conditions | AND/OR composition — run when *all* / *any* of several conditions are met. Needs API design (chained builder vs array). | P1 | TODO |
| 17 | More triggers | Element-in-view via `IntersectionObserver` (e.g. `on("visible", selector)`), `when("network-idle")`, `on("media", query)`. | P2 | TODO |
| 18 | Global `maxWait` | Optional safety-net timeout that guarantees execution across any trigger. | P2 | TODO |

## Ongoing — Docs & Demo

| # | Item | What & where | Priority | Status |
|---|------|--------------|----------|--------|
| 19 | API reference | Document every trigger, options, fallback behavior, and `cancel()` in the README. Trigger cheat sheet + `.lazy()` done; still need `cancel()` once it exists. | P1 | continuous |
| 20 | Perf benchmark demo | The `demo/index.html` Eager-vs-idle comparison (FCP/LCP/FID/blocking metrics) is done; add a Lighthouse before/after writeup. | P2 | WIP |
| 21 | Keep docs in sync | Update CHANGELOG + README roadmap on every release. | P1 | continuous |

## Known issues (reference)

- Dead import of `observeFCP` (`src/core.js:1`); FCP duplicated inline. (#6)
- `after("interaction")` vs `on("interaction")` diverge (event count + fallback). (#7)
- Non-passive `scroll` listener in `core.js`. (#8)
- `package.json` `main` → IIFE build breaks Node `require()`; no `exports`/`types`. (#13)
- SSR guard is only partial: the safe default is `window`-guarded, but the
  `when`/`after`/`on` trigger bodies still touch `window`/`document` unguarded. (#9)
- No public `cancel()` yet (#10); tests are a starter harness, not a full suite (#11).
- ~~`idleUntil(fn)` with no trigger never runs~~ — **fixed** in 0.2.0 (defaults to idle).
- Demos need `npm run build` first on a fresh clone (`dist/` is gitignored).
