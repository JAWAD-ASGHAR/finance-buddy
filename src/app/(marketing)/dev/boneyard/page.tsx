import { RouteSkeleton } from "@/components/loading/RouteSkeleton";
import { SKELETON_NAMES } from "@/components/loading/skeleton-names";
import type { SkeletonName } from "@/components/loading/skeleton-names";

const previewOrder: SkeletonName[] = Object.values(SKELETON_NAMES);

export default function BoneyardDevPage() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-24 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Boneyard skeleton preview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dev-only page for capturing pixel-perfect loading bones via{" "}
          <code className="rounded bg-muted px-1 py-0.5">npm run bones:build</code>
          .
        </p>
      </div>
      {previewOrder.map((name) => (
        <section key={name} className="space-y-4 border-t border-border pt-12">
          <h2 className="font-mono text-sm text-muted-foreground">{name}</h2>
          <RouteSkeleton name={name} />
        </section>
      ))}
    </div>
  );
}
