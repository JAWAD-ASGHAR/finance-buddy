import { SavingGoalForm } from "@/components/app/SavingGoalForm";
import { SavingGoalsPanel } from "@/components/app/SavingGoalsPanel";
import { AppPageHeader } from "@/components/app/ui";
import { getSavingGoals } from "@/actions/saving-goals";

export default async function SavingsPage() {
  const goals = await getSavingGoals();

  return (
    <>
      <AppPageHeader
        title="Savings goals"
        description="Set targets, record contributions, and track how close you are to your goals."
      />
      <div className="space-y-6">
        <SavingGoalForm />
        <SavingGoalsPanel goals={goals} />
      </div>
    </>
  );
}
