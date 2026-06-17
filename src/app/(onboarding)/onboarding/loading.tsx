import { RouteSkeleton } from "@/components/loading/RouteSkeleton";
import { SKELETON_NAMES } from "@/components/loading/skeleton-names";

export default function OnboardingLoading() {
  return (
    <div className="mx-auto max-w-lg">
      <RouteSkeleton name={SKELETON_NAMES.settings} />
    </div>
  );
}
