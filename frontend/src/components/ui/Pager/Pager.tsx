import {
  ChevronLeft as ArrowLeftIcon,
  ChevronRight as ArrowRightIcon,
} from "reicon-react";
import "./Pager.scss";

// Props for the Pager component: the shown page (from 1), how many there are,
// what to do when another is picked, and optional names for the buttons
type PagerProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
};

// Previous and next buttons around "Page 1 of 54"
export default function Pager({
  page,
  pageCount,
  onChange,
  previousLabel = "Previous page",
  nextLabel = "Next page",
}: PagerProps) {
  return (
    <div className="pager">
      <button
        type="button"
        className="pager__step"
        aria-label={previousLabel}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeftIcon className="pager__icon" aria-hidden />
      </button>
      <p className="pager__page">
        Page {page} of {pageCount}
      </p>
      <button
        type="button"
        className="pager__step"
        aria-label={nextLabel}
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        <ArrowRightIcon className="pager__icon" aria-hidden />
      </button>
    </div>
  );
}
