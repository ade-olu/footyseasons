import { API_URL } from "@/api/config";

// GETs an API path (e.g. "/leagues/PL/awards?season=2025") as JSON; throws on an error status
export async function fetchJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal });

  if (!res.ok) {
    throw new Error(`Could not load ${path} (${res.status})`);
  }

  return (await res.json()) as T;
}
