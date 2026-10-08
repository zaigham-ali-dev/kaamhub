import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const list = await db
      .select({
        review: reviews,
        customer: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
          location: users.location,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.providerId, id))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json({
      success: true,
      data: list.map((item) => ({
        ...item.review,
        customer: item.customer,
      })),
    });
  } catch (error) {
    console.error("GET provider reviews error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch reviews" }, { status: 500 });
  }
}
