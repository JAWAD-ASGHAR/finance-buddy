import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "dark" | "outline" | "ghost" | "primary" | "hero";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  cursorLabel?: string;
};

const variants = {
  dark: "bg-dark text-white hover:bg-dark-muted hover:-translate-y-0.5",
  primary: "bg-dark text-white hover:bg-dark-muted hover:-translate-y-0.5",
  outline:
    "bg-white/95 text-foreground border border-white/80 hover:bg-white hover:-translate-y-0.5 backdrop-blur-sm",
  hero: "border border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white",
  ghost: "text-foreground hover:text-accent-blue",
};

export function Button({
  href,
  children,
  variant = "dark",
  className,
  type = "button",
  onClick,
  cursorLabel,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick}
        {...(cursorLabel ? { "data-cursor-label": cursorLabel } : {})}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      {...(cursorLabel ? { "data-cursor-label": cursorLabel } : {})}
    >
      {children}
    </button>
  );
}
