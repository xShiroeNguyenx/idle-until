import { idle } from "./triggers/idle.js";
import { delay } from "./triggers/delay.js";
import { lcp } from "./triggers/lcp.js";
import { fcp } from "./triggers/fcp.js";
import { interaction } from "./triggers/interaction.js";
import { visible } from "./triggers/visible.js";
import { scroll } from "./triggers/scroll.js";

function hasDOM() {
  return typeof window !== "undefined";
}

export function createIdleUntil(fn) {
  if (typeof fn !== "function") {
    throw new Error("idleUntil expects a function");
  }

  let state = "idle"; // idle | armed | executed | cancelled
  const cleanups = [];
  let autoTimer = null;

  function addCleanup(c) {
    if (typeof c === "function") cleanups.push(c);
  }

  function runCleanups() {
    cleanups.forEach(c => {
      try { c(); } catch (_) {}
    });
    cleanups.length = 0;
  }

  function safeRun() {
    if (state === "executed" || state === "cancelled") return;
    state = "executed";
    runCleanups();
    try {
      fn();
    } catch (err) {
      console.error("[idle-until] task error:", err);
    }
  }

  function arm() {
    if (state === "idle") {
      state = "armed";
      if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
      }
    }
  }

  // True once the task has run or been cancelled — no further triggers should
  // attach (doing so would register listeners that never get cleaned up).
  function settled() {
    return state === "executed" || state === "cancelled";
  }

  const ctx = { run: safeRun, addCleanup };

  const controller = {
    when(type, options) {
      if (settled()) return this;
      if (!hasDOM()) { arm(); return this; }
      arm();

      if (type === "idle") idle(options, ctx);

      return this;
    },

    after(type, value) {
      if (settled()) return this;
      if (!hasDOM()) { arm(); return this; }
      arm();

      if (type === "delay") delay(value, ctx);
      else if (type === "lcp") lcp(value, ctx);
      else if (type === "fcp") fcp(value, ctx);
      else if (type === "interaction") interaction({ fallback: 5000 }, ctx);

      return this;
    },

    on(type, value) {
      if (settled()) return this;
      if (!hasDOM()) { arm(); return this; }
      arm();

      if (type === "interaction") interaction({}, ctx);
      else if (type === "visible") visible(value, ctx);
      else if (type === "scroll") scroll(value, ctx);

      return this;
    },

    // Preset: run when the browser is idle — the safe default for most
    // non-critical work. Use this when you're unsure which trigger to pick.
    lazy(options) {
      return this.when("idle", options);
    },

    // Cancel a pending task: remove all listeners/timers WITHOUT running fn.
    // No-op if the task has already run or was already cancelled.
    cancel() {
      if (settled()) return this;
      state = "cancelled";
      if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
      }
      runCleanups();
      return this;
    }
  };

  // Safe default: if no trigger is attached during the current tick, fall back
  // to running when the browser is idle. arm() cancels this as soon as an
  // explicit trigger (when/after/on/lazy) is attached, so an explicit choice
  // like .after("lcp") always wins.
  if (hasDOM()) {
    autoTimer = setTimeout(() => {
      autoTimer = null;
      if (state === "idle") controller.when("idle");
    }, 0);
  }

  return controller;
}
