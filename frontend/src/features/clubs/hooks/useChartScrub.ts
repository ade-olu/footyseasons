import { useRef, type PointerEvent } from "react";

// What a chart passes with each event: the point under a finger, the open and
// shown points, and how to open and close one
export type ScrubOptions<T> = {
  pointAt: (clientX: number) => T | null;
  active: T | null;
  shown: T | null;
  show: (point: T) => void;
  close: () => void;
  canStart?: (event: PointerEvent) => boolean; // Whether this press scrubs
  onScrub?: (point: T) => void; // After each move to another point
};

// Touch scrubbing for a chart: a finger slides through the points, a second
// tap on the open point closes it, and the page taking the touch to scroll
// closes it too. Mouse presses are left to the chart.
export function useChartScrub() {
  const dragRef = useRef<{ moved: boolean; wasOpen: boolean } | null>(null);
  // Whether the last press scrubbed, so a chart's own click can skip it
  const scrubbedRef = useRef(false);

  function down<T>(event: PointerEvent, options: ScrubOptions<T>) {
    scrubbedRef.current = false;
    if (event.pointerType === "mouse" || options.canStart?.(event) === false) {
      return;
    }
    const point = options.pointAt(event.clientX);
    if (point === null) return;
    dragRef.current = { moved: false, wasOpen: point === options.active };
    scrubbedRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    options.show(point);
  }

  function move<T>(event: PointerEvent, options: ScrubOptions<T>) {
    const drag = dragRef.current;
    if (event.pointerType === "mouse" || !drag) return;
    const point = options.pointAt(event.clientX);
    if (point === null || point === options.shown) return;
    drag.moved = true;
    options.show(point);
    options.onScrub?.(point);
  }

  function up<T>(options: ScrubOptions<T>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved && drag.wasOpen) options.close();
  }

  function cancel<T>(options: ScrubOptions<T>) {
    if (!dragRef.current) return;
    dragRef.current = null;
    options.close();
  }

  return { down, move, up, cancel, scrubbed: () => scrubbedRef.current };
}
