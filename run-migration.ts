import "dotenv/config";
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL must be set.");
}

async function main() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    console.log("Connecting to database...");
    await client.connect();

    const db = drizzle(client);

    console.log("Running migrations...");
    // Yeh aapke './drizzle' folder se migrations utha kar seedha Supabase par chala dega
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log("Migrations completed successfully!");
    await client.end();
    process.exit(0);
}

main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});