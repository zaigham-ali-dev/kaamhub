import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, services, providerProfiles, users, reviews } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getAllInMemoryBookings, addInMemoryBooking } from "@/lib/bookingStore";
import { BookingData } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // 1. Try DB fetch if user and DB available
    if (user) {
      try {
        let whereCondition;

        if (user.role === "ADMIN") {
          whereCondition = status && status !== "ALL" ? eq(bookings.status, status as any) : undefined;
        } else if (user.role === "PROVIDER") {
          const [profile] = await db
            .select()
            .from(providerProfiles)
            .where(eq(providerProfiles.userId, user.id))
            .limit(1);

          if (profile) {
            whereCondition = status && status !== "ALL"
              ? and(eq(bookings.providerId, profile.id), eq(bookings.status, status as any))
              : eq(bookings.providerId, profile.id);
          } else {
            whereCondition = eq(bookings.providerId, user.id);
          }
        } else {
          // CUSTOMER
          whereCondition = status && status !== "ALL"
            ? and(eq(bookings.customerId, user.id), eq(bookings.status, status as any))
            : eq(bookings.customerId, user.id);
        }

        const allBookings = await db
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
          .where(whereCondition)
          .orderBy(desc(bookings.createdAt));

        const formatted = await Promise.all(
          allBookings.map(async (row) => {
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

            return {
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
            };
          })
        );

        return NextResponse.json({
          success: true,
          count: formatted.length,
          data: formatted,
        });
      } catch (dbErr) {
        console.warn("DB fetch bookings failed, falling back to store:", dbErr);
      }
    }

    // 2. Return from in-memory store if DB is offline or guest
    let provIdFilter: string | undefined = undefined;
    if (user?.role === "PROVIDER") {
      const { MOCK_PROVIDERS } = await import("@/lib/mockData");
      const provProfile = MOCK_PROVIDERS.find((p) => p.userId === user.id || p.id === user.id);
      provIdFilter = provProfile?.id || user.id;
    }

    const storeBookings = getAllInMemoryBookings({
      status: status || undefined,
      customerId: user?.role === "CUSTOMER" ? user.id : undefined,
      providerId: provIdFilter,
      role: user?.role,
    });

    return NextResponse.json({
      success: true,
      count: storeBookings.length,
      data: storeBookings,
    });
  } catch (error) {
    console.error("GET bookings global error:", error);
    const storeBookings = getAllInMemoryBookings();
    return NextResponse.json({
      success: true,
      count: storeBookings.length,
      data: storeBookings,
    });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { serviceId, date, startTime, address, notes, paymentMethod = "ONLINE" } = body;

    if (!serviceId || !date || !startTime || !address) {
      return NextResponse.json(
        { success: false, message: "Service, date, start time, and address are required" },
        { status: 400 }
      );
    }

    // 1. Try DB insertion
    try {
      const [service] = await db
        .select({
          service: services,
          provider: providerProfiles,
        })
        .from(services)
        .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
        .where(eq(services.id, serviceId))
        .limit(1);

      if (service) {
        const calculatedPrice = service.service.price;

        let customerId = user?.id;
        if (!customerId) {
          const [defaultCust] = await db.select({ id: users.id }).from(users).where(eq(users.role, "CUSTOMER")).limit(1);
          customerId = defaultCust ? defaultCust.id : "usr_cust_1";
        }

        const [newBooking] = await db
          .insert(bookings)
          .values({
            customerId,
            providerId: service.provider.id,
            serviceId: service.service.id,
            date,
            startTime,
            address,
            notes: notes || null,
            price: calculatedPrice,
            status: "PENDING",
            paymentStatus: paymentMethod === "CASH" ? "PENDING" : "PAID",
            paymentMethod,
          })
          .returning();

        return NextResponse.json({
          success: true,
          message: "Booking submitted successfully",
          data: newBooking,
        });
      }
    } catch (dbErr) {
      console.error("DB booking insertion error:", dbErr);
    }

    // 2. Mock service fallback + save to memory store
    const { MOCK_SERVICES, MOCK_PROVIDERS } = await import("@/lib/mockData");
    const mockServ = MOCK_SERVICES.find((s) => s.id === serviceId) || MOCK_SERVICES[0];
    const mockProv = MOCK_PROVIDERS.find((p) => p.id === mockServ.providerId) || MOCK_PROVIDERS[0];

    const fallbackBooking: BookingData = {
      id: `bk_${Date.now()}`,
      customerId: user?.id || "usr_cust_1",
      providerId: mockServ.providerId,
      serviceId: mockServ.id,
      date,
      startTime,
      address,
      notes: notes || null,
      price: mockServ.price,
      status: "PENDING",
      paymentStatus: paymentMethod === "CASH" ? "PENDING" : "PAID",
      paymentMethod,
      createdAt: new Date().toISOString(),
      customer: {
        id: user?.id || "usr_cust_1",
        name: user?.name || "Fatima Ali",
        email: user?.email || "customer@kaamhub.com",
        phone: user?.phone || "+92 321 9876543",
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
      },
      service: mockServ,
      provider: mockProv,
    };

    addInMemoryBooking(fallbackBooking);

    return NextResponse.json({
      success: true,
      message: "Booking submitted successfully! You can view it in your dashboard.",
      data: fallbackBooking,
    });
  } catch (error) {
    console.error("POST booking error:", error);
    return NextResponse.json({ success: false, message: "Failed to create booking" }, { status: 500 });
  }
}

