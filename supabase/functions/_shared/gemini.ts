// Thin wrapper around the Google Gemini REST API.
// Key + model are read from edge-function secrets (the owner sets these).
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ??
  Deno.env.get("GOOGLE_API_KEY") ?? "";
// Default text model: Gemini 3.1 Flash Lite (fast + cheap, good for slides).
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.1-flash-lite";
// Default image model: "Nano Banana 2" (Gemini 3.1 Flash Image).
const IMAGE_MODEL = Deno.env.get("GEMINI_IMAGE_MODEL") ??
  "gemini-3.1-flash-image";

interface GeminiOpts {
  system?: string;
  temperature?: number;
}

export async function geminiJSON<T>(
  prompt: string,
  opts: GeminiOpts = {},
): Promise<T> {
  const text = await geminiText(prompt, opts, true);
  return parseLooseJSON<T>(text);
}

export async function geminiText(
  prompt: string,
  opts: GeminiOpts = {},
  jsonMode = false,
): Promise<string> {
  if (!GEMINI_KEY) {
    throw new Error(
      "GEMINI_API_KEY ist nicht gesetzt. Bitte in den Supabase Edge Function Secrets hinterlegen.",
    );
  }
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: 16384,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini-Fehler (${res.status}): ${detail.slice(0, 400)}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) {
    throw new Error("Gemini lieferte eine leere Antwort.");
  }
  return text;
}

export interface GeneratedImage {
  bytes: Uint8Array;
  mimeType: string;
}

/**
 * Generates an image from a text prompt using the Gemini image model
 * ("Nano Banana"). Returns the raw bytes + mime type so the caller can store
 * them (e.g. in Supabase Storage). Throws on any failure.
 */
export async function geminiImage(prompt: string): Promise<GeneratedImage> {
  if (!GEMINI_KEY) {
    throw new Error(
      "GEMINI_API_KEY ist nicht gesetzt. Bitte in den Supabase Edge Function Secrets hinterlegen.",
    );
  }
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_KEY}`;

  const body = {
    contents: [{
      role: "user",
      parts: [{
        text:
          `Generate a single high-quality, photorealistic 16:9 image for a presentation slide. ${prompt}. No text, no watermarks, no logos.`,
      }],
    }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Gemini-Bildfehler (${res.status}): ${detail.slice(0, 400)}`,
    );
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const inline = p?.inlineData ?? p?.inline_data;
    if (inline?.data) {
      const binary = atob(inline.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return { bytes, mimeType: inline.mimeType ?? inline.mime_type ?? "image/png" };
    }
  }
  throw new Error("Gemini lieferte kein Bild zurück.");
}

// Robust JSON extraction: strips code fences and trims to the outer braces.
export function parseLooseJSON<T>(text: string): T {
  let s = text.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  }
  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  const candidates = [firstObj, firstArr].filter((i) => i >= 0);
  if (candidates.length) {
    s = s.slice(Math.min(...candidates));
  }
  const lastBrace = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (lastBrace >= 0) {
    s = s.slice(0, lastBrace + 1);
  }
  return JSON.parse(s) as T;
}
