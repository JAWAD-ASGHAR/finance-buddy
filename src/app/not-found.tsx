import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Page Not Found",
  description:
    "The page you are looking for could not be found. Return to Finance Buddy to explore student budgeting features.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <section className="section-padding bg-white">
      <div className="container-main text-center">
        <p className="eyebrow mb-5">404</p>
        <h1 className="heading-display text-4xl font-semibold text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          The page you requested does not exist or may have moved. Head back to
          the homepage to explore Finance Buddy features for student budgeting.
        </p>
        <div className="mt-8">
          <Button href="/">Back to Home</Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/contact" className="text-accent-blue hover:underline">
            Contact our team
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
