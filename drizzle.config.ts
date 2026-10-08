import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.gqoqkednpaeztnmgqjwe:Qasim%40Ali123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: { rejectUnauthorized: false },
  },
});
