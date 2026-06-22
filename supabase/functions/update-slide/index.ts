// update-slide
// PATCH { slideId, updates } -> { slide }
// Allowed fields: title, body_text, speaker_notes, image_url, icon_name, content
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/clients.ts";

const ALLOWED = new Set([
  "title",
  "body_text",
  "speaker_notes",
  "image_url",
  "image_credit",
  "icon_name",
  "content",
]);

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    const { slideId, updates } = (await req.json()) as {
      slideId?: string;
      updates?: Record<string, unknown>;
    };
    if (!slideId) throw new HttpError(400, "slideId fehlt.");
    if (!updates || typeof updates !== "object") {
      throw new HttpError(400, "updates fehlen.");
    }

    const svc = serviceClient();

    // Verify ownership through the parent presentation.
    const { data: slide, error: sErr } = await svc
      .from("slides")
      .select("id, presentation_id")
      .eq("id", slideId)
      .single();
    if (sErr || !slide) throw new HttpError(404, "Folie nicht gefunden.");

    const { data: presentation } = await svc
      .from("presentations")
      .select("user_id")
      .eq("id", slide.presentation_id)
      .single();
    if (!presentation || presentation.user_id !== user.id) {
      throw new HttpError(403, "Kein Zugriff auf diese Folie.");
    }

    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (ALLOWED.has(k)) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) {
      throw new HttpError(400, "Keine gültigen Felder zum Aktualisieren.");
    }

    const { data: updated, error: uErr } = await svc
      .from("slides")
      .update(patch)
      .eq("id", slideId)
      .select()
      .single();
    if (uErr) throw new HttpError(500, `Aktualisieren fehlgeschlagen: ${uErr.message}`);

    return json({ slide: updated });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
