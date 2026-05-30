# Changelog

## [0.2.0] - 2026-05-30

### Added
- `after("fcp")` — run after First Contentful Paint.
- `after("interaction")` — run after the first user interaction (with a 5s fallback).
- `.lazy()` — readable preset alias for `when("idle")`.
- "Which trigger should I use?" cheat sheet in the README.
- Behavior test harness in `test/behavior.test.mjs` (run with `npm test`).
- GitHub Actions CI (build + test on Node 18/20, bundle-size guard) and automated
  npm publish on GitHub Release.
- `engines` field requiring Node >= 18.

### Changed
- **Behavior change:** `idleUntil(fn)` with no trigger attached now runs the task
  when the browser is idle (previously it never ran). Attaching any explicit
  trigger (`when` / `after` / `on` / `lazy`) overrides this default. Guarded so it
  is a no-op (does not run, does not throw) outside the browser.

## [0.1.0] - 2025-01-XX

### Added
- Initial release of `idle-until`
- Core API: `idleUntil(fn)`
- Triggers:
  - `when("idle")` with guaranteed timeout fallback
  - `after("delay")`
  - `after("lcp")` (Largest Contentful Paint)
  - `on("interaction")`
  - `on("visible")`
  - `on("scroll")`
- Script-tag (UMD/IIFE) support via `dist/idle-until.min.js`
- ES Module entry for modern bundlers
- Automatic cleanup of listeners and timers
- Safe execution (task runs once, errors are caught)

### Performance
- Non-blocking execution designed to protect Core Web Vitals
- LCP-aware execution using `PerformanceObserver` with fallback

### Docs
- README with usage examples and API documentation
- Demo pages for script-tag usage

### Notes
- This is the first public release.
- API is considered stable for v0.x.
