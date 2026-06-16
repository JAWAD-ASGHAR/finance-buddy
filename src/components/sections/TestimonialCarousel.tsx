"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image: string;
  imageAlt: string;
};

export function TestimonialCarousel({
  testimonials,
}: {
  testimonials: readonly Testimonial[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <ScrollReveal>
      <div className="relative">
        <div className="overflow-hidden border border-border bg-white" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((item) => (
              <div key={item.name} className="min-w-0 flex-[0_0_100%]">
                <div className="grid lg:grid-cols-[1fr_min(38%,20rem)] lg:items-stretch">
                  <div className="relative aspect-[16/9] w-full bg-muted sm:aspect-[2/1] lg:hidden">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="100vw"
                      className="object-contain p-4"
                    />
                  </div>

                  <div className="flex flex-col justify-center px-8 py-10 sm:px-14 sm:py-14">
                    <Quote
                      className="mb-6 text-accent-green/30"
                      size={36}
                      strokeWidth={1.5}
                    />
                    <blockquote className="heading-display text-xl font-medium leading-snug text-foreground sm:text-2xl lg:text-[1.75rem] xl:text-3xl">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <footer className="mt-8 flex items-center gap-4 lg:mt-10">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted lg:hidden">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover object-[center_20%]"
                          aria-hidden
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.role}</p>
                      </div>
                    </footer>
                  </div>

                  <div className="relative hidden min-h-[18rem] bg-muted lg:block">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 20rem, 0px"
                      className="object-contain p-6"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-all hover:border-accent-green hover:text-accent-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-all hover:border-accent-green hover:text-accent-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </ScrollReveal>
  );
}
