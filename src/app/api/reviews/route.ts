import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, bookings, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { addInMemoryReview, getAllInMemoryReviews } from "@/lib/bookingStore";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const { bookingId, rating, comment } = await req.json();

    if (!bookingId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Booking ID, rating (1-5), and comment are required" },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // 1. Try DB insertion
    try {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
      if (booking) {
        const customerId = user?.id || booking.customerId;
        const [inserted] = await db
          .insert(reviews)
          .values({
            bookingId,
            customerId,
            providerId: booking.providerId,
            rating: numRating,
            comment: comment.trim(),
          })
          .returning();

        return NextResponse.json({
          success: true,
          message: "Thank you! Your review has been published.",
          data: inserted,
        });
      }
    } catch (dbErr) {
      console.warn("DB review insertion error:", dbErr);
    }

    // 2. Fallback to memory
    const newReviewData = {
      id: `rev_${Date.now()}`,
      bookingId,
      customerId: user?.id || "usr_cust_1",
      providerId: "prof_1",
      rating: numRating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      customer: {
        id: user?.id || "usr_cust_1",
        name: user?.name || "Fatima Ali",
        email: user?.email || "customer@kaamhub.com",
        role: "CUSTOMER" as const,
        createdAt: new Date().toISOString(),
      },
    };

    addInMemoryReview(newReviewData);

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been published.",
      data: newReviewData,
    });
  } catch (error) {
    console.error("POST review error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit review" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");

    // 1. Try DB first
    try {
      const query = db
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
        .orderBy(desc(reviews.createdAt));

      const list = providerId
        ? await query.where(eq(reviews.providerId, providerId))
        : await query;

      const formatted = list.map((item) => ({
        ...item.review,
        customer: item.customer,
      }));

      return NextResponse.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (dbErr) {
      console.warn("DB reviews query failed, fallback to memory:", dbErr);
    }

    const memReviews = getAllInMemoryReviews(providerId || undefined);

    return NextResponse.json({
      success: true,
      count: memReviews.length,
      data: memReviews,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch reviews" }, { status: 500 });
  }
}


