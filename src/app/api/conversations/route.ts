import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages, providerProfiles, users, services } from "@/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getAllConversations, createOrGetConversation } from "@/lib/chatStore";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      // No session — return chatStore fallback data for demo mode
      const fallbackConvs = getAllConversations(undefined, undefined);
      return NextResponse.json({
        success: true,
        data: fallbackConvs,
      });
    }

    try {
      let whereCondition;

      if (user.role === "ADMIN") {
        whereCondition = undefined;
      } else if (user.role === "PROVIDER") {
        const [profile] = await db
          .select()
          .from(providerProfiles)
          .where(eq(providerProfiles.userId, user.id))
          .limit(1);

        if (profile) {
          whereCondition = or(
            eq(conversations.providerId, profile.id),
            eq(conversations.customerId, user.id)
          );
        } else {
          whereCondition = eq(conversations.customerId, user.id);
        }
      } else {
        // CUSTOMER
        whereCondition = eq(conversations.customerId, user.id);
      }

      const convList = await db
        .select()
        .from(conversations)
        .where(whereCondition)
        .orderBy(desc(conversations.updatedAt));

      const fullConversations = await Promise.all(
        convList.map(async (conv) => {
          const [customer] = await db.select().from(users).where(eq(users.id, conv.customerId)).limit(1);
          const [provProfile] = await db
            .select()
            .from(providerProfiles)
            .where(eq(providerProfiles.id, conv.providerId))
            .limit(1);

          let providerUser = null;
          if (provProfile) {
            const [pu] = await db.select().from(users).where(eq(users.id, provProfile.userId)).limit(1);
            providerUser = pu;
          }

          let linkedService = null;
          if (conv.serviceId) {
            const [srv] = await db.select().from(services).where(eq(services.id, conv.serviceId)).limit(1);
            linkedService = srv;
          }

          const [lastMsg] = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conv.id))
            .orderBy(desc(messages.createdAt))
            .limit(1);

          return {
            ...conv,
            customer: customer
              ? { id: customer.id, name: customer.name, email: customer.email, avatar: customer.avatar, role: customer.role }
              : null,
            provider: provProfile && providerUser
              ? {
                  ...provProfile,
                  user: { id: providerUser.id, name: providerUser.name, email: providerUser.email, avatar: providerUser.avatar, role: providerUser.role },
                }
              : null,
            service: linkedService,
            lastMessage: lastMsg || null,
          };
        })
      );

      // If DB returned empty results, merge in chatStore fallback data
      if (fullConversations.length === 0) {
        const fallbackConvs = getAllConversations(user.id, user.role);
        return NextResponse.json({
          success: true,
          data: fallbackConvs,
        });
      }

      return NextResponse.json({
        success: true,
        data: fullConversations,
      });
    } catch (dbErr) {
      console.warn("DB conversations fetch error:", dbErr);
      const fallbackConvs = getAllConversations(user?.id, user?.role);
      return NextResponse.json({ success: true, data: fallbackConvs });
    }
  } catch (error) {
    console.error("GET conversations global error:", error);
    // Even on global error, try chatStore fallback
    const fallbackConvs = getAllConversations(undefined, undefined);
    return NextResponse.json({ success: true, data: fallbackConvs });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const { providerId, serviceId } = await req.json();

    if (!providerId) {
      return NextResponse.json({ success: false, message: "Provider ID is required" }, { status: 400 });
    }

    let customerId = user?.id;
    if (!customerId) {
      const [defaultCust] = await db.select({ id: users.id }).from(users).where(eq(users.role, "CUSTOMER")).limit(1);
      customerId = defaultCust ? defaultCust.id : "usr_cust_1";
    }

    // Resolve real provider_profile.id (in case a user ID was passed)
    let actualProviderProfileId = providerId;
    const [foundProfile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(or(eq(providerProfiles.id, providerId), eq(providerProfiles.userId, providerId)))
      .limit(1);

    if (foundProfile) {
      actualProviderProfileId = foundProfile.id;
    }

    // 1. Try Database insertion/lookup
    try {
      const [existing] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.customerId, customerId),
            eq(conversations.providerId, actualProviderProfileId)
          )
        )
        .limit(1);

      if (existing) {
        return NextResponse.json({ success: true, data: existing });
      }

      const [newConv] = await db
        .insert(conversations)
        .values({
          customerId,
          providerId: actualProviderProfileId,
          serviceId: serviceId || null,
        })
        .returning();

      if (newConv) {
        return NextResponse.json({ success: true, data: newConv });
      }
    } catch (dbErr) {
      console.error("DB create conversation error:", dbErr);
    }

    // 2. Fallback to in-memory store if DB is offline
    const storeConv = createOrGetConversation(customerId, actualProviderProfileId, serviceId, user || undefined);

    return NextResponse.json({
      success: true,
      data: storeConv,
    });
  } catch (error) {
    console.error("POST conversation error:", error);
    return NextResponse.json({ success: false, message: "Failed to start conversation" }, { status: 500 });
  }
}
