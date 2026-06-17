import { revalidatePath } from "next/cache";

export function revalidateBudgetPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budget/edit");
}

export function revalidateExpensePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/reports");
}

export function revalidateSharedPaths(friendId?: string) {
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
