import { Link } from "react-router-dom";
import { useSelection } from "@/hooks/useSelection";
import { pageTitle } from "@/utils/pageTitle";

// Shown for any URL that doesn't match a route
export default function NotFoundPage() {
  const { pathTo } = useSelection(); // Keeps the league and season

  return (
    <>
      <title>{pageTitle("Page not found")}</title>
      <h1>Page not found</h1>
      <Link to={pathTo("")}>Back to Overview</Link>
    </>
  );
}
