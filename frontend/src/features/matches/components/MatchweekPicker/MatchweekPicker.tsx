import {
  ChevronLeft as ArrowLeftIcon,
  ChevronRight as ArrowRightIcon,
} from "reicon-react";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import "./MatchweekPicker.scss";

// Props for the MatchweekPicker component: the shown matchweek, how many there are and a change handler
type MatchweekPickerProps = {
  matchweek: number;
  total: number;
  onChange: (matchweek: number) => void;
};

// Previous / next buttons around a matchweek dropdown
export default function MatchweekPicker({
  matchweek,
  total,
  onChange,
}: MatchweekPickerProps) {
  const options = Array.from({ length: total }, (_, index) => ({
    value: index + 1,
    label: `${index + 1} of ${total}`,
  }));

  return (
    <div className="matchweek-picker">
      <button
        type="button"
        className="matchweek-picker__step"
        aria-label="Previous matchweek"
        disabled={matchweek <= 1}
        onClick={() => onChange(matchweek - 1)}
      >
        <ArrowLeftIcon className="matchweek-picker__icon" aria-hidden />
      </button>
      <Dropdown
        className="matchweek-picker__dropdown"
        options={options}
        value={matchweek}
        onChange={onChange}
        ariaLabel="Matchweek"
        label="Matchweek"
      />
      <button
        type="button"
        className="matchweek-picker__step"
        aria-label="Next matchweek"
        disabled={matchweek >= total}
        onClick={() => onChange(matchweek + 1)}
      >
        <ArrowRightIcon className="matchweek-picker__icon" aria-hidden />
      </button>
    </div>
  );
}
