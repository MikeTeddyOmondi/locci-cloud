import { pgTable, serial, text } from "drizzle-orm/pg-core";

// Define a "users" table
export const users = pgTable("users", {
  id: serial("id").primaryKey(), // Auto-incrementing primary key
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

// waitlist
export const waitlists = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
});
