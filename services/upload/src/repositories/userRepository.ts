import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db.js";
import { users } from "../database/schema.js";

import { User } from "../entities/userEntity.js";
import { UserSchema } from "../database/schema.js";

export default class UserRepository {
  async findById(id: string) {
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

  // async findByOAuthId(provider: string, oauthId: string): Promise<User | null> {
  //   const [user] = await db
  //     .select()
  //     .from(users)
  //     .where(eq(users.oauthProvider, provider)); // eq(users.oauthId, oauthId)
  //   return user || null;
  // }

  async findAll() {
    return await db.select().from(users);
  }

  async create(user: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    // let safeUser = UserSchema.parse(user);
    const id = uuidv4();
    const [result] = await db
      .insert(users)
      .values({ id, ...user })
      .returning();
    return result;
  }

  async update(
    id: string,
    user: { name: string; email: string }
  ): Promise<User | null> {
    const [result] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0; // true or false
  }
}
