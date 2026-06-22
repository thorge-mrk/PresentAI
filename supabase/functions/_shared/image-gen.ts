// Generates an image with Gemini ("Nano Banana") and stores it in the public
// `uploads` Storage bucket, returning a public URL. Falls back to a stock photo
// (Pexels/Unsplash) when AI generation is unavailable, so callers always get a
// usable URL.
import { geminiImage } from "./gemini.ts";
import { serviceClient } from "./clients.ts";
import { firstImage, fallbackImage } from "./images.ts";

const BUCKET = "uploads";

function extFor(mime: string): string {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  return "png";
}

/** Generate an AI image, store it, and return its public URL. */
export async function generateImageUrl(
  prompt: string,
  userId: string,
): Promise<{ url: string; source: "ai" | "stock" }> {
  try {
    const { bytes, mimeType } = await geminiImage(prompt);
    const svc = serviceClient();
    const path = `${userId}/ai/${Date.now()}-${crypto.randomUUID()}.${extFor(mimeType)}`;
    const { error } = await svc.storage.from(BUCKET).upload(path, bytes, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = svc.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, source: "ai" };
  } catch (_e) {
    // Fall back to a stock photo so the editor never ends up with nothing.
    try {
      const { url } = await firstImage(prompt);
      return { url, source: "stock" };
    } catch {
      return { url: fallbackImage(prompt), source: "stock" };
    }
  }
}
