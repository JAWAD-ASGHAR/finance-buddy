import { founder } from "@/lib/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function FounderSpotlight() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <ScrollReveal direction="left">
        <ImagePlaceholder
          label="Dr. Faisal Khan — Founder portrait"
          className="w-full"
          aspectRatio="aspect-[4/5]"
        />
      </ScrollReveal>

      <ScrollReveal direction="right" delay={0.1}>
        <p className="eyebrow mb-4">Founder Spotlight</p>
        <h2 className="heading-display text-3xl font-semibold text-foreground sm:text-4xl">
          {founder.name}
        </h2>
        <p className="mt-2 text-sm font-medium text-accent-green">
          {founder.credentials} · {founder.title}
        </p>
        <blockquote className="quote-serif mt-8 border-l-2 border-dark pl-6 text-2xl leading-snug text-foreground">
          &ldquo;{founder.quote}&rdquo;
        </blockquote>
        <p className="mt-6 text-muted-foreground leading-relaxed">{founder.bio}</p>
      </ScrollReveal>
    </div>
  );
}
