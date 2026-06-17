import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export type Db = PostgresJsDatabase<typeof schema>;

declare global {
  var __financeBuddyDb: Db | undefined;
  var __financeBuddySql: ReturnType<typeof postgres> | undefined;
}

export function getDb(): Db {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!globalThis.__financeBuddySql) {
    globalThis.__financeBuddySql = postgres(connectionString, { prepare: false });
  }

  if (process.env.NODE_ENV !== "production") {
    globalThis.__financeBuddyDb = drizzle(globalThis.__financeBuddySql, {
      schema,
    });
    return globalThis.__financeBuddyDb;
  }

  if (!globalThis.__financeBuddyDb) {
    globalThis.__financeBuddyDb = drizzle(globalThis.__financeBuddySql, {
      schema,
    });
  }

  return globalThis.__financeBuddyDb;
}
