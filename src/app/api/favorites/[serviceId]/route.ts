import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.serviceId, serviceId)));

    return NextResponse.json({
      success: true,
      message: "Favorite removed",
    });
  } catch (error) {
    console.error("DELETE favorite error:", error);
    return NextResponse.json({ success: false, message: "Failed to remove favorite" }, { status: 500 });
  }
}
