import { useState, type CSSProperties } from "react";
import "./SegmentedControl.scss";

// One option in the control
type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: string;
  disabled?: boolean;
};

// Props for the SegmentedControl component: its options, the selected value and a label for screen readers
type SegmentedControlProps<Value extends string> = {
  options: SegmentedControlOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  label: string;
  className?: string;
};

// Row of equal-width toggle buttons where one is selected (e.g. Overall / Home / Away)
export default function SegmentedControl<Value extends string>({
  options,
  value,
  onChange,
  label,
  className,
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

  return (
    <div
      className={`segmented-control${direction ? ` segmented-control--${direction}` : ""}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
      style={
        {
          "--segmented-count": options.length,
          "--segmented-index": selectedIndex,
        } as CSSProperties
      }
    >
      {/* White pill behind the selected option; stretches and bounces to the new one */}
      <span className="segmented-control__indicator" aria-hidden />
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
