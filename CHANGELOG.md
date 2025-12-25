# Changelog

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
