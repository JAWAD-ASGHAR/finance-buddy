import { revalidatePath } from "next/cache";

export function revalidateBudgetPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/budget/setup");
}

export function revalidateExpensePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/reports");
}

export function revalidateSharedPaths(friendId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/shared");
  revalidatePath("/friends");
  revalidatePath("/profile");
  if (friendId) {
    revalidatePath(`/friends/${friendId}`);
  }
}

export function revalidateReportPaths() {
  revalidatePath("/reports");
}

export function revalidateSavingsPaths() {
  revalidatePath("/savings");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}
