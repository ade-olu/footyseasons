import { useEffect, type RefObject } from "react";

// While open, a press anywhere outside the element calls onOutside
export function useTapOutside(
  ref: RefObject<Element | null>,
  open: boolean,
  onOutside: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const handle = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onOutside();
    };
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [ref, open, onOutside]);
}
