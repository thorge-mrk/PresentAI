// generate-image
// POST { prompt }
//  -> generates an image with Gemini ("Nano Banana"), stores it in the public
//     `uploads` bucket and returns { url, source }. Falls back to a stock photo
//     if AI image generation is unavailable.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError, requireAllowed } from "../_shared/auth.ts";
import { generateImageUrl } from "../_shared/image-gen.ts";

interface Body {
  prompt?: string;
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    await requireAllowed(user);

    const { prompt } = (await req.json()) as Body;
    const clean = (prompt ?? "").trim();
    if (!clean) throw new HttpError(400, "Bitte eine Bildbeschreibung angeben.");

    const { url, source } = await generateImageUrl(clean, user.id);
    return json({ url, source });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
