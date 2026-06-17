import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  light?: boolean;
  variant?: "default" | "compact";
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({
  href = "/",
  light = false,
  variant = "default",
  className,
  imageClassName,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "site-logo shrink-0",
        variant === "compact" && "site-logo--compact max-w-full pr-1",
        light && "site-logo--light",
        className,
      )}
      aria-label={site.name}
    >
      <Image
        src="/brand/logo.webp"
        alt=""
        width={163}
        height={138}
        className={cn("site-logo-image", imageClassName)}
        priority
      />
      <span
        className={cn(
          "site-logo-mark",
          light ? "text-white" : "text-foreground",
        )}
      >
        {site.logoMark}
      </span>
      <span
        className={cn(
          "site-logo-suffix",
          light ? "text-white/85" : "text-foreground",
        )}
      >
        {site.logoSuffix}
      </span>
    </Link>
  );
}
