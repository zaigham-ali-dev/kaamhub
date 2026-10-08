import dotenv from 'dotenv';
dotenv.config();
import { db } from './src/db';
import * as schema from './src/db/schema';
import { eq, desc } from 'drizzle-orm';

async function testMessaging() {
  console.log("=== TESTING MESSAGING SYSTEM ===");

  try {
    const [cust] = await db.select().from(schema.users).where(eq(schema.users.role, "CUSTOMER")).limit(1);
    const [prov] = await db.select().from(schema.providerProfiles).limit(1);
    const [serv] = await db.select().from(schema.services).limit(1);

    console.log("Customer:", cust?.id, "Provider:", prov?.id, "Service:", serv?.id);

    if (!cust || !prov) {
      console.error("Missing customer or provider!");
      process.exit(1);
    }

    // 1. Create conversation
    console.log("\n1. Creating conversation...");
    const [conv] = await db
      .insert(schema.conversations)
      .values({
        customerId: cust.id,
        providerId: prov.id,
        serviceId: serv?.id || null,
      })
      .returning();
    console.log("Created conversation ID:", conv.id);

    // 2. Send message from customer
    console.log("\n2. Sending message from customer...");
    const [msg1] = await db
      .insert(schema.messages)
      .values({
        conversationId: conv.id,
        senderId: cust.id,
        content: "Salam, are you available tomorrow?",
      })
      .returning();
    console.log("Created message 1:", msg1.id, msg1.content);

    // 3. Send message from provider user
    console.log("\n3. Sending message from provider...");
    const [msg2] = await db
      .insert(schema.messages)
      .values({
        conversationId: conv.id,
        senderId: prov.userId,
        content: "Walaikum Assalam, yes I am available!",
      })
      .returning();
    console.log("Created message 2:", msg2.id, msg2.content);

    // 4. Query messages
    console.log("\n4. Querying messages...");
    const msgs = await db
      .select({
        message: schema.messages,
        sender: {
          id: schema.users.id,
          name: schema.users.name,
          avatar: schema.users.avatar,
          role: schema.users.role,
        },
      })
      .from(schema.messages)
      .innerJoin(schema.users, eq(schema.messages.senderId, schema.users.id))
      .where(eq(schema.messages.conversationId, conv.id))
      .orderBy(schema.messages.createdAt);

    console.log("Messages retrieved:", msgs.map(m => `${m.sender.name} (${m.sender.role}): ${m.message.content}`));

    // 5. Query conversations as customer
    const custConvs = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.customerId, cust.id));
    console.log(`\nCustomer has ${custConvs.length} conversations`);

    // 6. Query conversations as provider
    const provConvs = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.providerId, prov.id));
    console.log(`Provider has ${provConvs.length} conversations`);

    // Cleanup
    await db.delete(schema.messages).where(eq(schema.messages.conversationId, conv.id));
    await db.delete(schema.conversations).where(eq(schema.conversations.id, conv.id));
    console.log("\nCleaned up test conversation and messages.");

    console.log("\n✅ ALL MESSAGING DB TESTS PASSED!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Messaging test failed:", err);
    process.exit(1);
  }
}

testMessaging();