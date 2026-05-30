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
- **CI/CD:** GitHub Actions test matrix (Node 18/20) + automated npm publish on GitHub Release
  (migrated to OIDC **Trusted Publishing** — needs the Trusted Publisher configured on npmjs;
  first verified on the next release).

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
| 6 | Modularize triggers | **DONE.** Each trigger lives in `src/triggers/*.js`; `core.js` is a thin dispatcher. Dead `observeFCP` import removed; `fcp.js` repurposed as the real handler. | P0 | DONE |
| 7 | Unify `interaction` logic | **DONE.** One `interaction.js` shared by both; `after` passes `{ fallback: 5000 }`, `on` passes none. (`on` now uses the same 4 events + passive/capture.) | P0 | DONE |
| 8 | Passive scroll listener | **DONE.** `scroll` listener registered with `{ passive: true }`. | P0 | DONE |
| 9 | SSR / non-browser guard | **DONE.** `when`/`after`/`on` no-op (don't run, don't throw) when `window` is undefined. | P1 | DONE |
| 10 | Public `cancel()` | **DONE.** Runs cleanups without executing `fn`; new `cancelled` state; guarded against post-cancel trigger attachment. | P1 | DONE |
| 11 | Full test suite | Harness `test/behavior.test.mjs` now covers safe default, cancel, SSR, unified interaction (16 checks). Still to do: migrate to Vitest + happy-dom and cover visible/scroll + observer-absent paths. | P0 | WIP |
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

- `package.json` `main` → IIFE build breaks Node `require()`; no `exports`/`types`. (#13)
- Tests are a stub harness, not a full framework/coverage suite. (#11)
- Demos need `npm run build` first on a fresh clone (`dist/` is gitignored).
- Resolved in the v0.3.0 refactor: dead `observeFCP` import (#6), `interaction`
  divergence (#7), non-passive scroll (#8), SSR throwing (#9), no `cancel()` (#10).
- Resolved in 0.2.0: `idleUntil(fn)` with no trigger never ran (now defaults to idle).
