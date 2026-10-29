import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/index.scss";
import App from "./App.tsx";

// iOS Safari only applies :active (the press effect) once the page listens for touches
document.addEventListener("touchstart", () => {}, { passive: true });

// Past seasons don't change during a visit, so fetched data is kept and never refetched
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
