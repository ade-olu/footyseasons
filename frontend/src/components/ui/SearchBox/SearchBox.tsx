import { useRef } from "react";
import { Search as SearchIcon, X as ClearIcon } from "reicon-react";
import "./SearchBox.scss";

// Props for the SearchBox component: the label doubles as the placeholder
type SearchBoxProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

// Search input with a clear button; 280px wide, full width on phones
export default function SearchBox({ label, value, onChange }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="search-box">
      <label className="search-box__field">
        <SearchIcon className="search-box__icon" aria-hidden />
        <input
          ref={inputRef}
          className="search-box__input"
          type="search"
          placeholder={label}
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      {value && (
        <button
          type="button"
          className="search-box__clear"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
        >
          <ClearIcon className="search-box__icon" aria-hidden />
        </button>
      )}
    </div>
  );
}
