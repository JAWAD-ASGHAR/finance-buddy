"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** True on the client after hydration — false during SSR. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
