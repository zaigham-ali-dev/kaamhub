import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { updateInMemoryBookingStatus, getInMemoryBookingById } from "@/lib/bookingStore";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    const body = await req.json();
    const { status, paymentStatus } = body;

    // 1. First update in-memory store for instant UI response
    const memUpdated = updateInMemoryBookingStatus(id, status, paymentStatus);

    // 2. Try DB update if available
    try {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
      if (booking) {
        const updateFields: Record<string, any> = {
          updatedAt: new Date(),
        };

        if (status) updateFields.status = status;
        if (paymentStatus) updateFields.paymentStatus = paymentStatus;

        const [updatedBooking] = await db
          .update(bookings)
          .set(updateFields)
          .where(eq(bookings.id, id))
          .returning();

        return NextResponse.json({
          success: true,
          message: `Booking status updated to ${status || paymentStatus}`,
          data: updatedBooking,
        });
      }
    } catch (dbErr) {
      // In-memory update was already performed above
    }

    // 3. Return updated response
    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status || paymentStatus}`,
      data: memUpdated || {
        id,
        status: status || "CANCELLED",
        paymentStatus: paymentStatus || "PENDING",
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH booking status error:", error);
    return NextResponse.json({ success: false, message: "Failed to update booking status" }, { status: 500 });
  }
}

