import { pgTable, serial, text, pgEnum, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Define a "users" table
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Auto-incrementing primary key
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // Hashed password for basic auth
  // // oauthProvider: oauthProviderEnum("oauthprovider"), // Enum for OAuth provider
  // oauthProvider: text("oauthprovider"), // Enum for OAuth provider
  // oauthId: text("oauthid").unique(), // Unique ID from the OAuth provider
});

export const UserSchema = createInsertSchema(users);
export const UsersUpdateSchema = UserSchema.partial();

// waitlist
export const waitlists = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstname: text("firstname"),
  lastname: text("lastname"),
});
