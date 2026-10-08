import { pgTable, text, timestamp, boolean, integer, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users table
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  role: text("role").notNull().default("CUSTOMER"), // CUSTOMER, PROVIDER, ADMIN
  location: text("location"), // e.g. Karachi, Lahore, Islamabad
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Provider Profiles table
export const providerProfiles = pgTable("provider_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  profession: text("profession").notNull(),
  bio: text("bio"),
  experience: text("experience"), // e.g. "5+ years"
  startingPrice: integer("starting_price").default(1500), // PKR
  serviceAreas: text("service_areas"), // e.g. "DHA, Clifton, Gulshan"
  coverImage: text("cover_image"),
  verificationStatus: text("verification_status").notNull().default("PENDING"), // PENDING, VERIFIED, REJECTED
  rating: doublePrecision("rating").default(0),
  totalReviews: integer("total_reviews").default(0),
  completedJobs: integer("completed_jobs").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Categories table
export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // Lucide icon name or emoji
  image: text("image"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Services table
export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerId: text("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in PKR
  priceType: text("price_type").notNull().default("FIXED"), // FIXED, HOURLY, STARTING_FROM
  duration: text("duration").default("1-2 hours"),
  location: text("location").notNull(), // Karachi, Lahore, Islamabad, or All areas
  coverImage: text("cover_image"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Service Images table
export const serviceImages = pgTable("service_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  publicId: text("public_id"),
});

// 6. Bookings table
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD




  startTime: text("start_time").notNull(), // e.g. "10:00 AM"
  endTime: text("end_time"), // e.g. "12:00 PM"
  address: text("address").notNull(),
  notes: text("notes"),
  price: integer("price").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED
  paymentStatus: text("payment_status").notNull().default("PENDING"), // PENDING, PAID, REFUNDED
  paymentMethod: text("payment_method").default("STRIPE"), // STRIPE, CASH
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. Reviews table
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }).unique(),
  customerId: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1 - 5
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 8. Conversations table
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 9. Messages table
export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 10. Notifications table
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("INFO"), // BOOKING, MESSAGE, REVIEW, PAYMENT, SYSTEM, VERIFICATION
  link: text("link"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 11. Payments table
export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  currency: text("currency").default("PKR").notNull(),
  status: text("status").notNull().default("COMPLETED"), // PENDING, COMPLETED, FAILED, REFUNDED
  providerPaymentId: text("provider_payment_id"), // Stripe Payment Intent ID or Mock Ref
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 12. Favorites table
export const favorites = pgTable("favorites", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 13. Availability table
export const availability = pgTable("availability", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerId: text("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
  startTime: text("start_time").notNull(), // e.g. "09:00"
  endTime: text("end_time").notNull(), // e.g. "18:00"
  isAvailable: boolean("is_available").default(true).notNull(),
});

// 14. Portfolio Items table
export const portfolioItems = pgTable("portfolio_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerId: text("provider_id").notNull().references(() => providerProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 15. Admin Actions table
export const adminActions = pgTable("admin_actions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: text("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // APPROVE_PROVIDER, REJECT_PROVIDER, SUSPEND_USER, DELETE_SERVICE
  targetType: text("target_type").notNull(), // PROVIDER, USER, SERVICE, REVIEW
  targetId: text("target_id").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  providerProfile: one(providerProfiles, {
    fields: [users.id],
    references: [providerProfiles.userId],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
  notifications: many(notifications),
  favorites: many(favorites),
  messages: many(messages),
}));

export const providerProfilesRelations = relations(providerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [providerProfiles.userId],
    references: [users.id],
  }),
  services: many(services),
  bookings: many(bookings),
  reviews: many(reviews),
  availability: many(availability),
  portfolioItems: many(portfolioItems),
  conversations: many(conversations),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(providerProfiles, {
    fields: [services.providerId],
    references: [providerProfiles.id],
  }),
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  images: many(serviceImages),
  bookings: many(bookings),
  favorites: many(favorites),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  provider: one(providerProfiles, {
    fields: [bookings.providerId],
    references: [providerProfiles.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  review: one(reviews, {
    fields: [bookings.id],
    references: [reviews.bookingId],
  }),
  payment: one(payments, {
    fields: [bookings.id],
    references: [payments.bookingId],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  provider: one(providerProfiles, {
    fields: [reviews.providerId],
    references: [providerProfiles.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  customer: one(users, {
    fields: [conversations.customerId],
    references: [users.id],
  }),
  provider: one(providerProfiles, {
    fields: [conversations.providerId],
    references: [providerProfiles.id],
  }),
  service: one(services, {
    fields: [conversations.serviceId],
    references: [services.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
