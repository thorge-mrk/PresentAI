// generate-outline
// POST { topic, gradeLevel, textDensity, slideCount, template? }
//  -> researches the topic with Gemini, creates a presentation row and the
//     slide outlines, returns { presentationId, outlines }.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError, requireAllowed } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/clients.ts";
import { geminiJSON } from "../_shared/gemini.ts";

interface Body {
  topic?: string;
  gradeLevel?: string;
  textDensity?: "low" | "compact" | "high";
  slideCount?: number;
  template?: string;
  theme?: Record<string, unknown> | null;
}

interface OutlineItem {
  section: string;
  title: string;
  visualDescription: string;
}

interface GeminiOutline {
  title?: string;
  researchSummary?: string;
  outlines: OutlineItem[];
}

const DENSITY_HINT: Record<string, string> = {
  low: "Sehr wenig Text pro Folie: kurze, prägnante Stichpunkte.",
  compact: "Ausgewogene Textmenge: informativ, aber nicht überladen.",
  high: "Ausführlicher Text: detaillierte Erklärungen pro Folie.",
};

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    await requireAllowed(user);

    const body = (await req.json()) as Body;
    const topic = (body.topic ?? "").trim();
    if (!topic) throw new HttpError(400, "Bitte ein Thema angeben.");

    const gradeLevel = body.gradeLevel ?? "Oberstufe (11.-13. Klasse)";
    const textDensity = body.textDensity ?? "compact";
    const slideCount = Math.min(Math.max(body.slideCount ?? 10, 1), 25);
    const template = body.template ?? "general";

    const prompt = [
      `Du bist ein Experte für didaktisch hochwertige Präsentationen.`,
      `Erstelle die Gliederung für eine Präsentation.`,
      ``,
      `Thema: ${topic}`,
      `Zielgruppe / Niveau: ${gradeLevel}`,
      `Folienanzahl: genau ${slideCount} Folien.`,
      `Textmenge: ${DENSITY_HINT[textDensity] ?? DENSITY_HINT.compact}`,
      ``,
      `Anforderungen:`,
      `- Antworte in der Sprache des Themas (bei deutschem Thema auf Deutsch).`,
      `- Folie 1 ist die Titelfolie, Folie 2  idealerweise eine Agenda/Inhaltsübersicht, die letzte Folie ein Fazit/Zusammenfassung.`,
      `- Baue einen logischen roten Faden auf, der zum Niveau der Zielgruppe passt.`,
      `- "visualDescription" beschreibt kurz (auf Englisch, 10-50 Zeichen) ein passendes Bildmotiv für die Folie.`,
      ``,
      `Gib NUR valides JSON in genau diesem Format zurück:`,
      `{`,
      `  "title": "Kurzer Präsentationstitel",`,
      `  "researchSummary": "3-5 Sätze Kernwissen zum Thema, faktisch korrekt",`,
      `  "outlines": [`,
      `    { "section": "Abschnittsname", "title": "Folientitel", "visualDescription": "english image motif" }`,
      `  ]`,
      `}`,
      `Das Array "outlines" muss exakt ${slideCount} Einträge enthalten.`,
    ].join("\n");

    const result = await geminiJSON<GeminiOutline>(prompt, { temperature: 0.6 });
    const outlines = (result.outlines ?? []).slice(0, slideCount);
    if (outlines.length === 0) {
      throw new HttpError(502, "Die Gliederung konnte nicht erstellt werden. Bitte erneut versuchen.");
    }

    const svc = serviceClient();
    const { data: presentation, error: insErr } = await svc
      .from("presentations")
      .insert({
        user_id: user.id,
        topic,
        grade_level: gradeLevel,
        text_density: textDensity,
        slide_count: outlines.length,
        template,
        theme: body.theme ?? null,
        status: "outlined",
        research_data: { summary: result.researchSummary ?? "" },
      })
      .select()
      .single();
    if (insErr || !presentation) {
      throw new HttpError(500, `Speichern fehlgeschlagen: ${insErr?.message}`);
    }

    const rows = outlines.map((o, i) => ({
      presentation_id: presentation.id,
      slide_index: i,
      section: o.section ?? "",
      title: o.title ?? `Folie ${i + 1}`,
      visual_description: o.visualDescription ?? "",
    }));
    const { error: outErr } = await svc.from("slide_outlines").insert(rows);
    if (outErr) {
      throw new HttpError(500, `Outline-Speichern fehlgeschlagen: ${outErr.message}`);
    }

    return json({
      presentationId: presentation.id,
      outlines: rows.map((r) => ({
        slideIndex: r.slide_index,
        section: r.section,
        title: r.title,
        visualDescription: r.visual_description,
      })),
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});
