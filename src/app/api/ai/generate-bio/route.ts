import { NextResponse } from "next/server";
import { queryOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { profession, experience, skills, location } = await req.json();

    if (!profession) {
      return NextResponse.json({ success: false, message: "Profession is required" }, { status: 400 });
    }

    const aiPrompt = `Generate a warm, highly trustworthy, and professional provider profile bio for a local marketplace in Pakistan:
Profession: ${profession}
Experience: ${experience || "5+ years"}
Skills / Specialties: ${skills || "Customer satisfaction, technical expertise, reliability"}
City / Area: ${location || "Pakistan"}

Keep it concise (2 to 3 sentences), emphasizing punctuality, quality workmanship, and customer trust.`;

    const generated = await queryOpenAI(
      aiPrompt,
      "You are a professional profile writer for KaamHub. Craft confident, trustworthy service provider bios."
    );

    if (generated) {
      return NextResponse.json({
        success: true,
        bio: generated.trim(),
      });
    }

    const fallback = `With over ${experience || "5+ years"} of specialized field experience as a certified ${profession} in ${location || "Karachi"}, I am committed to delivering top-tier craftsmanship and durable solutions. Known for punctuality, attention to detail, and polite customer care, I treat every project with the highest standard of safety and excellence.`;

    return NextResponse.json({
      success: true,
      bio: fallback,
    });
  } catch (error) {
    console.error("Generate bio error:", error);
    return NextResponse.json({ success: false, message: "Failed to generate bio" }, { status: 500 });
  }
}
