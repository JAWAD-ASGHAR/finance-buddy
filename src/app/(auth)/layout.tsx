import { redirectIfAuthenticated } from "@/lib/auth/redirects";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfAuthenticated();
  return children;
}
