import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { profiles } from "@/db/schema";
import { getAuthUser } from "@/lib/supabase/server";

function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function isAdminUser(user: {
  id: string;
  email?: string;
}): Promise<boolean> {
  if (user.email && getAdminEmails().has(user.email.toLowerCase())) {
    return true;
  }

  const db = getDb();
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    columns: { isAdmin: true },
  });

  return profile?.isAdmin ?? false;
}

export async function requireAdminUser() {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  const isAdmin = await isAdminUser({
    id: user.id,
    email: user.email,
  });

  if (!isAdmin) {
    return null;
  }

  return user;
}
