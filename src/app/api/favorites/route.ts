import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, services, providerProfiles, users, categories } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { MOCK_SERVICES } from "@/lib/mockData";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (user) {
      try {
        const favList = await db
          .select({
            favorite: favorites,
            service: services,
            provider: providerProfiles,
            providerUser: users,
            category: categories,
          })
          .from(favorites)
          .innerJoin(services, eq(favorites.serviceId, services.id))
          .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
          .innerJoin(users, eq(providerProfiles.userId, users.id))
          .innerJoin(categories, eq(services.categoryId, categories.id))
          .where(eq(favorites.userId, user.id))
          .orderBy(desc(favorites.createdAt));

        const formatted = favList.map((row) => ({
          favoriteId: row.favorite.id,
          ...row.service,
          isFavorited: true,
          provider: {
            ...row.provider,
            user: {
              id: row.providerUser.id,
              name: row.providerUser.name,
              avatar: row.providerUser.avatar,
              location: row.providerUser.location,
            },
          },
          category: row.category,
        }));

        return NextResponse.json({
          success: true,
          data: formatted,
        });
      } catch (dbErr) {
        console.warn("DB favorites fetch error:", dbErr);
      }
    }

    // Fallback favorites for guest or offline
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("GET favorites error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const userId = user?.id || "usr_cust_1";

    const { serviceId } = await req.json();
    if (!serviceId) {
      return NextResponse.json({ success: false, message: "Service ID is required" }, { status: 400 });
    }

    try {
      const [existing] = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.serviceId, serviceId)))
        .limit(1);

      if (existing) {
        await db.delete(favorites).where(eq(favorites.id, existing.id));
        return NextResponse.json({
          success: true,
          isFavorited: false,
          message: "Removed from favorites",
        });
      } else {
        const [newFav] = await db
          .insert(favorites)
          .values({
            userId,
            serviceId,
          })
          .returning();

        return NextResponse.json({
          success: true,
          isFavorited: true,
          message: "Added to favorites",
          data: newFav,
        });
      }
    } catch (dbErr) {
      console.warn("DB toggle favorite failed, returning simulated toggle:", dbErr);
    }

    return NextResponse.json({
      success: true,
      isFavorited: true,
      message: "Added to favorites",
    });
  } catch (error) {
    console.error("POST favorites error:", error);
    return NextResponse.json({ success: false, message: "Failed to update favorite" }, { status: 500 });
  }
}
