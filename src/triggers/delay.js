// Run after a fixed delay (milliseconds).
export function delay(ms, { run, addCleanup }) {
  const id = setTimeout(run, ms);
  addCleanup(() => clearTimeout(id));
}
