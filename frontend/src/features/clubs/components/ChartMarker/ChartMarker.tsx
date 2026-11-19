import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/utils/cx";
import "./ChartMarker.scss";

// Props for ChartMarker: the position shown, the accent for the latest or
// selected point, active for the larger hover marker that glides between
// points, hidden while it fades out, and a class and style that place it
type ChartMarkerProps = {
  children: ReactNode;
  accent?: boolean;
  active?: boolean;
  hidden?: boolean;
  className?: string;
  style?: CSSProperties;
};

// A position in a circle on a chart, centred on where its class places it
export default function ChartMarker({
  children,
  accent,
  active,
  hidden,
  className,
  style,
}: ChartMarkerProps) {
  return (
    <span
      className={cx(
        "chart-marker",
        accent && "chart-marker--accent",
        active && "chart-marker--active",
        hidden && "chart-marker--hidden",
        className,
      )}
      style={style}
      aria-hidden
    >
      {children}
    </span>
  );
}
