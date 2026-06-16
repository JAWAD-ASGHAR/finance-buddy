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
  revalidatePath("/shared");
  revalidatePath("/shared/friends");
  if (friendId) {
    revalidatePath(`/shared/friends/${friendId}`);
  }
}

export function revalidateReportPaths() {
  revalidatePath("/reports");
}
