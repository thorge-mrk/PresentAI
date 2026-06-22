/**
 * Images API — backed by Supabase Storage (uploads) + the search-images edge
 * function (Pexels/Unsplash). The FastAPI image service has been removed.
 */
import { ImageAssetResponse } from "./types";
import { supabase } from "@/lib/supabase";
import { searchImages as edgeSearchImages } from "@/lib/presentation-api";

const BUCKET = "uploads";

interface StockSearchOptions {
  provider?: string;
  apiKey?: string;
  strictApiKey?: boolean;
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export class ImagesApi {
  static async uploadImage(file: File): Promise<ImageAssetResponse> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Bitte zuerst anmelden, um Bilder hochzuladen.");

    const path = `${user.id}/${Date.now()}-${sanitize(file.name)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return {
      message: "uploaded",
      path: data.publicUrl,
      file_url: data.publicUrl,
      id: path,
    };
  }

  static async getUploadedImages(): Promise<ImageAssetResponse[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(user.id, { sortBy: { column: "created_at", order: "desc" } });
    if (error || !data) return [];

    return data
      .filter((f) => f.id) // skip folders
      .map((f) => {
        const path = `${user.id}/${f.name}`;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return {
          message: "ok",
          path: pub.publicUrl,
          file_url: pub.publicUrl,
          id: path,
        };
      });
  }

  static async deleteImage(
    image_id: string
  ): Promise<{ success: boolean; message?: string }> {
    // image_id is the storage path returned by uploadImage().
    const { error } = await supabase.storage.from(BUCKET).remove([image_id]);
    if (error) return { success: false, message: error.message };
    return { success: true };
  }

  static async searchStockImages(
    query: string,
    limit: number = 12,
    _options: StockSearchOptions = {}
  ): Promise<string[]> {
    const data = await edgeSearchImages(query, 1, limit);
    return data.images.map((img) => img.url);
  }
}
