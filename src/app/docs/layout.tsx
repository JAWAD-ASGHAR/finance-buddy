import { SiteShell } from "@/components/layout/SiteShell";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomCursor />
      <SmoothScroll>
        <SiteShell>{children}</SiteShell>
      </SmoothScroll>
    </>
  );
}
