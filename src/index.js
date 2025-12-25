import { createIdleUntil } from "./core.js";

export default function idleUntil(fn) {
  return createIdleUntil(fn);
}
