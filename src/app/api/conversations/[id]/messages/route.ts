import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users, conversations, notifications, providerProfiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getMessagesByConvId, addMessageToStore } from "@/lib/chatStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    // 1. Try DB fetch first
    try {
      const chatMessages = await db
        .select({
          message: messages,
          sender: {
            id: users.id,
            name: users.name,
            avatar: users.avatar,
            role: users.role,
          },
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, id))
        .orderBy(asc(messages.createdAt));

      // If DB returned results, use them; otherwise fall through to chatStore
      if (chatMessages.length > 0) {
        return NextResponse.json({
          success: true,
          data: chatMessages.map((m) => ({
            ...m.message,
            sender: m.sender,
          })),
        });
      }
    } catch (dbErr) {
      console.warn("DB messages fetch error:", dbErr);
    }

    // Fallback: get conversation-specific messages from in-memory chatStore
    const storeMessages = getMessagesByConvId(id);

    return NextResponse.json({
      success: true,
      data: storeMessages,
    });
  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, message: "Content is required" }, { status: 400 });
    }

    let senderId = user?.id;
    if (!senderId) {
      const [defaultUser] = await db.select({ id: users.id }).from(users).limit(1);
      senderId = defaultUser ? defaultUser.id : "usr_cust_1";
    }

    // 1. Save the message and notify the other participant.
    let dbMsg = null;
    try {
      dbMsg = await db.transaction(async (tx) => {
        const [conversation] = await tx
          .select()
          .from(conversations)
          .where(eq(conversations.id, id))
          .limit(1);

        const [inserted] = await tx
          .insert(messages)
          .values({
            conversationId: id,
            senderId,
            content: content.trim(),
          })
          .returning();

        if (!inserted) return null;

        await tx
          .update(conversations)
          .set({
            lastMessageAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, id));

        if (conversation) {
          let recipientId: string | null = null;
          let recipientRole: "CUSTOMER" | "PROVIDER" | null = null;

          if (senderId === conversation.customerId) {
            const [providerProfile] = await tx
              .select({ userId: providerProfiles.userId })
              .from(providerProfiles)
              .where(eq(providerProfiles.id, conversation.providerId))
              .limit(1);
            recipientId = providerProfile?.userId || null;
            recipientRole = "PROVIDER";
          } else {
            const [providerProfile] = await tx
              .select({ userId: providerProfiles.userId })
              .from(providerProfiles)
              .where(eq(providerProfiles.id, conversation.providerId))
              .limit(1);

            if (providerProfile?.userId === senderId) {
              recipientId = conversation.customerId;
              recipientRole = "CUSTOMER";
            }
          }

          if (recipientId && recipientId !== senderId && recipientRole) {
            const [sender] = await tx
              .select({ name: users.name })
              .from(users)
              .where(eq(users.id, senderId))
              .limit(1);
            const preview = content.trim();

            await tx.insert(notifications).values({
              userId: recipientId,
              title: `New message from ${sender?.name || user?.name || "your chat"}`,
              message: preview.length > 120 ? `${preview.slice(0, 117)}...` : preview,
              type: "MESSAGE",
              link: `${recipientRole === "PROVIDER" ? "/provider" : "/dashboard"}/messages?conv=${encodeURIComponent(id)}`,
            });
          }
        }

        return inserted;
      });
    } catch (dbErr) {
      console.error("DB insert message or notification error:", dbErr);
    }

    // 2. Also record in in-memory store for fallback parity
    const storeMsg = addMessageToStore(id, senderId, content.trim(), user || undefined);

    const [senderUser] = await db
      .select({
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, senderId))
      .limit(1);

    const resultMessage = dbMsg
      ? {
          ...dbMsg,
          sender: senderUser || storeMsg.sender,
        }
      : storeMsg;

    return NextResponse.json({
      success: true,
      data: resultMessage,
    });
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 });
  }
}
