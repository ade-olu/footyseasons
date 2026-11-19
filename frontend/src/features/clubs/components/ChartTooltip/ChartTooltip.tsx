import type { CSSProperties, Ref } from "react";
import { cx } from "@/utils/cx";
import "./ChartTooltip.scss";

// Props for ChartTooltip: its three lines, whether it opens above its point
// (for points in the lower half), hidden while it fades out, and a class and
// style that place it; x (0 to 1 across) is kept for keeping it in view
type ChartTooltipProps = {
  title: string;
  summary: string;
  detail: string;
  above: boolean;
  hidden: boolean;
  x: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

// A dark tooltip for a chart point: the title, a medium summary and a detail
export default function ChartTooltip({
  title,
  summary,
  detail,
  above,
  hidden,
  x,
  className,
  style,
  ref,
}: ChartTooltipProps) {
  return (
    <div
      ref={ref}
      className={cx(
        "chart-tooltip",
        above && "chart-tooltip--above",
        hidden && "chart-tooltip--hidden",
        className,
      )}
      style={style}
      data-x={x}
      aria-hidden
    >
      <span>{title}</span>
      <span className="chart-tooltip__summary">{summary}</span>
      <span>{detail}</span>
    </div>
  );
}
