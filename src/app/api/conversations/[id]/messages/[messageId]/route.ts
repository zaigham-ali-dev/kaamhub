import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { editMessageInStore, deleteMessageFromStore } from "@/lib/chatStore";

// PATCH — Edit a message's content
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id: convId, messageId } = await params;
    const user = await getSessionUser();
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Content is required" },
        { status: 400 }
      );
    }

    // 1. Try DB update
    let updatedMsg = null;
    try {
      const [existing] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (existing) {
        // Only allow sender to edit their own message
        if (user && existing.senderId !== user.id) {
          return NextResponse.json(
            { success: false, message: "You can only edit your own messages" },
            { status: 403 }
          );
        }

        const [updated] = await db
          .update(messages)
          .set({ content: content.trim() })
          .where(eq(messages.id, messageId))
          .returning();

        if (updated) {
          updatedMsg = updated;
        }
      }
    } catch (dbErr) {
      console.error("DB edit message error:", dbErr);
    }

    // 2. Also update in-memory store
    const storeResult = editMessageInStore(convId, messageId, content.trim());

    // Fetch sender info for the response
    let senderInfo = storeResult?.sender || null;
    if (updatedMsg) {
      try {
        const [senderUser] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
            role: users.role,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.id, updatedMsg.senderId))
          .limit(1);
        if (senderUser) senderInfo = { ...senderUser, role: senderUser.role as import("@/lib/types").UserRole };
      } catch { }
    }

    const resultMessage = updatedMsg
      ? { ...updatedMsg, sender: senderInfo }
      : storeResult;

    if (!resultMessage) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resultMessage,
    });
  } catch (error) {
    console.error("PATCH message error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to edit message" },
      { status: 500 }
    );
  }
}

// DELETE — Remove a message
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id: convId, messageId } = await params;
    const user = await getSessionUser();

    // 1. Try DB delete
    let dbDeleted = false;
    try {
      const [existing] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (existing) {
        // Only allow sender to delete their own message
        if (user && existing.senderId !== user.id) {
          return NextResponse.json(
            { success: false, message: "You can only delete your own messages" },
            { status: 403 }
          );
        }

        await db.delete(messages).where(eq(messages.id, messageId));
        dbDeleted = true;
      }
    } catch (dbErr) {
      console.error("DB delete message error:", dbErr);
    }

    // 2. Also remove from in-memory store
    const storeDeleted = deleteMessageFromStore(convId, messageId);

    if (!dbDeleted && !storeDeleted) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    console.error("DELETE message error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete message" },
      { status: 500 }
    );
  }
}


