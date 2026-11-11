import type { ReactNode } from "react";
import "./HighlightCards.scss";

// Props for the HighlightCards component: the cards, and the page's own class
type HighlightCardsProps = {
  children: ReactNode;
  className?: string;
};

// The grid of highlight cards under a page's banner
export default function HighlightCards({
  children,
  className,
}: HighlightCardsProps) {
  return (
    <section className={`highlight-cards${className ? ` ${className}` : ""}`}>
      {children}
    </section>
  );
}
