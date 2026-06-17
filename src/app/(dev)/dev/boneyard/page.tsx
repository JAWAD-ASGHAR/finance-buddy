import { RouteSkeleton } from "@/components/loading/RouteSkeleton";
import { AppShellFallback } from "@/components/app/AppShell";
import { SKELETON_NAMES } from "@/components/loading/skeleton-names";
import type { SkeletonName } from "@/components/loading/skeleton-names";

const appSkeletons: SkeletonName[] = [
  SKELETON_NAMES.dashboard,
  SKELETON_NAMES.expenses,
  SKELETON_NAMES.expenseForm,
  SKELETON_NAMES.budgetForm,
  SKELETON_NAMES.reports,
  SKELETON_NAMES.profile,
  SKELETON_NAMES.shared,
  SKELETON_NAMES.friends,
  SKELETON_NAMES.friendDetail,
  SKELETON_NAMES.sharedExpenseForm,
];

const standaloneSkeletons: SkeletonName[] = [
  SKELETON_NAMES.authForm,
  SKELETON_NAMES.marketingHero,
];

function SkeletonPreviewSection({ name }: { name: SkeletonName }) {
  return (
    <section className="space-y-4 border-t border-border pt-12">
      <h2 className="font-mono text-sm text-muted-foreground">{name}</h2>
      <RouteSkeleton name={name} />
    </section>
  );
}

export default function BoneyardDevPage() {
  return (
    <>
      <AppShellFallback>
        <div className="space-y-24 py-4">
          <div>
            <h1 className="text-2xl font-semibold">Boneyard skeleton preview</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Dev-only page for capturing loading bones via{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                npm run bones:build
              </code>
              .
            </p>
          </div>
          {appSkeletons.map((name) => (
            <SkeletonPreviewSection key={name} name={name} />
          ))}
        </div>
      </AppShellFallback>

      <div className="space-y-24 bg-background px-4 py-8 sm:px-6 lg:px-8">
        {standaloneSkeletons.map((name) => (
          <SkeletonPreviewSection key={name} name={name} />
        ))}
      </div>
    </>
  );
}
