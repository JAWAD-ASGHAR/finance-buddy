import { notFound } from "next/navigation";
import Link from "next/link";
import { getFriendActivity } from "@/actions/settlements";
import { FriendDetailPanel } from "@/components/shared/FriendDetailPanel";
import { AppPageHeader } from "@/components/app/ui";

export default async function FriendDetailPage({
  params,
}: {
  params: Promise<{ friendId: string }>;
}) {
  const { friendId } = await params;
  const data = await getFriendActivity(friendId);

  if (!data) {
    notFound();
  }

  return (
    <>
      <p className="mb-4">
        <Link
          href="/shared"
          className="text-sm text-accent-green underline-offset-4 hover:underline"
        >
          Back to shared expenses
        </Link>
      </p>
      <AppPageHeader
        title={data.friend.display_name ?? "Friend"}
        description="Shared bills and settlements with this friend."
      />
      <FriendDetailPanel
        friend={data.friend}
        netCents={data.netCents}
        activity={data.activity}
      />
    </>
  );
}
