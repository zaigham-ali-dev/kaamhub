import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { providerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MOCK_PROVIDERS } from "@/lib/mockData";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          user: null,
          providerProfile: null,
        },
      });
    }

    let providerProfile = null;
    if (user.role === "PROVIDER") {
      try {
        const [profile] = await db
          .select()
          .from(providerProfiles)
          .where(eq(providerProfiles.userId, user.id))
          .limit(1);
        providerProfile = profile || null;
      } catch (dbErr) {
        console.warn("DB providerProfile lookup failed, using mock fallback:", dbErr);
      }

      if (!providerProfile) {
        providerProfile =
          MOCK_PROVIDERS.find((p) => p.userId === user.id || p.id === user.id) ||
          MOCK_PROVIDERS[0];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        providerProfile,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({
      success: true,
      data: {
        user: null,
        providerProfile: null,
      },
    });
  }
}
