// Compile-only check of the public type surface (run with tsc --noEmit).
import idleUntil from "../index";

// Valid usage — these must all typecheck.
idleUntil(() => {}).when("idle", { timeout: 1000 }).cancel();
idleUntil(() => {}).after("delay", 500);
idleUntil(() => {}).after("lcp").after("fcp");
idleUntil(() => {}).after("interaction");
idleUntil(() => {}).on("scroll", 0.5);
idleUntil(() => {}).on("interaction");
idleUntil(() => {}).on("visible");
idleUntil(() => {}).lazy({ timeout: 3000 });
idleUntil(() => {}); // no trigger -> safe default

// Invalid usage — each must be a type error (tsc fails if any of these compile).
// @ts-expect-error delay requires a number value
idleUntil(() => {}).after("delay");
// @ts-expect-error unknown trigger name
idleUntil(() => {}).on("nope");
// @ts-expect-error fn must be a function
idleUntil(123);
