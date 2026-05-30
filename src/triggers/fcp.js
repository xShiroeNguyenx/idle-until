// Run after First Contentful Paint, with a 3s fallback if the paint entry
// never arrives (or PerformanceObserver isn't supported).
export function fcp(_value, { run, addCleanup }) {
  const fallbackId = setTimeout(run, 3000);
  addCleanup(() => clearTimeout(fallbackId));

  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            run();
            break;
          }
        }
      });
      observer.observe({ type: "paint", buffered: true });
      addCleanup(() => observer.disconnect());
    } catch (_) {}
  }
}
