import { RouteSkeleton } from "@/components/loading/RouteSkeleton";
import { SKELETON_NAMES } from "@/components/loading/skeleton-names";

export default function FriendDetailLoading() {
  return <RouteSkeleton name={SKELETON_NAMES.friendDetail} />;
}
