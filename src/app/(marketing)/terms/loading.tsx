import { RouteSkeleton } from "@/components/loading/RouteSkeleton";
import { SKELETON_NAMES } from "@/components/loading/skeleton-names";

export default function TermsLoading() {
  return <RouteSkeleton name={SKELETON_NAMES.marketingHero} />;
}
