import { createIdleUntil } from "./core.js";

window.idleUntil = function (fn) {
  return createIdleUntil(fn);
};
