"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  displayNameFromEmail,
  parseEmail,
} from "@/lib/auth/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/finance";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

function getSafeNextPath(formData: FormData): string {
  const nextPath = formData.get("next");
  return typeof nextPath === "string" &&
    nextPath.startsWith("/") &&
    !nextPath.startsWith("//")
    ? nextPath
    : "/dashboard";
}

export async function signUp(
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const emailResult = parseEmail(formData.get("email"));
  if (!emailResult.ok) {
    return { success: false, error: emailResult.error };
  }

  const passwordResult = passwordSchema.safeParse(formData.get("password"));
  if (!passwordResult.success) {
    return {
      success: false,
      error: passwordResult.error.issues[0]?.message ?? "Invalid password",
    };
  }

  const { email } = emailResult;
  const password = passwordResult.data;
  const displayName = displayNameFromEmail(email);

  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
  });

  if (createError) {
    if (createError.message.toLowerCase().includes("already")) {
      return { success: false, error: "An account with this email already exists" };
    }
    return { success: false, error: createError.message };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { success: false, error: signInError.message };
  }

  redirect(getSafeNextPath(formData));
}

export async function signIn(
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const emailResult = parseEmail(formData.get("email"));
  if (!emailResult.ok) {
    return { success: false, error: emailResult.error };
  }

  const passwordResult = passwordSchema.safeParse(formData.get("password"));
  if (!passwordResult.success) {
    return {
      success: false,
      error: passwordResult.error.issues[0]?.message ?? "Invalid password",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: emailResult.email,
    password: passwordResult.data,
  });

  if (error) {
    return { success: false, error: "Invalid email or password" };
  }

  redirect(getSafeNextPath(formData));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
