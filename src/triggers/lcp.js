// Run after Largest Contentful Paint, with a 3s fallback if the
// PerformanceObserver entry never arrives (or isn't supported).
export function lcp(_value, { run, addCleanup }) {
  const fallbackId = setTimeout(run, 3000);
  addCleanup(() => clearTimeout(fallbackId));

  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver(list => {
        if (list.getEntries().length) run();
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
      addCleanup(() => observer.disconnect());
    } catch (_) {}
  }
}
