import type { Ref } from "react";
import { cx } from "@/utils/cx";
import "./ChartLine.scss";

// Props for ChartLine: its polylines as "x,y x,y" in the viewBox's units (one
// per run, so a line can break), the viewBox's width (its height is 1), and a
// class that places and sizes it
type ChartLineProps = {
  lines: string[];
  width: number;
  className?: string;
  ref?: Ref<SVGSVGElement>;
};

// A chart's line, stretched to its box with an even 2px stroke; draws in from
// the left when it appears
export default function ChartLine({
  lines,
  width,
  className,
  ref,
}: ChartLineProps) {
  return (
    <svg
      ref={ref}
      className={cx("chart-line", className)}
      viewBox={`0 0 ${width} 1`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {lines.map((points, i) => (
        <polyline key={i} points={points} />
      ))}
    </svg>
  );
}
