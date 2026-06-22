// Image search via Pexels (primary) and Unsplash (fallback).
// Keys come from edge-function secrets and are added by the owner.
const PEXELS_KEY = Deno.env.get("PEXELS_API_KEY") ?? "";
const UNSPLASH_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY") ?? "";

export interface ImageResult {
  id: string;
  url: string;
  thumb: string;
  credit: string;
  source: "unsplash" | "pexels";
}

export async function searchImages(
  query: string,
  page = 1,
  perPage = 9,
): Promise<ImageResult[]> {
  const q = query.trim() || "abstract background";
  const results: ImageResult[] = [];

  if (PEXELS_KEY) {
    try {
      const r = await fetch(
        `https://api.pexels.com/v1/search?query=${
          encodeURIComponent(q)
        }&page=${page}&per_page=${perPage}&orientation=landscape`,
        { headers: { Authorization: PEXELS_KEY } },
      );
      if (r.ok) {
        const d = await r.json();
        for (const p of d.photos ?? []) {
          results.push({
            id: `pexels-${p.id}`,
            url: p.src?.large2x || p.src?.large || p.src?.original,
            thumb: p.src?.medium || p.src?.small || p.src?.tiny,
            credit: `Foto: ${p.photographer ?? "Pexels"} (Pexels)`,
            source: "pexels",
          });
        }
      }
    } catch (_e) { /* ignore, try fallback */ }
  }

  if (results.length === 0 && UNSPLASH_KEY) {
    try {
      const r = await fetch(
        `https://api.unsplash.com/search/photos?query=${
          encodeURIComponent(q)
        }&page=${page}&per_page=${perPage}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
      );
      if (r.ok) {
        const d = await r.json();
        for (const p of d.results ?? []) {
          results.push({
            id: `unsplash-${p.id}`,
            url: p.urls?.regular,
            thumb: p.urls?.thumb,
            credit: `Foto: ${p.user?.name ?? "Unsplash"} (Unsplash)`,
            source: "unsplash",
          });
        }
      }
    } catch (_e) { /* ignore */ }
  }

  return results;
}

// Deterministic, always-available fallback so slides never have broken images.
export function fallbackImage(seed: string): string {
  const safe = encodeURIComponent(seed.slice(0, 40) || "presentai");
  return `https://picsum.photos/seed/${safe}/1280/720`;
}

export async function firstImage(
  query: string,
): Promise<{ url: string; credit: string }> {
  const hits = await searchImages(query, 1, 1);
  if (hits.length) return { url: hits[0].url, credit: hits[0].credit };
  return { url: fallbackImage(query), credit: "Bild: Lorem Picsum" };
}
