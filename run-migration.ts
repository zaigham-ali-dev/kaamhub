import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

const connectionString = "postgresql://postgres.gqoqkednpaeztnmgqjwe:Qasim%40Ali123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";

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