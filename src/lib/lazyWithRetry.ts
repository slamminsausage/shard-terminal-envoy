import { lazy } from "react";

/**
 * Wraps React.lazy() with retry logic for handling stale chunk errors after deploys.
 *
 * When a new build is deployed, old chunk filenames no longer exist on the server.
 * The server returns index.html (200) instead of the JS file, causing a MIME type error.
 * This wrapper:
 * 1. Catches the failed import
 * 2. Checks if we've already retried (via sessionStorage flag)
 * 3. If not, sets the flag and reloads the page to get fresh chunk references
 * 4. If already retried, lets the error propagate to the ErrorBoundary
 */
export function lazyWithRetry(
  importFn: () => Promise<{ default: React.ComponentType<any> }>
) {
  return lazy(() =>
    importFn().catch((error: Error) => {
      const isChunkError =
        error.message.includes("Failed to fetch dynamically imported module") ||
        error.message.includes("Loading chunk") ||
        error.message.includes("Loading CSS chunk") ||
        error.message.includes("MIME type");

      if (!isChunkError) {
        throw error;
      }

      // Prevent infinite reload loops
      const reloadKey = "chunk_reload_attempted";
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      if (lastReload && now - parseInt(lastReload, 10) < 30_000) {
        // Already reloaded within the last 30 seconds - don't loop
        throw error;
      }

      console.warn(
        "[lazyWithRetry] Stale chunk detected, reloading page to fetch updated assets..."
      );
      sessionStorage.setItem(reloadKey, now.toString());
      window.location.reload();

      // Return a never-resolving promise since we're reloading
      return new Promise(() => {});
    })
  );
}

/**
 * Same as lazyWithRetry but for modules with named exports.
 * Use when the lazy import needs .then() to extract a named export.
 */
export function lazyNamedWithRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<Record<string, T>>,
  exportName: string
) {
  return lazyWithRetry(() =>
    importFn().then((module) => ({ default: module[exportName] }))
  );
}
