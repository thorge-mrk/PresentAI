// search-icons
// GET ?q=<query>&limit=20 -> { icons }
// Returns Phosphor icon slugs (cheap, local) — only requires a logged-in user.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError } from "../_shared/auth.ts";
import { searchIconSlugs } from "../_shared/icons.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    await getUser(req);

    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? "20") || 20;

    const icons = searchIconSlugs(q, Math.min(limit, 60));
    return json({ icons });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
