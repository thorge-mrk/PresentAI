import { ImageAssetResponse } from "./types";
import { searchImages as edgeSearchImages } from "@/lib/presentation-api";

interface StockSearchOptions {
  provider?: string;
  apiKey?: string;
  strictApiKey?: boolean;
}

/**
 * Images API — cloud version. Stock search goes through the Supabase
 * `search-images` edge function (Unsplash + Pexels). Local uploads were a
 * FastAPI filesystem feature and are not available.
 */
export class ImagesApi {
  static async uploadImage(_file: File): Promise<ImageAssetResponse> {
    throw new Error("Image upload is not available in the cloud version. Use stock image search instead.");
  }

  static async getUploadedImages(): Promise<ImageAssetResponse[]> {
    return [];
  }

  static async deleteImage(_image_id: string): Promise<{ success: boolean; message?: string }> {
    return { success: false, message: "Image upload/delete is not available in the cloud version." };
  }

  static async searchStockImages(
    query: string,
    limit: number = 12,
    _options: StockSearchOptions = {}
  ): Promise<string[]> {
    const { images } = await edgeSearchImages(query, 1, limit);
    return images.map((img) => img.url);
  }
}
