import { SiteShell } from "@/components/layout/SiteShell";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { SiteLoader } from "@/components/motion/SiteLoader";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomCursor />
      <SiteLoader>
        <SmoothScroll>
          <SiteShell>{children}</SiteShell>
        </SmoothScroll>
      </SiteLoader>
    </>
  );
}
