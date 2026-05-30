// Run when the browser is idle, with a guaranteed timeout fallback.
export function idle(options, { run, addCleanup }) {
  const timeout = (options && options.timeout) || 2000;

  let idleId = null;
  if ("requestIdleCallback" in window) {
    idleId = requestIdleCallback(run);
  }

  const timerId = setTimeout(run, timeout);

  addCleanup(() => {
    if (idleId != null && "cancelIdleCallback" in window) {
      cancelIdleCallback(idleId);
    }
    clearTimeout(timerId);
  });
}
