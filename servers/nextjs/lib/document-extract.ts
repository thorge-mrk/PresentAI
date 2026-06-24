"use client";

/**
 * Client-side extraction of plain text from user-uploaded source documents.
 * The extracted text is sent to the generate-outline edge function as
 * `documentContext` so the AI grounds the presentation in the user's material.
 *
 * Supported: PDF (pdfjs-dist) and text formats (txt, md, csv, tsv, json,
 * html, xml, rtf). Heavy binary formats (docx, pptx) are not parsed here.
 */

export const MAX_CONTEXT_CHARS = 16000;

const TEXT_EXT = /\.(txt|md|markdown|csv|tsv|json|html?|xml|rtf|log)$/i;

export function isSupportedDocument(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    name.endsWith(".pdf") ||
    file.type.startsWith("text/") ||
    TEXT_EXT.test(name)
  );
}

function stripHtml(s: string): string {
  if (!/<[a-z!/]/i.test(s)) return s;
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractPdf(file: File): Promise<string> {
  // Dynamic import keeps pdfjs out of the main bundle; the worker is loaded
  // from a CDN matching the installed version (no bundler worker plumbing).
  const pdfjs: any = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const pageCount = Math.min(doc.numPages, 40);
  let out = "";
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ") + "\n";
    if (out.length > MAX_CONTEXT_CHARS) break;
  }
  return out.trim();
}

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return extractPdf(file);
  }
  if (file.type.startsWith("text/") || TEXT_EXT.test(name)) {
    return stripHtml(await file.text());
  }
  throw new Error(`Nicht unterstützt: ${file.name}`);
}

export interface ExtractionResult {
  text: string;
  names: string[];
  errors: string[];
}

/** Extract and concatenate text from several files, capped at MAX_CONTEXT_CHARS. */
export async function extractDocuments(files: File[]): Promise<ExtractionResult> {
  const names: string[] = [];
  const errors: string[] = [];
  const parts: string[] = [];
  for (const f of files) {
    try {
      const t = (await extractTextFromFile(f)).trim();
      if (t) {
        parts.push(`### Quelle: ${f.name}\n${t}`);
        names.push(f.name);
      } else {
        errors.push(`Kein Text gefunden in ${f.name}`);
      }
    } catch (e: any) {
      errors.push(e?.message || `Fehler bei ${f.name}`);
    }
  }
  let text = parts.join("\n\n");
  if (text.length > MAX_CONTEXT_CHARS) {
    text = text.slice(0, MAX_CONTEXT_CHARS) + "\n…(gekürzt)";
  }
  return { text, names, errors };
}
