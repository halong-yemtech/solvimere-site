import { useSyncExternalStore } from "react";
import type { SectionKey } from "./settingsDefaults";

/**
 * Minimal global UI state (which menu/work/tab is open). Same call shape as the
 * Apollo reactive vars it replaces: `v()` reads, `v(next)` writes.
 */
export interface ReactiveVar<T> {
  (next?: T): T;
  subscribe(listener: () => void): () => void;
}

export function makeVar<T>(initial: T): ReactiveVar<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  const v = ((...args: [T?]) => {
    if (args.length > 0 && !Object.is(args[0], value)) {
      value = args[0] as T;
      listeners.forEach((l) => l());
    }
    return value;
  }) as ReactiveVar<T>;

  v.subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return v;
}

export function useReactiveVar<T>(v: ReactiveVar<T>): T {
  return useSyncExternalStore(
    v.subscribe,
    () => v(),
    () => v(),
  );
}

export const currentWorkTab = makeVar<string>("All");
/** Key of the open section; null = the first visible section. */
export const currentMenu = makeVar<SectionKey | null>(null);
export const currentWork = makeVar<number | null>(null);
export const showMenu = makeVar<boolean>(false);
