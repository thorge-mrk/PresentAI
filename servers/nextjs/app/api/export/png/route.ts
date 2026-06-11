import { NextRequest, NextResponse } from "next/server";

/**
 * PNG export: client-side via html2canvas (already in package.json).
 * This route simply confirms the method so the frontend knows to use client-side export.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json({ method: "client-html2canvas" });
}
