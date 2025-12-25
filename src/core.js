export function createIdleUntil(fn) {
  if (typeof fn !== "function") {
    throw new Error("idleUntil expects a function");
  }

  let state = "idle"; // idle | armed | executed
  const cleanups = [];

  function addCleanup(fn) {
    if (typeof fn === "function") cleanups.push(fn);
  }

  function safeRun() {
    if (state === "executed") return;
    state = "executed";

    // cleanup all listeners/timers
    cleanups.forEach(c => {
      try { c(); } catch (_) {}
    });
    cleanups.length = 0;

    // run task safely
    try {
      fn();
    } catch (err) {
      console.error("[idle-until] task error:", err);
    }
  }

  function arm() {
    if (state === "idle") state = "armed";
  }

  return {
    when(type, options) {
      arm();

      if (type === "idle") {
        const timeout = (options && options.timeout) || 2000;

        let idleId = null;
        let timerId = null;

        if ("requestIdleCallback" in window) {
          idleId = requestIdleCallback(safeRun);
        }

        timerId = setTimeout(safeRun, timeout);

        addCleanup(() => {
          if (idleId && "cancelIdleCallback" in window) {
            cancelIdleCallback(idleId);
          }
          if (timerId) clearTimeout(timerId);
        });
      }

      return this;
    },

    after(type, value) {
      arm();

      // delay
      if (type === "delay") {
        const id = setTimeout(safeRun, value);
        addCleanup(() => clearTimeout(id));
      }

      // LCP
      if (type === "lcp") {
        let ran = false;

        function runOnce() {
          if (ran) return;
          ran = true;
          safeRun();
        }

        const fallbackId = setTimeout(runOnce, 3000);
        addCleanup(() => clearTimeout(fallbackId));

        if ("PerformanceObserver" in window) {
          try {
            const observer = new PerformanceObserver(list => {
              if (list.getEntries().length) runOnce();
            });

            observer.observe({
              type: "largest-contentful-paint",
              buffered: true
            });

            addCleanup(() => observer.disconnect());
          } catch (_) {}
        }
      }

      return this;
    },

    on(type, value) {
      arm();

      if (type === "interaction") {
        const handler = () => safeRun();
        const events = ["click", "keydown", "touchstart"];

        events.forEach(e =>
          window.addEventListener(e, handler, { once: true })
        );

        addCleanup(() =>
          events.forEach(e =>
            window.removeEventListener(e, handler)
          )
        );
      }

      if (type === "visible") {
        const handler = () => {
          if (document.visibilityState === "visible") safeRun();
        };

        document.addEventListener("visibilitychange", handler);
        addCleanup(() =>
          document.removeEventListener("visibilitychange", handler)
        );
      }

      if (type === "scroll") {
        const threshold = typeof value === "number" ? value : 0.5;

        const handler = () => {
          const scrolled =
            (window.scrollY + window.innerHeight) /
            document.documentElement.scrollHeight;

          if (scrolled >= threshold) safeRun();
        };

        window.addEventListener("scroll", handler);
        addCleanup(() =>
          window.removeEventListener("scroll", handler)
        );
      }

      return this;
    }
  };
}
