/**
 * Dashboard API — backed by Supabase (presentations table + edge functions).
 */
import { supabase } from "@/lib/supabase";
import { getPresentation as edgeGetPresentation } from "@/lib/presentation-api";

export interface PresentationResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  n_slides: number;
  prompt: string;
  thumbnail: string;
  slides: any[];
}

export class DashboardApi {
  static async getPresentations(): Promise<PresentationResponse[]> {
    const { data, error } = await supabase
      .from("presentations")
      .select("id, topic, grade_level, slide_count, status, created_at, updated_at")
      .eq("status", "complete")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching presentations:", error.message);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      title: p.topic,
      created_at: p.created_at,
      updated_at: p.updated_at,
      n_slides: p.slide_count,
      prompt: p.topic,
      thumbnail: "",
      slides: [],
    }));
  }

  static async getPresentation(id: string) {
    const { presentation, slides } = await edgeGetPresentation(id);
    return { presentation, slides };
  }

  static async deletePresentation(presentation_id: string) {
    const { error } = await supabase
      .from("presentations")
      .delete()
      .eq("id", presentation_id);

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: "Presentation deleted" };
  }
}
