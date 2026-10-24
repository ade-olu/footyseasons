import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronDown as ArrowDownIcon } from "reicon-react";
import { Check as CheckIcon } from "reicon-react"; // Tick shown next to the selected option
import "./Dropdown.scss";

// One option in the list
type DropdownOption<Value extends string | number> = {
  value: Value;
  label: string;
  disabled?: boolean;
};

// Props for the Dropdown component: its options, the selected value, a name for screen readers,
// an optional small label above the value (e.g. "Season") and a class for sizing
type DropdownProps<Value extends string | number> = {
  options: DropdownOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  ariaLabel: string;
  label?: string;
  className?: string;
};

// Custom select with a floating option list (ARIA listbox pattern)
export default function Dropdown<Value extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  label,
  className,
}: DropdownProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  // Index of the option highlighted with the keyboard while the list is open
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);

  // Close the list when clicking anywhere outside the dropdown
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  // Move focus into the list when it opens, so arrow keys work straight away
  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  function openList() {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  }

  function closeList() {
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function select(option: DropdownOption<Value>) {
    if (option.disabled) return;
    onChange(option.value);
    closeList();
  }

  // Next enabled option in a direction (1 down, -1 up), staying put at the ends
  function step(from: number, direction: 1 | -1) {
    for (let index = from + direction; options[index]; index += direction) {
      if (!options[index].disabled) return index;
    }
    return from;
  }

  // Open the list with the arrow keys as well as Enter/Space (which the button handles)
  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openList();
    }
  }

  // Keyboard support inside the open list (same keys as a native <select>)
  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => step(index, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => step(index, -1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(step(-1, 1));
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(step(options.length, -1));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(options[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        closeList();
        break;
      case "Tab":
        // Let focus move on naturally, just close the list
        setIsOpen(false);
        break;
    }
  }

  return (
    <div
      className={`dropdown${className ? ` ${className}` : ""}`}
      ref={wrapperRef}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`dropdown__button${isOpen ? " dropdown__button--open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={`${ariaLabel}: ${selected?.label ?? ""}`}
        onClick={() => (isOpen ? setIsOpen(false) : openList())}
        onKeyDown={handleButtonKeyDown}
      >
        <span className="dropdown__current">
          {label && <span className="dropdown__label">{label}</span>}
          <span className="dropdown__value">{selected?.label}</span>
        </span>
        <ArrowDownIcon className="dropdown__icon" />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          className="dropdown__list"
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={`${listId}-${activeIndex}`}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                className={`dropdown__option${isActive ? " dropdown__option--active" : ""}${isSelected ? " dropdown__option--selected" : ""}${option.disabled ? " dropdown__option--disabled" : ""}`}
                onPointerEnter={() => !option.disabled && setActiveIndex(index)}
                onClick={() => select(option)}
              >
                {option.label}
                {isSelected && <CheckIcon className="dropdown__check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
