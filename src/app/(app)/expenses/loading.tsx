import { RouteSkeleton } from "@/components/loading/RouteSkeleton";
import { SKELETON_NAMES } from "@/components/loading/skeleton-names";

export default function ExpensesLoading() {
  return <RouteSkeleton name={SKELETON_NAMES.expenses} />;
}
