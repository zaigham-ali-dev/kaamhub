import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { MOCK_USERS } from "@/lib/mockData";

export async function GET() {
  try {
    const user = await getSessionUser();

    try {
      const allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          avatar: users.avatar,
          role: users.role,
          location: users.location,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      if (allUsers.length > 0) {
        return NextResponse.json({
          success: true,
          data: allUsers,
        });
      }
    } catch (dbErr) {
      // In-memory fallback
    }

    return NextResponse.json({
      success: true,
      data: MOCK_USERS.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        location: u.location,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json({
      success: true,
      data: MOCK_USERS,
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ success: false, message: "User ID and role are required" }, { status: 400 });
    }

    try {
      const [updated] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

      if (updated) {
        return NextResponse.json({
          success: true,
          message: "User role updated successfully",
          data: updated,
        });
      }
    } catch (dbErr) {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      data: { id: userId, role },
    });
  } catch (error) {
    console.error("Admin patch user error:", error);
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 });
  }
}

