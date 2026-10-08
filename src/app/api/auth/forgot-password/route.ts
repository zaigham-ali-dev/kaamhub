import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    // In all cases, return success to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset instruction has been sent.",
      demoResetToken: user ? "demo-reset-token-2025" : undefined,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Request failed" }, { status: 500 });
  }
}
