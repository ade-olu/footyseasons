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

// Row of toggle buttons where one is selected (e.g. Overall / Home / Away)
export default function SegmentedControl<Value extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <div
      className={`segmented-control${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
    >
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
