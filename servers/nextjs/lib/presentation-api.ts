/**
 * Typed wrappers around Supabase Edge Functions.
 * Both the Next.js web app and Flutter call these same endpoints.
 */
import { callEdgeFunction } from "./supabase";

export interface PresentationRequest {
  topic: string;
  gradeLevel: string;
  textDensity: "low" | "compact" | "high";
  slideCount: number;
}

export interface SlideOutline {
  slideIndex: number;
  section: string;
  title: string;
  visualDescription: string;
}

export interface PresentationSlide {
  id: string;
  presentation_id: string;
  slide_index: number;
  title: string | null;
  body_text: string | null;
  speaker_notes: string | null;
  image_url: string | null;
  image_credit: string | null;
  icon_name: string | null;
  layout_group: string;
  layout: string;
  content: Record<string, unknown>;
}

export interface PresentationRecord {
  id: string;
  topic: string;
  grade_level: string;
  text_density: string;
  slide_count: number;
  status: string;
  research_data: { summary: string } | null;
  created_at: string;
}

export interface ImageResult {
  id: string;
  url: string;
  thumb: string;
  credit: string;
  source: "unsplash" | "pexels";
}

// Step 1+2+3 combined: research, create DB record, generate and store outline
export async function generateOutline(req: PresentationRequest): Promise<{
  presentationId: string;
  outlines: SlideOutline[];
}> {
  return callEdgeFunction("generate-outline", { body: req });
}

// Step 3 → 4+5: approve outline, generate full content + images, return slides
export async function approveOutline(presentationId: string): Promise<{
  presentationId: string;
  presentation: PresentationRecord;
  slides: PresentationSlide[];
}> {
  return callEdgeFunction("approve-outline", { body: { presentationId } });
}

// Load a saved presentation with outlines + slides
export async function getPresentation(presentationId: string): Promise<{
  presentation: PresentationRecord;
  outlines: SlideOutline[];
  slides: PresentationSlide[];
}> {
  return callEdgeFunction("get-presentation", {
    method: "GET",
    params: { id: presentationId },
  });
}

// Inline editing: patch a single slide
export async function updateSlide(
  slideId: string,
  updates: Partial<Pick<PresentationSlide, "title" | "body_text" | "speaker_notes" | "image_url" | "icon_name" | "content">>
): Promise<{ slide: PresentationSlide }> {
  return callEdgeFunction("update-slide", { method: "PATCH", body: { slideId, updates } });
}

// Persist edited slides back to the DB (autosave from the editor)
export async function savePresentation(
  presentationId: string,
  slides: Array<{
    id: string;
    index?: number;
    slide_index?: number;
    content?: Record<string, unknown>;
    title?: string | null;
    speaker_note?: string | null;
    speaker_notes?: string | null;
    layout?: string | null;
    layout_group?: string | null;
  }>
): Promise<{ ok: boolean; count: number }> {
  return callEdgeFunction("save-presentation", {
    body: { presentationId, slides },
  });
}

// Image search via Unsplash + Pexels
export async function searchImages(
  query: string,
  page = 1,
  perPage = 9
): Promise<{ images: ImageResult[] }> {
  return callEdgeFunction("search-images", {
    method: "GET",
    params: { q: query, page: String(page), per_page: String(perPage) },
  });
}

// Icon search (returns Lucide icon names)
export async function searchIcons(
  query: string,
  limit = 20
): Promise<{ icons: string[] }> {
  return callEdgeFunction("search-icons", {
    method: "GET",
    params: { q: query, limit: String(limit) },
  });
}

/** Convert Supabase slides → PresentationData format expected by Redux */
export function slidesToPresentationData(
  presentation: PresentationRecord,
  slides: PresentationSlide[]
) {
  return {
    id: presentation.id,
    language: "auto",
    layout: { name: "general", ordered: false, slides: [] },
    n_slides: slides.length,
    title: presentation.topic,
    theme: null,
    slides: slides.map((s) => ({
      id: s.id,
      index: s.slide_index,
      layout: s.layout,
      layout_group: s.layout_group,
      speaker_note: s.speaker_notes || "",
      properties: {},
      content: s.content || { title: s.title, description: s.body_text },
    })),
  };
}
