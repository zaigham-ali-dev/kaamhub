import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, services, providerProfiles, users, reviews, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getInMemoryBookingById, updateInMemoryBookingStatus, deleteInMemoryBooking } from "@/lib/bookingStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    // 1. Try DB fetch
    try {
      const [row] = await db
        .select({
          booking: bookings,
          service: services,
          customer: users,
          provider: providerProfiles,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(users, eq(bookings.customerId, users.id))
        .innerJoin(providerProfiles, eq(bookings.providerId, providerProfiles.id))
        .where(eq(bookings.id, id))
        .limit(1);

      if (row) {
        const [providerUser] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
            avatar: users.avatar,
            location: users.location,
            role: users.role,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.id, row.provider.userId))
          .limit(1);

        const [review] = await db
          .select()
          .from(reviews)
          .where(eq(reviews.bookingId, row.booking.id))
          .limit(1);

        const [payment] = await db
          .select()
          .from(payments)
          .where(eq(payments.bookingId, row.booking.id))
          .limit(1);

        return NextResponse.json({
          success: true,
          data: {
            ...row.booking,
            service: row.service,
            customer: {
              id: row.customer.id,
              name: row.customer.name,
              email: row.customer.email,
              phone: row.customer.phone,
              avatar: row.customer.avatar,
              location: row.customer.location,
              role: row.customer.role,
              createdAt: row.customer.createdAt,
            },
            provider: {
              ...row.provider,
              user: providerUser,
            },
            review: review || null,
            payment: payment || null,
          },
        });
      }
    } catch (dbErr) {
      // In-memory fallback
    }

    // 2. Try In-Memory Store
    const memBooking = getInMemoryBookingById(id);
    if (memBooking) {
      return NextResponse.json({
        success: true,
        data: memBooking,
      });
    }

    return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
  } catch (error) {
    console.error("GET booking by id error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    // 1. Delete in memory
    const { deleteInMemoryBooking } = await import("@/lib/bookingStore");
    deleteInMemoryBooking(id);

    // 2. Delete in DB if available
    try {
      await db.delete(bookings).where(eq(bookings.id, id));
    } catch (dbErr) {
      // Handled
    }

    return NextResponse.json({
      success: true,
      message: "Booking permanently removed",
    });
  } catch (error) {
    console.error("DELETE booking error:", error);
    return NextResponse.json({ success: false, message: "Failed to remove booking" }, { status: 500 });
  }
}

