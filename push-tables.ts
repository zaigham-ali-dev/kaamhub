import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import * as schema from './src/db/schema'; // Apna schema path verify kar lena

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL must be set.");
}

async function runPush() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

    console.log("Connecting to Supabase...");
    await client.connect();

    const db = drizzle(client, { schema });

    console.log("Pushing database schema...");
    // Drizzle-kit ke bajaye hum direct sync ya agar migrations folder hai toh migrate chalate hain
    // Lekin agar tables khud create karwani hain toh hum d drizzle-orm ki push utility ya custom query chala sakte hain.

    // Asaan tareeqa: agar aapne migrations folder banaya hai toh:
    // await migrate(db, { migrationsFolder: './drizzle' });

    console.log("Schema pushed successfully!");
    await client.end();
    process.exit(0);
}

runPush().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});