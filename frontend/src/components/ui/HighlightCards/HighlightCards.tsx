import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import "./HighlightCards.scss";

// Props for the HighlightCards component: the cards, and the page's own class
type HighlightCardsProps = {
  children: ReactNode;
  className?: string;
};

// Whether any shown description runs onto a second line
function hasWrappedDescription(grid: HTMLElement) {
  return [...grid.querySelectorAll(".highlight-card__description")].some(
    (description) => {
      const range = document.createRange();
      range.selectNodeContents(description);
      const rects = [...range.getClientRects()];
      const firstTop = Math.min(...rects.map((rect) => rect.top));
      return rects.some((rect) => rect.top - firstTop > rect.height / 2);
    },
  );
}

// The grid of highlight cards under a page's banner
export default function HighlightCards({
  children,
  className,
}: HighlightCardsProps) {
  const gridRef = useRef<HTMLElement>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  // Checks again on resize, font load and new data
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const check = () => setIsWrapped(hasWrappedDescription(grid));
    check();
    const observer = new ResizeObserver(check);
    observer.observe(grid);
    grid
      .querySelectorAll(".highlight-card__description")
      .forEach((description) => observer.observe(description));
    return () => observer.disconnect();
  }, [children]);

  return (
    <section
      className={`highlight-cards${isWrapped ? " highlight-cards--wrapped" : ""}${className ? ` ${className}` : ""}`}
      ref={gridRef}
    >
      {children}
    </section>
  );
}
