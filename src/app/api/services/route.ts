import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, providerProfiles, categories, users, favorites } from "@/db/schema";
import { eq, and, or, ilike, gte, lte, desc, asc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { MOCK_SERVICES } from "@/lib/mockData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").toLowerCase();
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const sort = searchParams.get("sort") || "latest";
  const providerId = searchParams.get("providerId");

  try {
    const sessionUser = await getSessionUser();

    const conditions = [eq(services.isActive, true)];

    if (providerId) {
      conditions.push(eq(services.providerId, providerId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(services.title, `%${search}%`),
          ilike(services.description, `%${search}%`),
          ilike(services.location, `%${search}%`)
        )!
      );
    }

    if (category) {
      const [cat] = await db
        .select()
        .from(categories)
        .where(or(eq(categories.slug, category), eq(categories.id, category)))
        .limit(1);
      if (cat) {
        conditions.push(eq(services.categoryId, cat.id));
      }
    }

    if (location && location !== "All" && location !== "All Cities") {
      conditions.push(ilike(services.location, `%${location}%`));
    }

    if (minPrice !== null && !isNaN(minPrice)) {
      conditions.push(gte(services.price, minPrice));
    }

    if (maxPrice !== null && !isNaN(maxPrice)) {
      conditions.push(lte(services.price, maxPrice));
    }

    let orderByClause = desc(services.createdAt);
    if (sort === "price_asc") {
      orderByClause = asc(services.price);
    } else if (sort === "price_desc") {
      orderByClause = desc(services.price);
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
      .where(and(...conditions))
      .orderBy(orderByClause);

    let userFavoriteIds = new Set<string>();
    if (sessionUser) {
      try {
        const userFavs = await db
          .select({ serviceId: favorites.serviceId })
          .from(favorites)
          .where(eq(favorites.userId, sessionUser.id));
        userFavoriteIds = new Set(userFavs.map((f) => f.serviceId));
      } catch {}
    }

    const data = allServices.map((row) => ({
      ...row.service,
      isFavorited: userFavoriteIds.has(row.service.id),
      provider: {
        ...row.provider,
        user: {
          id: row.user.id,
          name: row.user.name,
          email: row.user.email,
          avatar: row.user.avatar,
          location: row.user.location,
          role: row.user.role,
        },
      },
      category: row.category,
    }));

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.warn("DB services query failed, falling back to mock catalog:", error);
  }

  // Fallback to mock services
  let filtered = [...MOCK_SERVICES];

  if (providerId) {
    filtered = filtered.filter((s) => s.providerId === providerId);
  }
  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search) ||
        s.location.toLowerCase().includes(search)
    );
  }
  if (category) {
    filtered = filtered.filter(
      (s) => s.category?.slug === category || s.categoryId === category
    );
  }
  if (location && location !== "All" && location !== "All Cities") {
    filtered = filtered.filter((s) => s.location.toLowerCase().includes(location.toLowerCase()));
  }
  if (minPrice !== null && !isNaN(minPrice)) {
    filtered = filtered.filter((s) => s.price >= minPrice);
  }
  if (maxPrice !== null && !isNaN(maxPrice)) {
    filtered = filtered.filter((s) => s.price <= maxPrice);
  }

  if (sort === "price_asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized - please login" }, { status: 401 });
    }

    let [profile] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, user.id))
      .limit(1);

    if (!profile && user.role === "PROVIDER") {
      // Auto-create missing provider profile for registered provider
      const [newProf] = await db
        .insert(providerProfiles)
        .values({
          userId: user.id,
          profession: "Service Professional",
          experience: "2+ years",
          startingPrice: 1500,
          serviceAreas: user.location || "Karachi",
          verificationStatus: "VERIFIED",
        })
        .returning();
      profile = newProf;
    }

    if (!profile && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "You must be a registered provider to publish services" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, categoryId, price, priceType = "FIXED", duration = "1-2 hours", location, coverImage } = body;

    if (!title || !description || !categoryId || !price) {
      return NextResponse.json(
        { success: false, message: "Title, description, category, and price are required" },
        { status: 400 }
      );
    }

    let targetProviderId = profile ? profile.id : body.providerId;
    if (!targetProviderId) {
      const [firstProv] = await db.select().from(providerProfiles).limit(1);
      targetProviderId = firstProv?.id || "prof_1";
    }

    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "service";
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [newService] = await db
      .insert(services)
      .values({
        providerId: targetProviderId,
        categoryId,
        title,
        slug,
        description,
        price: Number(price),
        priceType,
        duration,
        location: location || user.location || "Karachi",
        coverImage: coverImage || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Service published successfully",
      data: newService,
    });
  } catch (error) {
    console.error("POST service error:", error);
    return NextResponse.json({ success: false, message: "Failed to create service in database" }, { status: 500 });
  }
}
