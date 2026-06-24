// approve-outline
// POST { presentationId }
//  -> for each outline slide, Gemini picks the best-fitting layout from the
//     template catalog and writes content matching that layout's shape; images
//     and icons are then hydrated with real URLs. Returns the full slides.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { json, preflight } from "../_shared/cors.ts";
import { getUser, HttpError, requireAllowed } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/clients.ts";
import { geminiJSON } from "../_shared/gemini.ts";
import { hydrateAllMedia } from "../_shared/media.ts";
import {
  buildCatalogSpec,
  DEFAULT_GROUP,
  groupRoles,
  isKnownGroup,
  normalizeLayoutId,
} from "../_shared/layout-catalog.ts";

interface Body {
  presentationId?: string;
}

interface GenSlide {
  slideIndex: number;
  layoutId: string;
  content: Record<string, unknown>;
  speakerNote?: string;
}

const DENSITY_HINT: Record<string, string> = {
  low: "Halte Texte sehr kurz und prägnant.",
  compact: "Ausgewogene, informative Texte.",
  high: "Ausführliche, erklärende Texte (innerhalb der Zeichenlimits).",
};

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const user = await getUser(req);
    await requireAllowed(user);

    const { presentationId } = (await req.json()) as Body;
    if (!presentationId) throw new HttpError(400, "presentationId fehlt.");

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

    const { data: outlines, error: oErr } = await svc
      .from("slide_outlines")
      .select("*")
      .eq("presentation_id", presentationId)
      .order("slide_index", { ascending: true });
    if (oErr || !outlines?.length) throw new HttpError(400, "Keine Gliederung vorhanden.");

    const density = DENSITY_HINT[presentation.text_density] ?? DENSITY_HINT.compact;
    const research = presentation.research_data?.summary ?? "";

    // Chosen template group decides which layout catalog the model picks from.
    const templateId = (presentation as Record<string, any>).template as
      | string
      | null;
    const groupId = isKnownGroup(templateId) ? (templateId as string) : DEFAULT_GROUP;
    const roles = groupRoles(groupId);

    // Style hint from the chosen theme so the content tone matches the design.
    const theme = presentation.theme as Record<string, any> | null;
    const styleHint = theme
      ? `Designstil: "${theme.name ?? "Custom"}"${
        theme.description ? ` – ${theme.description}` : ""
      }. Passe Tonfall, Bildmotive und Layout-Auswahl an diesen Stil an (z.B. verspielt/farbenfroh für Schüler, seriös für Business).`
      : "";

    const prompt = [
      `Du erstellst die vollständigen Inhalte einer Präsentation zum Thema "${presentation.topic}".`,
      `Zielgruppe: ${presentation.grade_level}. ${density}`,
      styleHint,
      `Antworte in der Sprache des Themas (deutsches Thema => Deutsch).`,
      research ? `\nHintergrundwissen:\n${research}` : ``,
      ``,
      `Du hast einen Katalog an Folien-Layouts (Template "${groupId}"). Wähle für JEDE Folie das`,
      `am besten passende Layout aus DIESEM Katalog und fülle dessen "content" exakt nach der`,
      `angegebenen Form. Kombiniere verschiedene Layouts, damit die Präsentation abwechslungsreich`,
      `und professionell aussieht. Benutze NUR layoutId-Werte aus dem Katalog unten.`,
      `Regeln:`,
      `- Folie 0: nutze "${roles.introId}".`,
      roles.tocId
        ? `- Wenn es mehr als 4 Folien gibt: Folie 1 = "${roles.tocId}".`
        : ``,
      `- Die letzte Folie: Fazit/Zusammenfassung.`,
      `- Metrik-/Diagramm-Layouts NUR bei echten Zahlen/Daten.`,
      `- Bei Bildern: setze NUR "__image_prompt__" (englische Suchanfrage). KEINE URLs erfinden.`,
      `- Bei Icons: setze NUR "__icon_query__" (englische Suchanfrage). KEINE URLs erfinden.`,
      `- Halte dich strikt an die Zeichenlimits der Felder.`,
      ``,
      `LAYOUT-KATALOG:`,
      buildCatalogSpec(groupId),
      ``,
      `GLIEDERUNG (${outlines.length} Folien):`,
      ...outlines.map(
        (o) =>
          `- Folie ${o.slide_index}: [${o.section}] ${o.title} | Bildmotiv: ${o.visual_description}`,
      ),
      ``,
      `Gib NUR valides JSON zurück:`,
      `{ "slides": [ { "slideIndex": 0, "layoutId": "${roles.introId}", "content": { ... }, "speakerNote": "1-3 Sätze Sprechnotiz" } ] }`,
      `Das Array muss genau ${outlines.length} Folien in der richtigen Reihenfolge enthalten.`,
    ].filter(Boolean).join("\n");

    const result = await geminiJSON<{ slides: GenSlide[] }>(prompt, {
      temperature: 0.7,
    });

    const gen = result.slides ?? [];
    const byIndex = new Map<number, GenSlide>();
    for (const s of gen) byIndex.set(s.slideIndex, s);

    // First pass: resolve each slide's layout + content shape.
    const prepared = outlines.map((o) => {
      const g = byIndex.get(o.slide_index);
      const layout = normalizeLayoutId(g?.layoutId, groupId);
      const content = (g?.content && typeof g.content === "object")
        ? g.content
        : { title: o.title, description: o.visual_description };
      return { o, g, layout, content };
    });

    // Generate every slide's images (AI, no stock) across the whole deck with a
    // shared concurrency budget — much faster than slide-by-slide.
    await hydrateAllMedia(prepared.map((p) => p.content), user.id);

    // Second pass: build slide rows in outline order.
    const slideRows: Record<string, unknown>[] = prepared.map(
      ({ o, g, layout, content }) => {
        const c = content as Record<string, unknown>;
        const title = (c.title as string) ?? (c.heading as string) ?? o.title;
        const bodyText = (c.description as string) ?? null;
        const imageUrl = findFirstImageUrl(content);

        return {
          presentation_id: presentationId,
          slide_index: o.slide_index,
          title,
          body_text: bodyText,
          speaker_notes: g?.speakerNote ?? "",
          image_url: imageUrl,
          image_credit: null,
          icon_name: null,
          layout_group: groupId,
          layout,
          content,
        };
      },
    );

    // Replace any previous slides for idempotency, then insert fresh ones.
    await svc.from("slides").delete().eq("presentation_id", presentationId);
    const { data: inserted, error: sErr } = await svc
      .from("slides")
      .insert(slideRows)
      .select();
    if (sErr) throw new HttpError(500, `Folien-Speichern fehlgeschlagen: ${sErr.message}`);

    await svc
      .from("presentations")
      .update({ status: "completed" })
      .eq("id", presentationId);

    const sorted = (inserted ?? []).sort(
      (a, b) => a.slide_index - b.slide_index,
    );

    return json({
      presentationId,
      presentation: { ...presentation, status: "completed" },
      slides: sorted,
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    return json({ error: (err as Error).message }, status);
  }
});

function findFirstImageUrl(content: unknown): string | null {
  let found: string | null = null;
  const walk = (v: unknown) => {
    if (found) return;
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o.__image_url__ === "string" && !found) {
        found = o.__image_url__;
        return;
      }
      Object.values(o).forEach(walk);
    }
  };
  walk(content);
  return found;
}
