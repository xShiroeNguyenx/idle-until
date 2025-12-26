import { observeFCP } from "./triggers/fcp.js";

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

		let ran = false;

		function runOnce() {
			if (ran) return;
			ran = true;
			safeRun();
		}

		// ----------------
		// delay
		// ----------------
		if (type === "delay") {
			const id = setTimeout(runOnce, value);
			addCleanup(() => clearTimeout(id));
		}

		// ----------------
		// LCP
		// ----------------
		if (type === "lcp") {
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

		// ----------------
		// FCP (NEW)
		// ----------------
		if (type === "fcp") {
			const fallbackId = setTimeout(runOnce, 3000);
			addCleanup(() => clearTimeout(fallbackId));

			if ("PerformanceObserver" in window) {
			try {
				const observer = new PerformanceObserver(list => {
				for (const entry of list.getEntries()) {
					if (entry.name === "first-contentful-paint") {
					runOnce();
					break;
					}
				}
				});

				observer.observe({
				type: "paint",
				buffered: true
				});

				addCleanup(() => observer.disconnect());
			} catch (_) {}
			}
		}

		// ----------------
		// interaction
		// ----------------
		if (type === "interaction") {
		const events = ["pointerdown", "click", "keydown", "touchstart"];
		let cleaned = false;

		function cleanup() {
			if (cleaned) return;
			cleaned = true;

			events.forEach(event =>
			window.removeEventListener(event, onInteract, listenerOptions)
			);
		}

		function onInteract() {
			runOnce();
			cleanup();
		}

		const listenerOptions = {
			passive: true,
			capture: true
		};

		// attach listeners
		events.forEach(event =>
			window.addEventListener(event, onInteract, listenerOptions)
		);

		// ensure cleanup on cancel / destroy
		addCleanup(cleanup);

		// fallback: guarantee execution
		const fallbackId = setTimeout(() => {
			runOnce();
			cleanup();
		}, 5000);

		addCleanup(() => clearTimeout(fallbackId));
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
