export function observeFCP(run, addCleanup, timeout = 3000) {
  let fired = false;

  function fireOnce() {
    if (fired) return;
    fired = true;
    run();
  }

  // Fallback timeout
  const timeoutId = setTimeout(fireOnce, timeout);
  addCleanup(() => clearTimeout(timeoutId));

  // PerformanceObserver path
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            fireOnce();
            break;
          }
        }
      });

      observer.observe({
        type: "paint",
        buffered: true
      });

      addCleanup(() => observer.disconnect());
    } catch (_) {
      // silent fallback
    }
  }
}
