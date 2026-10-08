import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    const [count] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    return NextResponse.json({
      success: true,
      message: `Database is populated with ${count.count} users.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Database query error" }, { status: 500 });
  }
}
