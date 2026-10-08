import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SafeUser } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "kaamhub_jwt_secure_secret_key_prod_2025_market";
const COOKIE_NAME = "kaamhub_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    // 1. Try reading cookie
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    let token = tokenCookie?.value;

    // 2. Fallback to Authorization header
    if (!token) {
      const headerStore = await headers();
      const authHeader = headerStore.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    try {
      const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role as SafeUser["role"],
          location: user.location,
          createdAt: user.createdAt,
        };
      }
    } catch (dbErr) {
      // Fallback to token payload & mock data if DB is offline
    }

    // Check mock users fallback
    const { MOCK_USERS } = await import("./mockData");
    const mockUser = MOCK_USERS.find(
      (u) => u.id === decoded.userId || u.email.toLowerCase() === decoded.email?.toLowerCase()
    );

    if (mockUser) {
      return {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        avatar: mockUser.avatar,
        role: mockUser.role,
        location: mockUser.location,
        createdAt: mockUser.createdAt,
      };
    }

    // Fallback constructed user from token
    return {
      id: decoded.userId,
      name: decoded.email?.split("@")[0] || "User",
      email: decoded.email,
      role: (decoded.role as SafeUser["role"]) || "CUSTOMER",
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting session user:", error);
    return null;
  }
}

export function sanitizeUser(user: typeof users.$inferSelect): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role as SafeUser["role"],
    location: user.location,
    createdAt: user.createdAt,
  };
}
