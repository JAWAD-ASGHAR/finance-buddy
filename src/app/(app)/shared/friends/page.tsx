import { redirect } from "next/navigation";

export default function SharedFriendsRedirect() {
  redirect("/friends");
}
