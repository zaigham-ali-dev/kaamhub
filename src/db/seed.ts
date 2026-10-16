import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import { MOCK_USERS, MOCK_CATEGORIES, MOCK_PROVIDERS, MOCK_SERVICES } from "../lib/mockData";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: databaseUrl });

const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Starting KaamHub database seeding...");

  // Clear existing data in reverse order of foreign keys
  try {
    await db.delete(schema.adminActions);
    await db.delete(schema.portfolioItems);
    await db.delete(schema.availability);
    await db.delete(schema.favorites);
    await db.delete(schema.payments);
    await db.delete(schema.notifications);
    await db.delete(schema.messages);
    await db.delete(schema.conversations);
    await db.delete(schema.reviews);
    await db.delete(schema.bookings);
    await db.delete(schema.serviceImages);
    await db.delete(schema.services);
    await db.delete(schema.categories);
    await db.delete(schema.providerProfiles);
    await db.delete(schema.users);
    console.log("Cleaned old tables.");
  } catch (err) {
    console.log("Note during cleanup (can be ignored on fresh DB):", err);
  }

  const defaultHash = await bcrypt.hash("password123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);
  const providerHash = await bcrypt.hash("provider123", 10);
  const customerHash = await bcrypt.hash("customer123", 10);

  // 1. Insert Users from MOCK_USERS
  for (const u of MOCK_USERS) {
    let pHash = defaultHash;
    if (u.role === "ADMIN") pHash = adminHash;
    else if (u.role === "PROVIDER") pHash = providerHash;
    else if (u.role === "CUSTOMER") pHash = customerHash;

    await db.insert(schema.users).values({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: pHash,
      phone: u.phone || null,
      avatar: u.avatar || null,
      role: u.role,
      location: u.location || "Karachi",
    }).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${MOCK_USERS.length} Users.`);

  // 2. Insert Categories
  for (const c of MOCK_CATEGORIES) {
    await db.insert(schema.categories).values({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon || "Wrench",
      image: c.image || null,
      isActive: true,
    }).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${MOCK_CATEGORIES.length} Categories.`);

  // 3. Insert Provider Profiles
  for (const p of MOCK_PROVIDERS) {
    await db.insert(schema.providerProfiles).values({
      id: p.id,
      userId: p.userId,
      profession: p.profession,
      bio: p.bio,
      experience: p.experience || "5+ years",
      startingPrice: p.startingPrice || 1500,
      serviceAreas: p.serviceAreas || "Nationwide",
      coverImage: p.coverImage || null,
      verificationStatus: (p.verificationStatus as any) || "VERIFIED",
      rating: p.rating || 4.9,
      totalReviews: p.totalReviews || 50,
      completedJobs: p.completedJobs || 100,
    }).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${MOCK_PROVIDERS.length} Provider Profiles.`);

  // 4. Insert Services
  for (const s of MOCK_SERVICES) {
    await db.insert(schema.services).values({
      id: s.id,
      providerId: s.providerId,
      categoryId: s.categoryId,
      title: s.title,
      slug: s.slug,
      description: s.description,
      price: s.price,
      priceType: (s.priceType as any) || "FIXED",
      duration: s.duration || "2 hours",
      location: s.location || "Karachi",
      coverImage: s.coverImage || null,
      isActive: true,
    }).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${MOCK_SERVICES.length} Services.`);

  console.log("🎉 Database seeding completed successfully!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
