"use client";
// Pixel-perfect ("1:1") client-side export.
//
// Instead of re-typing slide text into a generic deck, we capture each rendered
// slide exactly as the user sees it (the real template + theme) to a high-res
// PNG, then assemble those images into a PPTX (full-bleed, one image per slide)
// or a print-ready PDF. This guarantees the export matches the on-screen design.
import html2canvas from "html2canvas";

const DESIGN_W = 1280; // logical slide width used for capture scaling

/** Capture each slide element (#slide-<index>) to a PNG data URL, in order. */
export async function captureSlides(indices: number[]): Promise<string[]> {
  const images: string[] = [];
  for (const idx of indices) {
    const host = document.getElementById(`slide-${idx}`);
    if (!host) continue;
    // Capture the unscaled 1280x720 design stage for a clean, full-resolution
    // render (avoids the CSS transform scale used for on-screen fitting).
    const target =
      (host.querySelector(".slide-edit-stage") as HTMLElement) ||
      (host.querySelector("[data-layout]") as HTMLElement) ||
      host;

    const canvas = await html2canvas(target, {
      scale: 2,
      width: DESIGN_W,
      height: 720,
      windowWidth: DESIGN_W,
      windowHeight: 720,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
    });
    images.push(canvas.toDataURL("image/png"));
  }
  return images;
}

/** Build and download a 1:1 PPTX from the rendered slides. */
export async function exportPptxFromDom(
  indices: number[],
  fileName: string,
): Promise<void> {
  const images = await captureSlides(indices);
  if (!images.length) throw new Error("Keine Folien zum Exportieren gefunden.");

  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "PRESENT_16x9", width: 13.333, height: 7.5 });
  pptx.layout = "PRESENT_16x9";
  pptx.title = fileName.replace(/\.pptx$/i, "");

  for (const data of images) {
    const slide = pptx.addSlide();
    // Full-bleed image so the slide is an exact picture of the design.
    slide.addImage({ data, x: 0, y: 0, w: 13.333, h: 7.5 });
  }

  await pptx.writeFile({ fileName });
}

/** Open a print-ready window with one full-page image per slide (1:1 PDF). */
export async function exportPdfFromDom(
  indices: number[],
  title: string,
): Promise<void> {
  const images = await captureSlides(indices);
  if (!images.length) throw new Error("Keine Folien zum Exportieren gefunden.");

  const win = window.open("", "_blank");
  if (!win) throw new Error("Popup blockiert. Bitte Popups erlauben.");

  const body = images
    .map((src) => `<div class="page"><img src="${src}" /></div>`)
    .join("");

  win.document.write(`<!doctype html><html><head><meta charset="utf-8" />
<title>${title}</title>
<style>
  @page { size: 1280px 720px; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #fff; }
  .page { width: 1280px; height: 720px; page-break-after: always; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .page:last-child { page-break-after: auto; }
  .page img { width: 100%; height: 100%; object-fit: contain; display: block; }
</style></head><body>${body}
<script>
  window.onload = () => { setTimeout(() => { window.focus(); window.print(); }, 300); };
</script>
</body></html>`);
  win.document.close();
}
