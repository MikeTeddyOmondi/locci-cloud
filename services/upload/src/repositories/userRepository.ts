import { eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { users } from "../database/schema.js";

import { User } from "../entities/userEntity.js";

export default class UserRepository {
  // Find a user by ID - SELECT * FROM users where id = ?1;
  async findById(id: number) {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user || null;
  }

  async findByOAuthId(provider: string, oauthId: string): Promise<User | null> {
    return (
      this.users.find(
        (user) => user.oauthProvider === provider && user.oauthId === oauthId
      ) || null
    );
  }

  // Get all users - SELECT * FROM users;
  async findAll() {
    return await db.select().from(users);
  }

  // Create a new user - name & email
  async create(user: { name: string; email: string }) {
    // Drizzle returns the inserted record(s)
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  // Update a user by ID
  async update(id: number, user: { name: string; email: string }) {
    const [result] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return result || null;
  }

  // Delete a user by ID
  async delete(id: number) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0; // true or false
  }
}
