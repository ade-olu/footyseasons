import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "./SegmentedControl.scss";

// Side padding of content-sized options: 16px when it fits (or maxPadding),
// never under 4px; always a whole, even number
const MAX_PADDING = 16;
const MIN_PADDING = 4;

// One option in the control
type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: string;
  disabled?: boolean;
};

// Props for the SegmentedControl component: its options, the selected value, a
// label for screen readers, and "content" to size each option to its label
// instead of giving them equal widths, with up to maxPadding at the sides
type SegmentedControlProps<Value extends string> = {
  options: SegmentedControlOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  label: string;
  className?: string;
  fit?: "equal" | "content";
  maxPadding?: number;
};

// Row of toggle buttons where one is selected (e.g. Overall / Home / Away)
export default function SegmentedControl<Value extends string>({
  options,
  value,
  onChange,
  label,
  className,
  fit = "equal",
  maxPadding = MAX_PADDING,
}: SegmentedControlProps<Value>) {
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  // Which way the pill last moved, so its leading edge can go first
  const [previousIndex, setPreviousIndex] = useState(selectedIndex);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  if (selectedIndex !== previousIndex) {
    setPreviousIndex(selectedIndex);
    setDirection(selectedIndex > previousIndex ? "right" : "left");
  }

  // Content-sized options: side padding up to 16px, less when the labels would
  // overflow, and the pill's edges from the selected button
  const controlRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<{ left: number; right: number }>();
  const [padding, setPadding] = useState(maxPadding);
  useLayoutEffect(() => {
    const control = controlRef.current;
    if (fit !== "content" || !control) return;

    const measure = () => {
      const buttons = [...control.querySelectorAll("button")];
      const style = getComputedStyle(control);
      const room =
        control.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      // Label widths alone (a range ignores the padding), plus 2px of border each
      const labels = buttons.reduce((total, button) => {
        const range = document.createRange();
        range.selectNodeContents(button);
        return total + range.getBoundingClientRect().width + 2;
      }, 0);
      // Rounded down to an even number of pixels
      const fitting = Math.floor((room - labels) / (4 * buttons.length)) * 2;
      setPadding(Math.max(MIN_PADDING, Math.min(maxPadding, fitting)));

      const button = buttons[selectedIndex];
      if (!button) return;
      setEdges({
        left: button.offsetLeft,
        right: control.clientWidth - button.offsetLeft - button.offsetWidth,
      });
    };
    measure();
    // The buttons too (with their padding), since a font load or a new padding
    // changes them but not the control
    const observer = new ResizeObserver(measure);
    observer.observe(control);
    control.querySelectorAll("button").forEach((button) => {
      observer.observe(button, { box: "border-box" });
    });
    return () => observer.disconnect();
  }, [fit, maxPadding, selectedIndex, options.length]);

  return (
    <div
      ref={controlRef}
      className={`segmented-control segmented-control--${fit}${direction ? ` segmented-control--${direction}` : ""}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
      style={
        {
          "--segmented-count": options.length,
          "--segmented-index": selectedIndex,
          "--segmented-option-padding": `${padding}px`,
        } as CSSProperties
      }
    >
      {/* White pill behind the selected option; stretches and bounces to the new one */}
      <span
        className="segmented-control__indicator"
        style={fit === "content" ? edges : undefined}
        aria-hidden
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="segmented-control__option"
          aria-pressed={option.value === value}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
