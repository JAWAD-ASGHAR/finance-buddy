import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export type Db = PostgresJsDatabase<typeof schema>;

declare global {
  var __financeBuddyDb: Db | undefined;
  var __financeBuddySql: ReturnType<typeof postgres> | undefined;
}

export function getDb(): Db {
  if (!globalThis.__financeBuddyDb) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }

    globalThis.__financeBuddySql = postgres(connectionString, { prepare: false });
    globalThis.__financeBuddyDb = drizzle(globalThis.__financeBuddySql, {
      schema,
    });
  }

  return globalThis.__financeBuddyDb;
}
