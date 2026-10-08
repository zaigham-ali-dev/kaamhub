import { NextResponse } from "next/server";
import { queryOpenAI } from "@/lib/openai";
import { db } from "@/db";
import { services, categories, providerProfiles, users } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ success: false, message: "Query text is required" }, { status: 400 });
    }

    const qLower = query.toLowerCase();

    // 1. Determine most relevant category
    let matchedCategorySlug = "home-repair";
    let identifiedProblem = "General Home Maintenance";
    let urgencyLevel = "Normal";

    if (qLower.includes("ac") || qLower.includes("air condition") || qLower.includes("cooling") || qLower.includes("chilling") || qLower.includes("gas")) {
      matchedCategorySlug = "home-repair";
      identifiedProblem = "Air Conditioner Servicing / Refrigerant Issue";
      urgencyLevel = qLower.includes("urgent") || qLower.includes("emergency") || qLower.includes("not cooling") ? "High" : "Medium";
    } else if (qLower.includes("clean") || qLower.includes("scrub") || qLower.includes("sofa") || qLower.includes("dust") || qLower.includes("carpet") || qLower.includes("kitchen")) {
      matchedCategorySlug = "cleaning";
      identifiedProblem = "Deep Cleaning & Sanitization";
    } else if (qLower.includes("electric") || qLower.includes("wire") || qLower.includes("breaker") || qLower.includes("tripping") || qLower.includes("ups") || qLower.includes("solar") || qLower.includes("light")) {
      matchedCategorySlug = "electrical";
      identifiedProblem = "Electrical Wiring & Load Balancing";
      urgencyLevel = "High";
    } else if (qLower.includes("photo") || qLower.includes("wedding") || qLower.includes("event") || qLower.includes("shoot") || qLower.includes("camera") || qLower.includes("video")) {
      matchedCategorySlug = "photography";
      identifiedProblem = "Professional Event Photography / Videography";
    } else if (qLower.includes("tutor") || qLower.includes("math") || qLower.includes("physics") || qLower.includes("exam") || qLower.includes("cambridge") || qLower.includes("study") || qLower.includes("teacher")) {
      matchedCategorySlug = "tutoring";
      identifiedProblem = "Academic Tutoring & Exam Preparation";
    } else if (qLower.includes("pipe") || qLower.includes("leak") || qLower.includes("water") || qLower.includes("plumb") || qLower.includes("tap") || qLower.includes("geyser")) {
      matchedCategorySlug = "home-repair";
      identifiedProblem = "Plumbing Leakage & Sanitary Maintenance";
      urgencyLevel = "High";
    } else if (qLower.includes("makeup") || qLower.includes("hair") || qLower.includes("facial") || qLower.includes("salon") || qLower.includes("beauty")) {
      matchedCategorySlug = "beauty";
      identifiedProblem = "Beauty & Personal Grooming";
    } else if (qLower.includes("web") || qLower.includes("app") || qLower.includes("code") || qLower.includes("site") || qLower.includes("software")) {
      matchedCategorySlug = "technology";
      identifiedProblem = "Software & Web Development";
    }

    // Try AI analysis if key available
    const openAiResponse = await queryOpenAI(
      `Customer query: "${query}". Return a JSON object with: { "categorySlug": string, "identifiedProblem": string, "advice": string, "urgency": string }`,
      "You are the KaamHub AI Diagnostic Assistant. Analyze customer problem description and map it to available service categories (home-repair, cleaning, electrical, photography, tutoring, beauty, technology)."
    );

    let aiAdvice = "Based on your description, we have identified certified local specialists who can resolve this issue promptly.";
    if (openAiResponse) {
      try {
        const parsed = JSON.parse(openAiResponse.replace(/```json/g, "").replace(/```/g, "").trim());
        if (parsed.categorySlug) matchedCategorySlug = parsed.categorySlug;
        if (parsed.identifiedProblem) identifiedProblem = parsed.identifiedProblem;
        if (parsed.advice) aiAdvice = parsed.advice;
        if (parsed.urgency) urgencyLevel = parsed.urgency;
      } catch {
        // fallback to keyword parsed values
      }
    }

    // Find matching category in DB
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, matchedCategorySlug))
      .limit(1);

    // Fetch matched services
    const matchingServices = await db
      .select({
        service: services,
        provider: providerProfiles,
        user: users,
      })
      .from(services)
      .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .where(
        or(
          category ? eq(services.categoryId, category.id) : undefined,
          ilike(services.title, `%${query.slice(0, 15)}%`),
          ilike(services.description, `%${query.slice(0, 15)}%`)
        )!
      )
      .limit(6);

    const formattedServices = matchingServices.map((row) => ({
      ...row.service,
      provider: {
        ...row.provider,
        user: {
          id: row.user.id,
          name: row.user.name,
          avatar: row.user.avatar,
          location: row.user.location,
        },
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        query,
        identifiedCategory: category?.name || "Home Repair & AC",
        categorySlug: matchedCategorySlug,
        identifiedProblem,
        urgencyLevel,
        advice: aiAdvice,
        matchingServices: formattedServices,
      },
    });
  } catch (error) {
    console.error("AI finder error:", error);
    return NextResponse.json({ success: false, message: "AI finder failed" }, { status: 500 });
  }
}
