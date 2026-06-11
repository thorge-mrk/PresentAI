import { NextRequest, NextResponse } from "next/server";

/**
 * PDF export: client-side print via window.print().
 * Returns the print-ready URL for the presentation page.
 * The frontend opens this in a new tab and triggers print.
 */
export async function POST(req: NextRequest) {
  const { presentationId } = await req.json();
  if (!presentationId) {
    return NextResponse.json({ error: "Missing presentationId" }, { status: 400 });
  }
  const printUrl = `/presentation?id=${presentationId}&print=true`;
  return NextResponse.json({ method: "client-print", url: printUrl });
}
