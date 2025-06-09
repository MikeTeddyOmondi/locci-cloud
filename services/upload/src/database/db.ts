import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import env from 'dotenv';

env.config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize drizzle-orm with the Postgres pool
export const db = drizzle(pool);

