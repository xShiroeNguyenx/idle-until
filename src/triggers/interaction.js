// Run on the first user interaction. Shared by `after("interaction")` and
// `on("interaction")`; pass `{ fallback: ms }` to also guarantee execution
// after a timeout (used by `after`, not by `on`).
export function interaction(options, { run, addCleanup }) {
  const events = ["pointerdown", "click", "keydown", "touchstart"];
  const listenerOptions = { passive: true, capture: true };

  let cleaned = false;
  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    events.forEach(e => window.removeEventListener(e, onInteract, listenerOptions));
  }

  function onInteract() {
    run();
    cleanup();
  }

  events.forEach(e => window.addEventListener(e, onInteract, listenerOptions));
  addCleanup(cleanup);

  const fallback = options && options.fallback;
  if (fallback) {
    const id = setTimeout(() => {
      run();
      cleanup();
    }, fallback);
    addCleanup(() => clearTimeout(id));
  }
}
