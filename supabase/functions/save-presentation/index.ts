// save-presentation
// POST { presentationId, slides: [{ id, slide_index, content, title?, speaker_notes?, layout?, layout_group? }] }
//  -> persists edited slide content back to the DB (autosave). Owner-only.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/clients.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface IncomingSlide {
  id?: string;
  slide_index?: number;
  index?: number;
  content?: Record<string, unknown>;
  title?: string | null;
  speaker_notes?: string | null;
  speaker_note?: string | null;
  layout?: string | null;
  layout_group?: string | null;
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    const { presentationId, slides } = (await req.json()) as {
      presentationId?: string;
      slides?: IncomingSlide[];
    };
    if (!presentationId) throw new HttpError(400, "presentationId fehlt.");
    if (!Array.isArray(slides)) throw new HttpError(400, "slides fehlen.");

    const svc = serviceClient();
    const { data: presentation, error: pErr } = await svc
      .from("presentations")
      .select("id, user_id")
      .eq("id", presentationId)
      .single();
    if (pErr || !presentation) throw new HttpError(404, "Präsentation nicht gefunden.");
    if (presentation.user_id !== user.id) {
      throw new HttpError(403, "Kein Zugriff auf diese Präsentation.");
    }

    const rows = slides
      .filter((s) => s.id && UUID_RE.test(s.id))
      .map((s) => {
        const content = (s.content && typeof s.content === "object")
          ? s.content
          : {};
        const c = content as Record<string, unknown>;
        return {
          id: s.id!,
          presentation_id: presentationId,
          slide_index: s.slide_index ?? s.index ?? 0,
          content,
          title: s.title ?? (c.title as string) ?? (c.heading as string) ?? null,
          speaker_notes: s.speaker_notes ?? s.speaker_note ?? null,
          layout: s.layout ?? null,
          layout_group: s.layout_group ?? "general",
        };
      });

    if (rows.length === 0) return json({ ok: true, count: 0 });

    const { error: upErr } = await svc
      .from("slides")
      .upsert(rows, { onConflict: "id" });
    if (upErr) throw new HttpError(500, `Speichern fehlgeschlagen: ${upErr.message}`);

    return json({ ok: true, count: rows.length });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
