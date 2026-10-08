import { NextResponse } from "next/server";
import { db } from "@/db";
import { providerProfiles, users } from "@/db/schema";
import { eq, and, or, ilike, gte, desc } from "drizzle-orm";
import { MOCK_PROVIDERS } from "@/lib/mockData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").toLowerCase();
  const location = searchParams.get("location") || "";
  const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : 0;
  const verifiedOnly = searchParams.get("verified") === "true";

  try {
    const conditions = [];

    if (verifiedOnly) {
      conditions.push(eq(providerProfiles.verificationStatus, "VERIFIED"));
    }

    if (minRating > 0) {
      conditions.push(gte(providerProfiles.rating, minRating));
    }

    if (location && location !== "All" && location !== "All Cities") {
      conditions.push(
        or(
          ilike(users.location, `%${location}%`),
          ilike(providerProfiles.serviceAreas, `%${location}%`)
        )!
      );
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(providerProfiles.profession, `%${search}%`),
          ilike(providerProfiles.bio, `%${search}%`)
        )!
      );
    }

    const providerList = await db
      .select({
        profile: providerProfiles,
        user: users,
      })
      .from(providerProfiles)
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(providerProfiles.rating));

    if (providerList.length > 0) {
      const result = providerList.map((row) => ({
        ...row.profile,
        user: {
          id: row.user.id,
          name: row.user.name,
          email: row.user.email,
          phone: row.user.phone,
          avatar: row.user.avatar,
          location: row.user.location,
          role: row.user.role,
        },
      }));

      return NextResponse.json({
        success: true,
        count: result.length,
        data: result,
      });
    }
  } catch (error) {
    // Fallback to mock providers
  }

  // Fallback to mock data with filters applied
  let filtered = [...MOCK_PROVIDERS];

  if (verifiedOnly) {
    filtered = filtered.filter((p) => p.verificationStatus === "VERIFIED");
  }
  if (minRating > 0) {
    filtered = filtered.filter((p) => (p.rating || 0) >= minRating);
  }
  if (location && location !== "All" && location !== "All Cities") {
    filtered = filtered.filter(
      (p) =>
        p.user?.location?.toLowerCase().includes(location.toLowerCase()) ||
        p.serviceAreas?.toLowerCase().includes(location.toLowerCase())
    );
  }
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(search) ||
        p.profession.toLowerCase().includes(search) ||
        p.bio?.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
}
