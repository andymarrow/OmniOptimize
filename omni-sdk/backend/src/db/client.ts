import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Validate DATABASE_URL exists
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10, // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Drizzle client
export const db = drizzle(pool, { schema });

// Health check
export async function checkDbConnection() {
  try {
    await pool.query("SELECT NOW()");
    console.log("✓ Database connection OK");
    return true;
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    return false;
  }
}
