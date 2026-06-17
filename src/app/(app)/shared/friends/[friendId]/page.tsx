import { redirect } from "next/navigation";

export default async function SharedFriendDetailRedirect({
  params,
}: {
  params: Promise<{ friendId: string }>;
}) {
  const { friendId } = await params;
  redirect(`/friends/${friendId}`);
}
