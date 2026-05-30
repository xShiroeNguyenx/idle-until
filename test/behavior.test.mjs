// Lightweight behavior harness (no test framework yet — see PLAN.md #11).
// Run: node test/behavior.test.mjs
//
// We can't drive a real browser here, so we stub the browser globals that
// core.js / the trigger modules touch and assert on observable behavior.

let ricCalls = 0;
const idleCb = (cb) => { ricCalls++; return setTimeout(cb, 0); };
const idleCancel = (id) => clearTimeout(id);

function makeWindow() {
  const listeners = {};
  return {
    requestIdleCallback: idleCb,
    cancelIdleCallback: idleCancel,
    addEventListener(type, fn) {
      (listeners[type] || (listeners[type] = [])).push(fn);
    },
    removeEventListener(type, fn) {
      if (listeners[type]) listeners[type] = listeners[type].filter(f => f !== fn);
    },
    __count(type) { return (listeners[type] || []).length; },
    __dispatch(type) { (listeners[type] || []).slice().forEach(fn => fn({ type })); },
    scrollY: 0,
    innerHeight: 800
  };
}

global.window = makeWindow();
global.requestIdleCallback = idleCb;
global.cancelIdleCallback = idleCancel;

const { createIdleUntil } = await import("../src/core.js");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond) {
  console.log((cond ? "  ✓ " : "  ✗ ") + name);
  if (!cond) failures++;
}

// ---------------------------------------------------------------------------
console.log("safe default + .lazy()");

ricCalls = 0;
let ran1 = 0;
createIdleUntil(() => ran1++);
await sleep(20);
check("no trigger -> fn runs once", ran1 === 1);
check("no trigger -> used idle (requestIdleCallback)", ricCalls === 1);

ricCalls = 0;
let ran2 = 0;
createIdleUntil(() => ran2++).after("delay", 50);
await sleep(15);
check("delay -> idle default did NOT schedule", ricCalls === 0);
await sleep(80);
check("delay -> fn runs once via delay", ran2 === 1);

ricCalls = 0;
let ran3 = 0;
createIdleUntil(() => ran3++).after("lcp");
await sleep(20);
check("after('lcp') -> idle default did NOT schedule", ricCalls === 0);

ricCalls = 0;
let ran4 = 0;
createIdleUntil(() => ran4++).lazy();
await sleep(20);
check(".lazy() -> fn runs once via idle", ran4 === 1 && ricCalls === 1);

let ran5 = 0;
createIdleUntil(() => { ran5++; throw new Error("boom"); }).lazy();
await sleep(20);
check("throwing task is caught and runs once", ran5 === 1);

// ---------------------------------------------------------------------------
console.log("cancel()");

let ranC = 0;
const c = createIdleUntil(() => ranC++).after("delay", 50);
c.cancel();
await sleep(80);
check("cancel() prevents fn from running", ranC === 0);

let ranC2 = 0;
const c2 = createIdleUntil(() => ranC2++);
c2.cancel();
await sleep(20);
check("cancel() before tick prevents the idle default", ranC2 === 0);

// advisor #1: attaching a trigger AFTER cancel() must NOT register listeners.
global.window = makeWindow();
let ranC3 = 0;
const c3 = createIdleUntil(() => ranC3++);
c3.cancel();
c3.on("interaction");
const leaked = window.__count("click") + window.__count("pointerdown");
window.__dispatch("click");
await sleep(5);
check("attach after cancel() is a no-op (fn does not run)", ranC3 === 0);
check("attach after cancel() registers no listeners", leaked === 0);

// ---------------------------------------------------------------------------
console.log("interaction (unified)");

global.window = makeWindow();
let ranI = 0;
createIdleUntil(() => ranI++).on("interaction");
window.__dispatch("click");
await sleep(5);
check("on('interaction') fires on click", ranI === 1);
check("on('interaction') cleans up listeners after firing",
  window.__count("click") === 0 && window.__count("pointerdown") === 0);

global.window = makeWindow();
let ranA = 0;
createIdleUntil(() => ranA++).after("interaction");
window.__dispatch("pointerdown"); // unified: now also listens to pointerdown
await sleep(5);
check("after('interaction') fires on pointerdown", ranA === 1);

// ---------------------------------------------------------------------------
console.log("SSR / non-browser");

const savedWindow = global.window;
delete global.window;
let ranSSR = 0;
let threw = false;
try {
  createIdleUntil(() => ranSSR++).after("delay", 10);
} catch (_) {
  threw = true;
}
await sleep(20);
check("SSR: attaching a trigger does not throw", threw === false);
check("SSR: task is a no-op (does not run)", ranSSR === 0);
global.window = savedWindow;

// ---------------------------------------------------------------------------
console.log(failures ? `\nFAILED: ${failures} check(s)` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
