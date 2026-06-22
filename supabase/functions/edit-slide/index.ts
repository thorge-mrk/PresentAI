// edit-slide
// POST { slideId, prompt }
//  -> rewrites a single slide's content with Gemini according to the user's
//     instruction, keeping the same layout shape; re-hydrates media and saves.
//     Returns the updated slide.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError, requireAllowed } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/clients.ts";
import { geminiJSON } from "../_shared/gemini.ts";
import { hydrateMedia } from "../_shared/media.ts";
import { layoutShapeJSON } from "../_shared/layout-catalog.ts";

interface Body {
  slideId?: string;
  prompt?: string;
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    await requireAllowed(user);

    const { slideId, prompt } = (await req.json()) as Body;
    if (!slideId) throw new HttpError(400, "slideId fehlt.");
    const instruction = (prompt ?? "").trim();
    if (!instruction) throw new HttpError(400, "Bitte eine Anweisung angeben.");

    const svc = serviceClient();
    const { data: slide, error: sErr } = await svc
      .from("slides")
      .select("*, presentations!inner(user_id, topic, grade_level)")
      .eq("id", slideId)
      .single();
    if (sErr || !slide) throw new HttpError(404, "Folie nicht gefunden.");
    const owner = (slide as Record<string, any>).presentations?.user_id;
    if (owner !== user.id) throw new HttpError(403, "Kein Zugriff auf diese Folie.");

    const shape = layoutShapeJSON(slide.layout);
    const promptText = [
      `Du überarbeitest EINE Folie einer Präsentation zum Thema "${slide.presentations.topic}".`,
      `Zielgruppe: ${slide.presentations.grade_level}.`,
      `Antworte in der Sprache der Folie.`,
      ``,
      `Aktueller Inhalt (JSON):`,
      JSON.stringify(slide.content ?? {}),
      ``,
      `Layout-Form, die du EXAKT beibehalten musst:`,
      shape,
      ``,
      `Anweisung des Nutzers: ${instruction}`,
      ``,
      `Regeln:`,
      `- Behalte die Struktur/Schlüssel des Layouts bei.`,
      `- Bei Bildern: setze NUR "__image_prompt__" (englische Suchanfrage), KEINE URLs.`,
      `- Bei Icons: setze NUR "__icon_query__" (englische Suchanfrage), KEINE URLs.`,
      `- Halte dich an die Zeichenlimits.`,
      ``,
      `Gib NUR das aktualisierte content-JSON-Objekt zurück.`,
    ].join("\n");

    const content = await geminiJSON<Record<string, unknown>>(promptText, {
      temperature: 0.6,
    });
    await hydrateMedia(content);

    const c = content as Record<string, unknown>;
    const title = (c.title as string) ?? (c.heading as string) ?? slide.title;

    const { data: updated, error: uErr } = await svc
      .from("slides")
      .update({ content, title })
      .eq("id", slideId)
      .select()
      .single();
    if (uErr) throw new HttpError(500, `Speichern fehlgeschlagen: ${uErr.message}`);

    return json({ slide: updated });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
