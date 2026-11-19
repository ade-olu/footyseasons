import { useEffect } from "react";

// Below laptop width, where the sidebar is a drawer
const drawerQuery = window.matchMedia("(max-width: 1023.98px)");

// How far and how straight a swipe must go
const MIN_DISTANCE = 64;
const MAX_SLOPE = 0.5;

// True if the touch began in something that scrolls sideways (a carousel or table)
function startsInScroller(target: EventTarget | null) {
  for (
    let element = target instanceof Element ? target : null;
    element && element !== document.body;
    element = element.parentElement
  ) {
    const { overflowX } = getComputedStyle(element);
    if (
      (overflowX === "auto" || overflowX === "scroll") &&
      element.scrollWidth > element.clientWidth
    ) {
      return true;
    }
  }
  return false;
}

// True if the touch began in something that uses sideways drags (a chart)
function startsInDragArea(target: EventTarget | null) {
  return (
    target instanceof Element && !!target.closest("[data-no-drawer-swipe]")
  );
}

// Opens the drawer on a swipe to the right and closes it on a swipe to the left
export function useDrawerSwipe(
  isOpen: boolean,
  onOpen: () => void,
  onClose: () => void,
) {
  useEffect(() => {
    let start: { x: number; y: number } | null = null;

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      start =
        event.touches.length === 1 &&
        drawerQuery.matches &&
        (isOpen ||
          (!startsInScroller(event.target) &&
            !startsInDragArea(event.target)))
          ? { x: touch.clientX, y: touch.clientY }
          : null;
    }

    function handleTouchEnd(event: TouchEvent) {
      if (!start) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      start = null;
      const isSwipe =
        Math.abs(dx) >= MIN_DISTANCE && Math.abs(dy) <= Math.abs(dx) * MAX_SLOPE;
      if (!isSwipe) return;
      if (dx > 0 && !isOpen) onOpen();
      if (dx < 0 && isOpen) onClose();
    }

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, onOpen, onClose]);
}
