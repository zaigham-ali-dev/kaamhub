import { NextResponse } from "next/server";
import { queryOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { notes } = await req.json();

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Notes content required" }, { status: 400 });
    }

    const aiPrompt = `Summarize the following customer service request notes into a crisp, actionable 2-3 bullet point checklist for the service technician/provider:
"${notes}"`;

    const summary = await queryOpenAI(
      aiPrompt,
      "You are a technical job dispatcher summarizing customer instructions for field service technicians."
    );

    if (summary) {
      return NextResponse.json({
        success: true,
        summary: summary.trim(),
      });
    }

    // Heuristic summary
    const cleanLines = notes
      .split(/[.\n]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 5);

    const fallback = cleanLines.slice(0, 3).map((l: string) => `• ${l}`).join("\n");

    return NextResponse.json({
      success: true,
      summary: fallback || `• Customer request: ${notes}`,
    });
  } catch (error) {
    console.error("AI summarize error:", error);
    return NextResponse.json({ success: false, message: "Summarization failed" }, { status: 500 });
  }
}
