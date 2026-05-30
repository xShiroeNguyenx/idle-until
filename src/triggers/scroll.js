// Run when the page is scrolled past a threshold (0 → 1, default 0.5).
export function scroll(value, { run, addCleanup }) {
  const threshold = typeof value === "number" ? value : 0.5;

  const handler = () => {
    const scrolled =
      (window.scrollY + window.innerHeight) /
      document.documentElement.scrollHeight;
    if (scrolled >= threshold) run();
  };

  // passive: this listener never calls preventDefault — keeps scrolling smooth.
  window.addEventListener("scroll", handler, { passive: true });
  addCleanup(() => window.removeEventListener("scroll", handler));
}
