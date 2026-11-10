import { useLayoutEffect, useRef, useState } from "react";
import "./FittedName.scss";

// Props for the FittedName component: the full name, shorter ones to try in
// order when it doesn't fit, hover text (name by default) and the caller's
// class, which sets the font and the ellipsis
type FittedNameProps = {
  name: string;
  shortNames?: string[];
  title?: string;
  className: string;
};

// A name on one line: the full name when it fits, otherwise the first short
// name that does, or the last one with an ellipsis
export default function FittedName({
  name,
  shortNames = [],
  title,
  className,
}: FittedNameProps) {
  const nameRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  const options = [name, ...shortNames];

  // Compares each option's width with the name's, again on resize or font load
  useLayoutEffect(() => {
    const element = nameRef.current;
    const measures = measureRef.current;
    if (!element || !measures) return;

    // Exact widths, since offsetWidth rounds and a name 0.1px too wide gets cut
    const check = () => {
      const room = element.getBoundingClientRect().width;
      const widths = [...measures.children].map(
        (option) => option.getBoundingClientRect().width,
      );
      const fitting = widths.findIndex((width) => width <= room);
      setShown(fitting === -1 ? widths.length - 1 : fitting);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    observer.observe(measures);
    return () => observer.disconnect();
  }, [name, shortNames]);

  return (
    <span
      className={`fitted-name ${className}`}
      ref={nameRef}
      title={title ?? name}
    >
      {shortNames.length > 0 && (
        <span className="fitted-name__measure" ref={measureRef} aria-hidden>
          {options.map((option, index) => (
            <span key={index}>{option}</span>
          ))}
        </span>
      )}
      {shown === 0 || !options[shown] ? (
        name
      ) : (
        <>
          <span aria-hidden>{options[shown]}</span>
          {/* Screen readers get the full name */}
          <span className="fitted-name__full">{name}</span>
        </>
      )}
    </span>
  );
}
