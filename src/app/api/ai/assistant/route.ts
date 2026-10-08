import { NextResponse } from "next/server";
import { queryOpenAI } from "@/lib/openai";
import { db } from "@/db";
import { services, providerProfiles, users, categories } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { MOCK_SERVICES } from "@/lib/mockData";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ success: false, message: "Prompt is required" }, { status: 400 });
    }

    const pLower = prompt.toLowerCase();

    // Default extracted details
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    let extractedDate = tomorrowStr;
    let extractedTime = "11:00 AM";
    let extractedServiceType = "Cleaning & Maintenance";
    let extractedLocation = "Karachi";
    let categorySlug = "cleaning";

    // Date parsing
    if (pLower.includes("today")) {
      extractedDate = new Date().toISOString().split("T")[0];
    } else if (pLower.includes("day after tomorrow")) {
      const dat = new Date();
      dat.setDate(dat.getDate() + 2);
      extractedDate = dat.toISOString().split("T")[0];
    } else if (pLower.includes("weekend") || pLower.includes("sunday")) {
      const d = new Date();
      d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
      extractedDate = d.toISOString().split("T")[0];
    }

    // Time parsing
    if (pLower.includes("morning") || pLower.includes("9am") || pLower.includes("10am")) {
      extractedTime = "10:00 AM";
    } else if (pLower.includes("afternoon") || pLower.includes("2pm") || pLower.includes("3pm") || pLower.includes("12pm")) {
      extractedTime = "02:00 PM";
    } else if (pLower.includes("evening") || pLower.includes("5pm") || pLower.includes("6pm")) {
      extractedTime = "05:00 PM";
    }

    // Location parsing
    if (pLower.includes("lahore")) {
      extractedLocation = "Lahore";
    } else if (pLower.includes("islamabad") || pLower.includes("rawalpindi")) {
      extractedLocation = "Islamabad";
    } else if (pLower.includes("karachi")) {
      extractedLocation = "Karachi";
    }

    // Service Type & Category
    if (pLower.includes("ac") || pLower.includes("air condition") || pLower.includes("cool")) {
      categorySlug = "home-repair";
      extractedServiceType = "AC Servicing & Gas Refill";
    } else if (pLower.includes("electric") || pLower.includes("wire") || pLower.includes("light") || pLower.includes("solar")) {
      categorySlug = "electrical";
      extractedServiceType = "Electrical Repair & Wiring";
    } else if (pLower.includes("plumb") || pLower.includes("leak") || pLower.includes("tap") || pLower.includes("geyser")) {
      categorySlug = "home-repair";
      extractedServiceType = "Plumbing Leakage & Pipe Fitment";
    } else if (pLower.includes("photo") || pLower.includes("shoot") || pLower.includes("wedding")) {
      categorySlug = "photography";
      extractedServiceType = "Event & Portrait Photography";
    } else if (pLower.includes("tutor") || pLower.includes("math") || pLower.includes("study") || pLower.includes("exam")) {
      categorySlug = "tutoring";
      extractedServiceType = "Private Academic Tutoring";
    }

    // Try OpenAI extraction if key exists
    const aiResult = await queryOpenAI(
      `Extract structured booking parameters from user prompt: "${prompt}". Return JSON: { "serviceType": string, "categorySlug": string, "date": string, "time": string, "location": string, "summary": string }`,
      "You are the KaamHub AI Booking Assistant. Extract service booking intent into structured JSON."
    );

    let summaryText = `I've prepared a booking for ${extractedServiceType} on ${extractedDate} around ${extractedTime} in ${extractedLocation}. Here are top verified specialists:`;

    if (aiResult) {
      try {
        const parsed = JSON.parse(aiResult.replace(/```json/g, "").replace(/```/g, "").trim());
        if (parsed.serviceType) extractedServiceType = parsed.serviceType;
        if (parsed.categorySlug) categorySlug = parsed.categorySlug;
        if (parsed.date) extractedDate = parsed.date;
        if (parsed.time) extractedTime = parsed.time;
        if (parsed.location) extractedLocation = parsed.location;
        if (parsed.summary) summaryText = parsed.summary;
      } catch {}
    }

    // Fetch matched services from DB or fallback
    let matchedServices: any[] = [];
    try {
      const [category] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);

      const matches = await db
        .select({
          service: services,
          provider: providerProfiles,
          user: users,
        })
        .from(services)
        .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
        .innerJoin(users, eq(providerProfiles.userId, users.id))
        .where(
          and(
            category ? eq(services.categoryId, category.id) : undefined,
            extractedLocation ? ilike(services.location, `%${extractedLocation}%`) : undefined
          )
        )
        .limit(4);

      if (matches.length > 0) {
        matchedServices = matches.map((m) => ({
          ...m.service,
          provider: {
            ...m.provider,
            user: {
              id: m.user.id,
              name: m.user.name,
              avatar: m.user.avatar,
              location: m.user.location,
            },
          },
        }));
      }
    } catch (dbErr) {
      console.warn("DB match in AI assistant failed, using mock services fallback:", dbErr);
    }

    if (matchedServices.length === 0) {
      matchedServices = MOCK_SERVICES.filter(
        (s) =>
          s.category?.slug === categorySlug ||
          s.location.toLowerCase().includes(extractedLocation.toLowerCase())
      ).slice(0, 4);

      if (matchedServices.length === 0) {
        matchedServices = MOCK_SERVICES.slice(0, 3);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        extracted: {
          serviceType: extractedServiceType,
          date: extractedDate,
          time: extractedTime,
          location: extractedLocation,
          categorySlug,
        },
        message: summaryText,
        services: matchedServices,
      },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return NextResponse.json({ success: false, message: "AI assistant failed" }, { status: 500 });
  }
}
