import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments, bookings, services, users, providerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [payment] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    const [booking] = await db
      .select({
        booking: bookings,
        service: services,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, payment.bookingId))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        ...payment,
        booking: booking?.booking || null,
        service: booking?.service || null,
      },
    });
  } catch (error) {
    console.error("GET payment error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch payment" }, { status: 500 });
  }
}
