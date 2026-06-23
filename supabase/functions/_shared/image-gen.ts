// Generates an image with Gemini ("Nano Banana") and stores it in the public
// `uploads` Storage bucket, returning a public URL. By default it does NOT use
// stock photos at all (AI-only); on failure it returns a neutral placeholder so
// callers always get a usable URL.
import { geminiImage } from "./gemini.ts";
import { serviceClient } from "./clients.ts";
import { firstImage, fallbackImage } from "./images.ts";

const BUCKET = "uploads";

function extFor(mime: string): string {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  return "png";
}

interface GenerateOptions {
  /** When true, fall back to a stock photo if AI generation fails. Default false. */
  allowStockFallback?: boolean;
}

/** Generate an AI image, store it, and return its public URL. */
export async function generateImageUrl(
  prompt: string,
  userId: string,
  opts: GenerateOptions = {},
): Promise<{ url: string; source: "ai" | "stock" | "placeholder" }> {
  try {
    const { bytes, mimeType } = await geminiImage(prompt);
    const svc = serviceClient();
    const path = `${userId}/ai/${Date.now()}-${crypto.randomUUID()}.${extFor(mimeType)}`;
    const { error } = await svc.storage.from(BUCKET).upload(path, bytes, {
      contentType: mimeType,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = svc.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, source: "ai" };
  } catch (_e) {
    // AI-only by default: never silently pull a stock photo unless asked.
    if (opts.allowStockFallback) {
      try {
        const { url } = await firstImage(prompt);
        return { url, source: "stock" };
      } catch { /* fall through to placeholder */ }
    }
    return { url: fallbackImage(prompt), source: "placeholder" };
  }
}
