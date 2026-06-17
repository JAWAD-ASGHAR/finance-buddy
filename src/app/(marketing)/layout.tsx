import { redirect } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { getAuthUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <CustomCursor />
      <SmoothScroll>
        <SiteShell>{children}</SiteShell>
      </SmoothScroll>
    </>
  );
}
