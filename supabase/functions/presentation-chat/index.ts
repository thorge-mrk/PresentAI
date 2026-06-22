// presentation-chat
// POST { presentationId, message }
//  -> a Gemini assistant that knows the deck and answers questions / suggests
//     concrete improvements. Owner + allowlist required (uses Gemini).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError, requireAllowed } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/clients.ts";
import { geminiText } from "../_shared/gemini.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    await requireAllowed(user);

    const { presentationId, message } = (await req.json()) as {
      presentationId?: string;
      message?: string;
    };
    if (!presentationId) throw new HttpError(400, "presentationId fehlt.");
    if (!message?.trim()) throw new HttpError(400, "Nachricht fehlt.");

    const svc = serviceClient();
    const { data: presentation, error: pErr } = await svc
      .from("presentations")
      .select("*")
      .eq("id", presentationId)
      .single();
    if (pErr || !presentation) throw new HttpError(404, "Präsentation nicht gefunden.");
    if (presentation.user_id !== user.id) {
      throw new HttpError(403, "Kein Zugriff auf diese Präsentation.");
    }

    const { data: slides } = await svc
      .from("slides")
      .select("slide_index, title, body_text, layout")
      .eq("presentation_id", presentationId)
      .order("slide_index", { ascending: true });

    const deck = (slides ?? [])
      .map(
        (s) =>
          `Folie ${s.slide_index + 1} (${s.layout}): ${s.title ?? ""}${
            s.body_text ? ` — ${s.body_text}` : ""
          }`,
      )
      .join("\n");

    const system = [
      "Du bist ein hilfreicher Assistent für die Präsentation des Nutzers.",
      "Antworte in der Sprache des Nutzers, freundlich und konkret.",
      "Du kannst Fragen zum Inhalt beantworten und konkrete Verbesserungen,",
      "Formulierungen oder zusätzliche Folienideen vorschlagen.",
      "Halte Antworten kompakt und nutze ggf. kurze Aufzählungen.",
    ].join(" ");

    const prompt = [
      `Thema der Präsentation: ${presentation.topic}`,
      `Zielgruppe: ${presentation.grade_level ?? "-"}`,
      presentation.research_data?.summary
        ? `Hintergrund: ${presentation.research_data.summary}`
        : "",
      "",
      "Aktuelle Folien:",
      deck || "(noch keine Folien generiert)",
      "",
      `Frage / Wunsch des Nutzers: ${message}`,
    ].join("\n");

    const reply = await geminiText(prompt, { system, temperature: 0.7 });

    return json({
      response: reply,
      conversation_id: crypto.randomUUID(),
      tool_calls: [],
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
