// Run when the tab becomes visible.
export function visible(_value, { run, addCleanup }) {
  const handler = () => {
    if (document.visibilityState === "visible") run();
  };
  document.addEventListener("visibilitychange", handler);
  addCleanup(() => document.removeEventListener("visibilitychange", handler));
}
