import { useId, type ReactNode } from "react";
import { cx } from "@/utils/cx";
import "./PageBanner.scss";

// Props for the PageBanner component: the title, the description once loaded
// or the error text if loading failed, what sits beside the text, and a class
// for the page's own sizes
type PageBannerProps = {
  title: string;
  description?: ReactNode;
  error: string;
  isError: boolean;
  isLoading: boolean;
  podium?: boolean; // Bars sit on the bottom edge, with the text centred
  className?: string;
  children?: ReactNode;
};

// A page's dark banner: title and description, with the page's own summary
// beside them, or below once the content area is narrow
export default function PageBanner({
  title,
  description,
  error,
  isError,
  isLoading,
  podium = false,
  className,
  children,
}: PageBannerProps) {
  const titleId = useId();

  return (
    <section
      className={cx("page-banner", podium && "page-banner--podium", className)}
      aria-labelledby={titleId}
      aria-busy={isLoading}
    >
      <div className="page-banner__text">
        <h2 id={titleId} className="page-banner__title">
          {title}
        </h2>
        {isError && (
          <p className="page-banner__description" role="alert">
            {error}
          </p>
        )}
        {description !== undefined && (
          <p className="page-banner__description">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
