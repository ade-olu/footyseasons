import { useSyncExternalStore } from "react";

// Same width as the below-tablet mixin
const phoneQuery = window.matchMedia("(max-width: 767.98px)");

function subscribe(onChange: () => void) {
  phoneQuery.addEventListener("change", onChange);
  return () => phoneQuery.removeEventListener("change", onChange);
}

// True below tablet width, for what CSS can't change, such as sort order
export function useIsPhone() {
  return useSyncExternalStore(subscribe, () => phoneQuery.matches);
}
