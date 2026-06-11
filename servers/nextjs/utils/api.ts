/**
 * Simplified API utility — FastAPI and Electron removed.
 * All backend calls now go to Supabase Edge Functions via lib/presentation-api.ts.
 * This file keeps only helpers still needed by existing UI components.
 */

export function getApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

// External CDN images don't need rewriting — pass through as-is.
export function resolveBackendAssetUrl(path?: string): string {
  return path?.trim() || "";
}

export function getBackendAssetSource(
  asset: { file_url?: string | null; path?: string | null; url?: string | null } | string | null | undefined
): string {
  if (typeof asset === "string") return asset;
  if (!asset) return "";
  return (asset.file_url || asset.path || asset.url || "").trim();
}

export function resolveBackendAssetSource(
  asset: { file_url?: string | null; path?: string | null; url?: string | null } | string | null | undefined
): string {
  return resolveBackendAssetUrl(getBackendAssetSource(asset));
}

export const normalizeBackendAssetUrls = <T,>(input: T): T => input;

export function buildAbsoluteApiRequestUrl(path: string, base?: string): string {
  const resolved = getApiUrl(path);
  if (/^https?:\/\//i.test(resolved)) return resolved;
  const b = base || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return new URL(resolved, b).toString();
}

export function getFastAPIUrl(): string {
  return typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
}
