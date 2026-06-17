"use client";

import { deleteAllUserData } from "@/actions/expenses";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AppButton, AppCard } from "@/components/app/ui";

export function DeleteDataPanel() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete all budgets, expenses, alerts, and reports? This cannot be undone.",
      )
    ) {
      return;
    }

    setPending(true);
    const result = await deleteAllUserData();
    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    router.push("/budget/setup");
    router.refresh();
  }

  return (
    <AppCard
      title="Delete all data"
      description="Remove every budget, expense, alert, and report from your account."
    >
      <AppButton
        type="button"
        variant="danger"
        loading={pending}
        onClick={handleDelete}
      >
        Delete all my data
      </AppButton>
    </AppCard>
  );
}
