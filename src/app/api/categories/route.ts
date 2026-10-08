import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, services } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { MOCK_CATEGORIES } from "@/lib/mockData";

export async function GET() {
  try {
    const list = await db
      .select({
        category: categories,
        serviceCount: sql<number>`count(${services.id})::int`,
      })
      .from(categories)
      .leftJoin(services, eq(categories.id, services.categoryId))
      .where(eq(categories.isActive, true))
      .groupBy(categories.id)
      .orderBy(categories.name);

    if (list.length > 0) {
      const formatted = list.map((item) => ({
        ...item.category,
        serviceCount: item.serviceCount,
      }));

      return NextResponse.json({
        success: true,
        data: formatted,
      });
    }
  } catch (error) {
    // Fallback to mock categories
  }

  return NextResponse.json({
    success: true,
    data: MOCK_CATEGORIES,
  });
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { name, description, icon, image } = await req.json();
    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const [created] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description,
        icon: icon || "Wrench",
        image: image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Category created",
      data: created,
    });
  } catch (error) {
    console.error("POST category error:", error);
    return NextResponse.json({ success: false, message: "Failed to create category" }, { status: 500 });
  }
}
