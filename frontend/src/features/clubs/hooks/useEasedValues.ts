import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/utils/motion";

// How long the values take to move to new ones
const MORPH_DURATION = 500;

// Eases from the values shown to new ones, such as another club's line. A
// different number of values, or a new shape key, switches straight away
export function useEasedValues(target: number[], shapeKey = "") {
  const key = target.join(",");
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  const shapeRef = useRef(shapeKey);

  useEffect(() => {
    const to = key ? key.split(",").map(Number) : [];
    const from = shownRef.current;
    const sameShape = shapeRef.current === shapeKey;
    shapeRef.current = shapeKey;
    const duration =
      from.length === to.length && sameShape && !prefersReducedMotion()
        ? MORPH_DURATION
        : 0;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = duration ? Math.min((now - start) / duration, 1) : 1;
      const eased = 1 - (1 - progress) ** 3; // Ease-out cubic
      const next = to.map(
        (value, i) => (from[i] ?? value) * (1 - eased) + value * eased,
      );
      shownRef.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [key, shapeKey]);

  return shown.length === target.length ? shown : target;
}
