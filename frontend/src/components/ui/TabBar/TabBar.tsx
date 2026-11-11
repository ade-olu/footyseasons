import { useLayoutEffect, useRef, type CSSProperties } from "react";
import {
  matchPath,
  NavLink,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import "./TabBar.scss";

// One tab; `end` for a route other tabs extend
type Tab = {
  label: string;
  to: string;
  end?: boolean;
};

// Props for the TabBar component: the tabs, a screen reader name and a class
type TabBarProps = {
  tabs: Tab[];
  ariaLabel: string;
  className?: string;
};

// Sticky underline tabs, each a route, that switch without losing the scroll
export default function TabBar({ tabs, ariaLabel, className }: TabBarProps) {
  const barRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  // The open tab
  const activeIndex = tabs.findIndex((tab) =>
    matchPath({ path: tab.to.split("?")[0], end: tab.end ?? false }, pathname),
  );

  // If the bar was stuck, the new tab starts right under it
  useLayoutEffect(() => {
    const bar = barRef.current;
    const previous = bar?.previousElementSibling;
    if (!bar || !previous?.parentElement || navigationType === "POP") return;

    // The bar's place in the page, after the previous section and the gap
    const gap = parseFloat(getComputedStyle(previous.parentElement).rowGap);
    const top =
      previous.getBoundingClientRect().bottom + window.scrollY + (gap || 0);
    const stuckAt = top - parseFloat(getComputedStyle(bar).top);
    if (window.scrollY > stuckAt) window.scrollTo(0, stuckAt);
  }, [pathname, navigationType]);

  return (
    <nav
      className={`tab-bar${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
      ref={barRef}
    >
      <div className="tab-bar__track">
        <ul className="tab-bar__list">
          {tabs.map((tab) => (
            <li className="tab-bar__item" key={tab.to}>
              <NavLink
                className={({ isActive }) =>
                  `tab-bar__tab${isActive ? " tab-bar__tab--active" : ""}`
                }
                to={tab.to}
                end={tab.end}
                state={{ keepScroll: true }}
              >
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
        {activeIndex !== -1 && (
          <span
            className="tab-bar__indicator"
            style={
              {
                "--tab-count": tabs.length,
                "--tab-index": activeIndex,
              } as CSSProperties
            }
            aria-hidden
          />
        )}
      </div>
    </nav>
  );
}
