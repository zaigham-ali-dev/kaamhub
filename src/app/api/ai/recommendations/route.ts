import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, providerProfiles, users, categories, favorites, bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();

    let targetLocation = user?.location || "Karachi";
    let preferredCategories: string[] = [];

    if (user) {
      // Check user past bookings or favorites for category preferences
      const userBookings = await db
        .select({ categoryId: services.categoryId })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .where(eq(bookings.customerId, user.id))
        .limit(5);

      preferredCategories = userBookings.map((b) => b.categoryId);
    }

    const allServices = await db
      .select({
        service: services,
        provider: providerProfiles,
        user: users,
        category: categories,
      })
      .from(services)
      .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .innerJoin(categories, eq(services.categoryId, categories.id))
      .where(eq(services.isActive, true))
      .orderBy(desc(providerProfiles.rating))
      .limit(6);

    const formatted = allServices.map((row) => ({
      ...row.service,
      recommendationReason: preferredCategories.includes(row.service.categoryId)
        ? "Based on your recent bookings"
        : row.service.location.toLowerCase().includes(targetLocation.toLowerCase().split(",")[0].trim())
        ? `Popular in your city (${targetLocation.split(",")[0]})`
        : "Top rated across KaamHub",
      provider: {
        ...row.provider,
        user: {
          id: row.user.id,
          name: row.user.name,
          avatar: row.user.avatar,
          location: row.user.location,
        },
      },
      category: row.category,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("AI recommendations error:", error);
    return NextResponse.json({ success: false, message: "Failed to get recommendations" }, { status: 500 });
  }
}
