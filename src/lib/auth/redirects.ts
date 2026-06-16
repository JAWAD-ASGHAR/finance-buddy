import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";

export async function redirectIfAuthenticated(
  destination = "/dashboard",
): Promise<void> {
  const user = await getAuthUser();
  if (user) {
    redirect(destination);
  }
}
