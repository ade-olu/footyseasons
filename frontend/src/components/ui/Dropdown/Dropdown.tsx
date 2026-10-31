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
// an optional small label above the value (e.g. "Season"), a class for sizing and which edge
// of the button the list lines up with (right by default, auto picks the side it sits on)
type DropdownProps<Value extends string | number> = {
  options: DropdownOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  ariaLabel: string;
  label?: string;
  className?: string;
  align?: "left" | "right" | "auto";
};

// The button's edge nearer its side of the screen, so the list opens towards the middle
function nearerEdge(element: HTMLElement | null): "left" | "right" {
  if (!element) return "right";
  const { left, right } = element.getBoundingClientRect();
  return left < window.innerWidth - right ? "left" : "right";
}

// Custom select with a floating option list (ARIA listbox pattern)
export default function Dropdown<Value extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  label,
  className,
  align = "right",
}: DropdownProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  // Index of the option highlighted with the keyboard while the list is open
  const [activeIndex, setActiveIndex] = useState(0);
  // Edge the open list lines up with, worked out on open for align="auto"
  const [listAlign, setListAlign] = useState<"left" | "right">("right");

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

  // Keep the highlighted option in view in a list that scrolls (only the list moves)
  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[activeIndex] as HTMLElement | undefined;
    if (!list || !option) return;

    const bottom = option.offsetTop + option.offsetHeight;
    if (option.offsetTop < list.scrollTop) {
      list.scrollTop = option.offsetTop;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [isOpen, activeIndex]);

  function openList() {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(Math.max(selectedIndex, 0));
    setListAlign(align === "auto" ? nearerEdge(buttonRef.current) : align);
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
          className={`dropdown__list dropdown__list--${listAlign}`}
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
