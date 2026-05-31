# idle-until

[![npm](https://img.shields.io/npm/v/idle-until)](https://www.npmjs.com/package/idle-until)
[![npm downloads](https://img.shields.io/npm/dm/idle-until)](https://www.npmjs.com/package/idle-until)
[![CI](https://github.com/xShiroeNguyenx/idle-until/actions/workflows/ci.yml/badge.svg)](https://github.com/xShiroeNguyenx/idle-until/actions/workflows/ci.yml)
> Run JavaScript only when it won’t hurt performance

`idle-until` is a tiny, dependency-free JavaScript utility that lets you run tasks at the right time instead of immediately — helping improve performance and Core Web Vitals.

---

## Why idle-until?

Running heavy JavaScript too early can hurt:
- INP / TBT
- Page responsiveness
- User experience

`idle-until` helps delay non-critical tasks until:
- the browser is idle
- the user interacts
- the tab becomes visible
- the user scrolls far enough
- **the Largest Contentful Paint (LCP) is finished**

All with a simple, chainable API.

---

## Features

- Tiny and dependency-free (~2KB)
- Run tasks based on browser state
- Each task runs only once (auto cleanup); cancel anytime with `cancel()`
- Ships as **ESM, CommonJS, and a script-tag build** — no framework required
- **TypeScript types included**
- **Safe default** — if you don't pick a trigger, it runs when the browser is idle
- **SSR-safe** — a no-op outside the browser (never throws)
- Safe fallbacks for older browsers
- **Web Vitals aware (LCP / FCP)**

---

## Installation

```bash
npm install idle-until
```

### ESM / bundlers

```js
import idleUntil from "idle-until";
```

### CommonJS

```js
const idleUntil = require("idle-until");
```

### Script tag (CDN)

```html
<script src="https://unpkg.com/idle-until/dist/idle-until.min.js"></script>
```

After that, `idleUntil` is available globally. TypeScript types ship with the package.

---

## Basic Usage

### Not sure which trigger? Just defer it safely

If you've added the library to a live site and don't know which trigger fits a task,
attach none — it runs when the browser is idle. Or say it explicitly with `.lazy()`:

```js
idleUntil(() => loadAnalytics());          // runs when idle (safe default)
idleUntil(() => loadAnalytics()).lazy();   // same thing, explicit
```

Any explicit trigger you add wins over the default, so `idleUntil(task).after("lcp")`
runs after LCP — not at idle.

### Run after Largest Contentful Paint (LCP)

```js
idleUntil(() => {
  loadAnalytics();
}).after("lcp");
```

### Run after First Contentful Paint (FCP)

Use this trigger to run non-critical JavaScript right after the first contentful paint.

```js
idleUntil(() => {
  loadAnalytics();
}).after("fcp");
```

### Run after user interaction

```js
idleUntil(() => {
  loadChatWidget();
}).on("interaction");
```

### Run when browser is idle

```js
idleUntil(() => {
  preloadNextPage();
}).when("idle", { timeout: 2000 });
```

### Run after a delay

```js
idleUntil(() => {
  heavyTask();
}).after("delay", 1000);
```

### Run when tab becomes visible

```js
idleUntil(() => {
  startVideo();
}).on("visible");
```

### Run after scrolling 60% of the page

```js
idleUntil(() => {
  loadComments();
}).on("scroll", 0.6);
```

---

## Which trigger should I use?

Added the library to a live site and not sure where each task goes? Use this map.

| Your task | Use | Why |
|-----------|-----|-----|
| Analytics, tracking, pixels (GA, FB Pixel) | `.lazy()` / nothing / `when("idle")` | Not urgent — run when the browser is free |
| Chat / support widget (Intercom, Crisp, Zendesk) | `on("interaction")` | Users rarely need it instantly — load on first interaction |
| Heavy ads / embeds **below the fold** | `on("scroll")` or `on("visible")` | Only load when they're about to be seen |
| Comments (Disqus), "related posts" | `on("scroll", 0.5)` | Below the fold — load as the user scrolls near |
| Video / carousel that runs when viewed | `on("visible")` | Start when the tab becomes visible again |
| Heavy work that must finish fairly soon | `after("lcp")` | Wait until the main content has painted, then run |
| Very light work you want right after first paint | `after("fcp")` | Rarely needed — can still hurt LCP if the work is heavy |

**Rules of thumb**

- **Not sure? Use `when("idle")`** (or attach no trigger). It's the safe choice for ~80% of non-critical work.
- **Torn between `fcp` and `lcp`? Pick `lcp`** (or idle). FCP fires very early, so running heavy work right after it can still delay LCP.
- Anything **critical to the first view** (cookie consent, above-the-fold content, layout) should **not** be deferred at all.

---

## API

### idleUntil(fn)

Creates a deferred task.

- `fn` must be a function
- Each task executes only once
- Returns a chainable controller
- **If you don't attach a trigger, it runs when the browser is idle** (safe default)

---

### lazy(options)

Run when the browser is idle — a readable alias for `when("idle")`, and the
recommended choice when you're unsure which trigger to pick.

```js
idleUntil(task).lazy();              // run when idle
idleUntil(task).lazy({ timeout: 3000 }); // with a custom idle fallback
```

---

### when(type, options)

Supported types:

- `idle` — run when browser is idle

Example:

```js
idleUntil(task).when("idle", { timeout: 2000 });
```

---

### after(type, value)

Supported types:

- `delay` — run after a delay (milliseconds)
- `lcp` — run after Largest Contentful Paint (Core Web Vital)
- `fcp` — run after First Contentful Paint
- `interaction` — run after the first user interaction (with a 5s fallback)

Example:

```js
idleUntil(task).after("lcp");
```

---

### on(type, value)

Supported types:

- `interaction` — first user interaction (`pointerdown` / `click` / `keydown` / `touchstart`)
- `visible` — when tab becomes visible
- `scroll` — scroll percentage (0 → 1)

Example:

```js
idleUntil(task).on("scroll", 0.5);
```

---

### cancel()

Cancel a pending task: removes all listeners and timers **without** running it.
No-op if the task has already run or was already cancelled.

```js
const task = idleUntil(() => loadWidget()).on("interaction");
// later — e.g. the user navigated away before interacting:
task.cancel();
```

---

## Browser Support

- All modern browsers
- Graceful fallback when `requestIdleCallback` or `PerformanceObserver` is not available

---

## Development

```bash
npm install         # install dev deps
npm run build       # build ESM + CommonJS + IIFE into dist/
npm test            # run the behavior harness
npm run test:types  # typecheck the public type surface
```

CI runs the build, behavior tests, the type check, and a bundle-size guard on every
push and PR (Node 18 & 20).

### Publishing

Publishing to npm is automated by GitHub Actions when you create a GitHub Release,
using **OIDC Trusted Publishing** (no token stored in the repo):

1. One-time: on npmjs.com, configure a **Trusted Publisher** for the package →
   GitHub Actions → this repo, workflow `publish.yml`.
2. Bump `version` in `package.json`, commit, then create a GitHub Release — the
   workflow builds, tests, and publishes via OIDC.

---

## Roadmap

### v0.2.0 ✅ (released 2026-05-30)
- FCP trigger, `after("interaction")`
- Safe default (no trigger → runs when idle) + `.lazy()` preset + trigger cheat sheet
- CI/CD (GitHub Actions: test matrix + automated npm publish)

### v0.3.0 ✅ (released 2026-05-30)
- Trigger refactor (modular triggers, unified `interaction`, passive scroll listener)
- SSR-safe guards + public `cancel()`

### Unreleased
- Dual ESM/CommonJS build + `exports` map + **TypeScript types** (`require()` now works)

### v0.4.0+
- Interaction to Next Paint (INP)
- Combined conditions (AND / OR)
- More triggers (element-in-view, network-idle, media query)
- Full Vitest test suite, `CONTRIBUTING.md` + linter

---

## License

MIT
