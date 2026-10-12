import { Link } from "react-router-dom";

// Shown for any URL that doesn't match a route
export default function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <Link to="/">Back to Overview</Link>
    </>
  );
}
