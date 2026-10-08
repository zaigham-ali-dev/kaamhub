import { NextResponse } from "next/server";
import { queryOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { title, category, price, keyPoints } = await req.json();

    if (!title) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    const aiPrompt = `Generate a compelling, professional, and trustworthy marketplace service description for:
Service Title: ${title}
Category: ${category || "General Services"}
Price: PKR ${price || "Market rate"}
Key Points / Details: ${keyPoints || "High quality service, customer satisfaction guarantee, verified professional"}.

Create a description with:
1. An engaging overview hook
2. Key features included (bullet points)
3. Quality & warranty guarantee statement
Keep it between 120 and 200 words.`;

    const generated = await queryOpenAI(
      aiPrompt,
      "You are a professional copywriting assistant for KaamHub marketplace. Write polished, trustworthy service descriptions."
    );

    if (generated) {
      return NextResponse.json({
        success: true,
        description: generated.trim(),
      });
    }

    // High quality intelligent fallback template
    const fallback = `Experience premium, reliable ${title} delivered by certified industry professionals. 

Our complete service package includes:
• Comprehensive inspection and precision diagnostics
• Commercial-grade tools and genuine manufacturer-approved components
• Strict adherence to safety protocols and spotless cleanup after work
• Transparent pricing with zero hidden surcharges
• 100% Satisfaction Guarantee with a 30-day post-service warranty

Whether you need routine maintenance or emergency resolution, we ensure your job is completed promptly with lasting durability.`;

    return NextResponse.json({
      success: true,
      description: fallback,
    });
  } catch (error) {
    console.error("Generate description error:", error);
    return NextResponse.json({ success: false, message: "Failed to generate description" }, { status: 500 });
  }
}
