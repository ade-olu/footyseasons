import { Link } from "react-router-dom";
import { pageTitle } from "../../utils/pageTitle";

// Shown for any URL that doesn't match a route
export default function NotFoundPage() {
  return (
    <>
      <title>{pageTitle("Page not found")}</title>
      <h1>Page not found</h1>
      <Link to="/">Back to Overview</Link>
    </>
  );
}
