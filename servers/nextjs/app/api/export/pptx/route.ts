import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

interface SlideData {
  title?: string;
  description?: string;
  body_text?: string;
  speaker_notes?: string;
  image_url?: string;
  slide_index?: number;
  content?: Record<string, unknown>;
}

interface ExportBody {
  title?: string;
  slides: SlideData[];
  theme?: { primary?: string; background?: string };
}

export async function POST(req: NextRequest) {
  try {
    const body: ExportBody = await req.json();
    const { title = "Präsentation", slides, theme } = body;

    if (!slides?.length) {
      return NextResponse.json({ error: "No slides provided" }, { status: 400 });
    }

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.title = title;

    const primaryColor = (theme?.primary || "#7C3AED").replace("#", "");
    const bgColor = (theme?.background || "#FFFFFF").replace("#", "");

    for (const slide of slides) {
      const s = pptx.addSlide();
      s.background = { color: bgColor };

      const slideTitle = slide.title || (slide.content as any)?.title || "";
      const slideBody =
        slide.body_text ||
        (slide.content as any)?.description ||
        (slide.content as any)?.body_text ||
        "";

      // Title
      if (slideTitle) {
        s.addText(slideTitle, {
          x: 0.4,
          y: 0.3,
          w: "90%",
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: primaryColor,
          fontFace: "Calibri",
          wrap: true,
        });
      }

      // Body text
      if (slideBody) {
        const lines = slideBody.split("\n").filter(Boolean);
        const textItems = lines.map((l: string) => ({
          text: l.replace(/^[-•*]\s*/, ""),
          options: { bullet: l.match(/^[-•*]/) ? true : false },
        }));
        s.addText(textItems as any, {
          x: 0.4,
          y: 1.3,
          w: slide.image_url ? "50%" : "90%",
          h: 4.5,
          fontSize: 16,
          color: "333333",
          fontFace: "Calibri",
          valign: "top",
          wrap: true,
        });
      }

      // Image (right side if body exists)
      if (slide.image_url) {
        try {
          s.addImage({
            path: slide.image_url,
            x: slide.body_text ? 5.2 : 1.5,
            y: 1.3,
            w: 4.3,
            h: 4.3,
            sizing: { type: "contain", w: 4.3, h: 4.3 },
          });
        } catch {
          // Image fetch failed — skip gracefully
        }
      }

      // Speaker notes
      if (slide.speaker_notes) {
        s.addNotes(slide.speaker_notes);
      }
    }

    const buffer = Buffer.from((await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title)}.pptx"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
