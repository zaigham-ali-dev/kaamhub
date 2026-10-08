import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ success: false, message: "Valid email and new password (min 6 chars) are required" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, message: "Account not found" }, { status: 404 });
    }

    const newHash = await hashPassword(password);
    await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Reset failed" }, { status: 500 });
  }
}
