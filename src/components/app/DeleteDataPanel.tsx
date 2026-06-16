"use client";

import { deleteAllUserData } from "@/actions/expenses";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AppButton,
  AppCard,
  AppError,
} from "@/components/app/ui";

export function DeleteDataPanel() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    const result = await deleteAllUserData();
    if (!result.success) {
      setError(result.error);
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
      {error ? <AppError message={error} /> : null}
      <AppButton
        type="button"
        variant="danger"
        disabled={pending}
        onClick={handleDelete}
      >
        {pending ? "Deleting..." : "Delete all my data"}
      </AppButton>
    </AppCard>
  );
}
