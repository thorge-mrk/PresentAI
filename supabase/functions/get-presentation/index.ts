// get-presentation
// GET ?id=<presentationId>  -> { presentation, outlines, slides }
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/clients.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new HttpError(400, "Parameter id fehlt.");

    const svc = serviceClient();
    const { data: presentation, error: pErr } = await svc
      .from("presentations")
      .select("*")
      .eq("id", id)
      .single();
    if (pErr || !presentation) throw new HttpError(404, "Präsentation nicht gefunden.");
    if (presentation.user_id !== user.id) {
      throw new HttpError(403, "Kein Zugriff auf diese Präsentation.");
    }

    const { data: outlineRows } = await svc
      .from("slide_outlines")
      .select("*")
      .eq("presentation_id", id)
      .order("slide_index", { ascending: true });

    const { data: slides } = await svc
      .from("slides")
      .select("*")
      .eq("presentation_id", id)
      .order("slide_index", { ascending: true });

    const outlines = (outlineRows ?? []).map((o) => ({
      slideIndex: o.slide_index,
      section: o.section,
      title: o.title,
      visualDescription: o.visual_description,
    }));

    return json({ presentation, outlines, slides: slides ?? [] });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
