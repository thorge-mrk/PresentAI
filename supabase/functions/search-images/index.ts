// search-images
// GET ?q=<query>&page=1&per_page=9 -> { images }
// Requires an allowlisted user (protects the owner's Pexels/Unsplash limits).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError, requireAllowed } from "../_shared/auth.ts";
import { searchImages } from "../_shared/images.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    await requireAllowed(user);

    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    if (!q.trim()) throw new HttpError(400, "Suchbegriff (q) fehlt.");
    const page = Number(url.searchParams.get("page") ?? "1") || 1;
    const perPage = Number(url.searchParams.get("per_page") ?? "9") || 9;

    const images = await searchImages(q, page, Math.min(perPage, 30));
    return json({ images });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
