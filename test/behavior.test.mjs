// Lightweight behavior harness (no test framework yet — see PLAN.md #7).
// Run: node test/behavior.test.mjs
//
// We can't drive a real browser here, so we stub the browser globals that
// core.js touches and assert on observable behavior — crucially, that the
// safe idle-default is cancelled the moment an explicit trigger is attached.

let ricCalls = 0;
const idleCb = (cb) => { ricCalls++; return setTimeout(cb, 0); };
const idleCancel = (id) => clearTimeout(id);

// core.js checks `"requestIdleCallback" in window` then calls the bare global,
// so we expose it on both (mirrors how the browser exposes window globals).
global.window = { requestIdleCallback: idleCb, cancelIdleCallback: idleCancel };
global.requestIdleCallback = idleCb;
global.cancelIdleCallback = idleCancel;

const { createIdleUntil } = await import("../src/core.js");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond) {
  console.log((cond ? "  ✓ " : "  ✗ ") + name);
  if (!cond) failures++;
}

console.log("safe default + .lazy() behavior");

// 1) No trigger attached -> should fall back to running when idle, exactly once.
ricCalls = 0;
let ran1 = 0;
createIdleUntil(() => ran1++);
await sleep(20);
check("no trigger -> fn runs once", ran1 === 1);
check("no trigger -> used idle (requestIdleCallback)", ricCalls === 1);

// 2) Explicit .after("delay") must WIN: idle default must NOT also schedule.
//    If arm()'s clearTimeout (and the state re-check) failed, ricCalls would be 1.
ricCalls = 0;
let ran2 = 0;
createIdleUntil(() => ran2++).after("delay", 50);
await sleep(15);
check("delay -> idle default did NOT schedule", ricCalls === 0);
await sleep(80);
check("delay -> fn runs once via delay", ran2 === 1);
check("delay -> still no idle scheduling", ricCalls === 0);

// 3) Explicit .after("lcp") must also cancel the idle default.
ricCalls = 0;
let ran3 = 0;
createIdleUntil(() => ran3++).after("lcp"); // no PerformanceObserver stub -> 3s fallback path
await sleep(20);
check("after('lcp') -> idle default did NOT schedule", ricCalls === 0);

// 4) .lazy() preset -> runs when idle, once.
ricCalls = 0;
let ran4 = 0;
createIdleUntil(() => ran4++).lazy();
await sleep(20);
check(".lazy() -> fn runs once", ran4 === 1);
check(".lazy() -> used idle", ricCalls === 1);

// 5) Runs exactly once even if a trigger fires repeatedly is already covered by
//    the state machine; here we just confirm a thrown task doesn't crash.
let ran5 = 0;
createIdleUntil(() => { ran5++; throw new Error("boom"); }).lazy();
await sleep(20);
check("throwing task is caught and runs once", ran5 === 1);

console.log(failures ? `\nFAILED: ${failures} check(s)` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
