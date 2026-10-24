import type { ReactNode } from "react";
import "./SectionCard.scss";

// Props for the SectionCard component: its content, plus a class for grid span and layout tweaks
type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

// White panel that wraps each overview section
export default function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section className={`section-card${className ? ` ${className}` : ""}`}>
      {children}
    </section>
  );
}
