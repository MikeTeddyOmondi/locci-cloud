import { db } from "../database/db";
import { waitlists } from "../database/schema";
import { eq } from "drizzle-orm";

export default class WaitlistRepository {
  async findById(id: number) {
    const [result] = await db
      .select()
      .from(waitlists)
      .where(eq(waitlists.id, id))
      .limit(1);
    return result || null;
  }

  async findAll() {
    return await db.select().from(waitlists);
  }

  async create(waitlist: { email: string }) {
    const [result] = await db.insert(waitlists).values(waitlist).returning();
    return result;
  }

  async update(id: number, waitlist: { email: string }) {
    const [result] = await db
      .update(waitlists)
      .set(waitlist)
      .where(eq(waitlists.id, id))
      .returning();
    return result || null;
  }

  async delete(id: number) {
    const result = await db
      .delete(waitlists)
      .where(eq(waitlists.id, id))
      .returning();
    return result.length > 0; // true or false
  }
}
