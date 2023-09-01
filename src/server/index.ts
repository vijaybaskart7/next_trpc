import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from "better-sqlite3"
import { publicProcedure, router } from './trpc';
import { todos } from '@/db/schema';
import { z } from "zod";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "drizzle" });

export const appRouter = router({
  getTodos: publicProcedure.query(async () => {
    return await db.select().from(todos).all()
  }),
  addTodos: publicProcedure.input(z.string()).mutation(async (opts) => {
    await db.insert(todos).values({ content: opts.input, done: 0 })
  }),
  setDone: publicProcedure.input(z.object({ id: z.number(), done: z.number() })).mutation(async (opts) => {
    await db
      .update(todos)
      .set({ done: opts.input.done })
      .where(eq(todos.id, opts.input.id))
      .run();
    return true;
  })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;