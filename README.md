# idle-until

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

- Tiny and dependency-free
- Run tasks based on browser state
- Each task runs only once (auto cleanup)
- No framework required
- Safe fallbacks for older browsers
- **Web Vitals support (LCP)**

---

## Installation

### ES Module

```js
import idleUntil from "./index.js";
```

### Script tag (UMD build)

Use when you don’t want to use a bundler.

`<script src="idle-until.min.js"></script>`

After that, `idleUntil` will be available globally.

---

## Basic Usage

### Run after Largest Contentful Paint (LCP)

```js
idleUntil(() => {
  loadAnalytics();
}).after("lcp");
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

## API

### idleUntil(fn)

Creates a deferred task.

- `fn` must be a function
- Each task executes only once
- Returns a chainable controller

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

Example:

```js
idleUntil(task).after("lcp");
```

---

### on(type, value)

Supported types:

- `interaction` — first user interaction
- `visible` — when tab becomes visible
- `scroll` — scroll percentage (0 → 1)

Example:

```js
idleUntil(task).on("scroll", 0.5);
```

---

## Browser Support

- All modern browsers
- Graceful fallback when `requestIdleCallback` or `PerformanceObserver` is not available

---

## Roadmap

- First Contentful Paint (FCP)
- Interaction to Next Paint (INP)
- Multiple conditions support
- TypeScript definitions

---

## License

MIT
