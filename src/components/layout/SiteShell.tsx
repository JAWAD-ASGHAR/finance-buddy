"use client";

import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { FloatingCTABar } from "@/components/sections/FloatingCTABar";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === "/";
  const reducedMotion = useReducedMotion();
  const useReveal = isHome && !reducedMotion;

  return (
    <>
      <ScrollToTop />
      <Header placement="site" />
      <main
        className={cn(
          "min-h-0 flex-1 overflow-visible",
          "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0",
          !isHome && "pt-[4.5rem]",
          useReveal && "home-main-reveal",
        )}
      >
        {children}
      </main>
      <Footer />
      <FloatingCTABar />
      <BackToTopButton />
    </>
  );
}
