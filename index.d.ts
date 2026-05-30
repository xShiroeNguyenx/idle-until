// ESM type declarations (matches the "import" condition).

export interface IdleUntilController {
  /** Run when the browser is idle (`requestIdleCallback`, with a timeout fallback). */
  when(type: "idle", options?: { timeout?: number }): IdleUntilController;

  /** Run after a fixed delay in milliseconds. */
  after(type: "delay", value: number): IdleUntilController;
  /** Run after Largest Contentful Paint / First Contentful Paint (with a 3s fallback). */
  after(type: "lcp" | "fcp"): IdleUntilController;
  /** Run after the first user interaction (with a 5s fallback). */
  after(type: "interaction"): IdleUntilController;

  /** Run on the first user interaction. */
  on(type: "interaction"): IdleUntilController;
  /** Run when the tab becomes visible. */
  on(type: "visible"): IdleUntilController;
  /** Run when the page is scrolled past a threshold (0–1, default 0.5). */
  on(type: "scroll", value?: number): IdleUntilController;

  /** Run when the browser is idle — a readable alias for `when("idle")`. */
  lazy(options?: { timeout?: number }): IdleUntilController;

  /** Cancel a pending task: remove all listeners/timers without running it. */
  cancel(): IdleUntilController;
}

/**
 * Create a deferred task. Attach a trigger to control when `fn` runs; with no
 * trigger it runs when the browser is idle. `fn` runs at most once.
 */
export default function idleUntil(fn: () => void): IdleUntilController;
