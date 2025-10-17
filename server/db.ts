import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  console.error("📖 Please check the setup guide: setup-local-db.md");
  console.error("💡 You need to create a .env file with your database connection string");
  throw new Error(
    "DATABASE_URL must be set. Please check setup-local-db.md for instructions.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
