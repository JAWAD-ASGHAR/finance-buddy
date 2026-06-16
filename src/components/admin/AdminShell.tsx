import Link from "next/link";
import { signOut } from "@/actions/auth";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/dashboard", label: "Student app" },
];

export function AdminShell({
  children,
  currentPath = "/admin",
}: {
  children: React.ReactNode;
  currentPath?: string;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandLogo href="/admin" imageClassName="h-6" />
            <span className="rounded-full bg-accent-green-light px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-accent-green">
              Admin
            </span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] transition-colors",
                  currentPath === item.href
                    ? "bg-accent-green-light text-accent-green"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
