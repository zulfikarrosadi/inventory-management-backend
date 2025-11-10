import { AsyncLocalStorage } from "node:async_hooks";
import { LogContext } from "./logger";

export const asyncLocalStorage = new AsyncLocalStorage<LogContext>()

export function getContext() {
  return asyncLocalStorage.getStore()
}
