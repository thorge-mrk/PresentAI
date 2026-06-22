/**
 * Dashboard API — backed by Supabase.
 * - list/delete go directly to the RLS-protected `presentations` table
 * - get uses the get-presentation edge function and returns the Redux
 *   PresentationData shape expected by the viewer/editor.
 */
import { supabase } from "@/lib/supabase";
import {
  getPresentation as edgeGetPresentation,
  slidesToPresentationData,
} from "@/lib/presentation-api";

export interface PresentationResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  data: any | null;
  file: string;
  n_slides: number;
  prompt: string;
  summary: string | null;
  theme: Record<string, any> | null;
  titles: string[];
  user_id: string;
  vector_store: any;
  thumbnail: string;
  slides: any[];
}

export class DashboardApi {
  static async getPresentations(): Promise<PresentationResponse[]> {
    const { data, error } = await supabase
      .from("presentations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching presentations:", error);
      throw new Error(error.message);
    }

    return (data ?? []).map((p) => ({
      id: p.id,
      title: p.topic,
      created_at: p.created_at,
      updated_at: p.created_at,
      data: null,
      file: "",
      n_slides: p.slide_count ?? 0,
      prompt: p.topic,
      summary: p.research_data?.summary ?? null,
      theme: null,
      titles: [],
      user_id: p.user_id,
      vector_store: null,
      thumbnail: "",
      slides: [],
    }));
  }

  static async getPresentation(id: string) {
    const { presentation, slides } = await edgeGetPresentation(id);
    // Returns the PresentationData shape consumed by setPresentationData().
    return slidesToPresentationData(presentation, slides);
  }

  static async deletePresentation(presentation_id: string) {
    const { error } = await supabase
      .from("presentations")
      .delete()
      .eq("id", presentation_id);

    if (error) {
      console.error("Error deleting presentation:", error);
      return {
        success: false,
        message: error.message || "Failed to delete presentation",
      };
    }
    return { success: true, message: "Presentation deleted" };
  }
}
