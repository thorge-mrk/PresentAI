/**
 * Presentation generation API — now backed by Supabase Edge Functions.
 * The FastAPI backend has been removed; all calls go directly to Supabase.
 */
import { searchImages as edgeSearchImages, searchIcons as edgeSearchIcons } from "@/lib/presentation-api";
import { IconSearch, ImageSearch } from "./params";

export class PresentationGenerationApi {
  // Legacy document upload — no longer supported (FastAPI removed)
  static async uploadDoc(_documents: File[]) {
    throw new Error("Document upload is not supported in the cloud version.");
  }

  static async decomposeDocuments(_paths: string[]) {
    throw new Error("Document decompose is not supported in the cloud version.");
  }

  // Image search via Supabase edge function → Unsplash + Pexels
  static async searchStockImages(imageSearch: ImageSearch) {
    const data = await edgeSearchImages(imageSearch.query, 1, imageSearch.limit || 9);
    return data.images.map((img) => ({
      url: img.url,
      thumb: img.thumb,
      credit: img.credit,
      source: img.source,
    }));
  }

  // Icon search via Supabase edge function → Lucide icon names as strings
  static async searchIcons(iconSearch: IconSearch): Promise<string[]> {
    const data = await edgeSearchIcons(iconSearch.query, iconSearch.limit || 20);
    return data.icons;
  }

  // Kept for backwards compat with any callers — now a no-op that throws clearly
  static async generateImage(_params: any) {
    throw new Error("AI image generation removed. Use searchStockImages instead.");
  }

  static async getPreviousGeneratedImages() {
    return [];
  }

  // Inline slide editing (replaces FastAPI /slide/edit)
  static async editSlide(_slideId: string, _prompt: string) {
    throw new Error("AI slide re-editing not yet implemented in cloud version.");
  }

  // Auto-save: patch slide content in Supabase
  static async updatePresentationContent(_body: any) {
    // No-op in V1: Redux state is the source of truth.
    // For persistence, call updateSlide() from presentation-api.ts directly.
    return { ok: true };
  }

  // Legacy prepare (now handled by approveOutline in usePresentationGeneration hook)
  static async presentationPrepare(_presentationData: any) {
    throw new Error("Use approveOutline() from presentation-api.ts instead.");
  }

  // Legacy create (now handled by generateOutline in UploadPage)
  static async createPresentation(_params: any) {
    throw new Error("Use generateOutline() from presentation-api.ts instead.");
  }
}
