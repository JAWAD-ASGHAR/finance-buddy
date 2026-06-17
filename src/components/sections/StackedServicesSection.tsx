"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { services } from "@/lib/content";
import { useMounted } from "@/lib/use-mounted";

const SCALE_STEP = 0.04;
const Z_STEP = 48;
const BRIGHTNESS_STEP = 0.1;

function readCardStickyTop(card: HTMLElement) {
  const top = parseFloat(getComputedStyle(card).top);
  return Number.isFinite(top) ? top : 200;
}

function getHandoffRange(card: HTMLElement) {
  const gap = parseFloat(getComputedStyle(card).marginBottom) || 176;
  return card.getBoundingClientRect().height + gap;
}

/** 0 = approaching, 1 = pinned in its sticky slot */
function getStickyProgress(cards: HTMLElement[], index: number) {
  const card = cards[index];
  const top = card.getBoundingClientRect().top;
  const sticky = readCardStickyTop(card);
  const range = getHandoffRange(card);

  if (top <= sticky) return 1;
  if (top >= sticky + range) return 0;
  return 1 - (top - sticky) / range;
}

/** How many cards above have landed on this one (fractional while handoff) */
function getCardsOnTopProgress(cards: HTMLElement[], index: number) {
  let total = 0;
  for (let j = index + 1; j < cards.length; j++) {
    total += getStickyProgress(cards, j);
  }
  return total;
}

function deckTransform(depth: number) {
  return {
    scale: Math.max(0.78, 1 - depth * SCALE_STEP),
    z: -depth * Z_STEP,
    brightness: Math.max(0.58, 1 - depth * BRIGHTNESS_STEP),
  };
}

function getCardDeckState(cards: HTMLElement[], index: number) {
  const onTop = getCardsOnTopProgress(cards, index);
  const arrival = getStickyProgress(cards, index);

  if (arrival >= 1) {
    return deckTransform(onTop);
  }

  const queued = deckTransform(onTop + 1);
  const front = deckTransform(onTop);

  return {
    scale: queued.scale + (front.scale - queued.scale) * arrival,
    z: queued.z + (front.z - queued.z) * arrival,
    brightness:
      queued.brightness + (front.brightness - queued.brightness) * arrival,
  };
}

function serviceTags(shortTitle: string) {
  return shortTitle
    .split("|")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

type Service = (typeof services)[number];

const STACK_HEADER_CENTERED =
  "Tools that grow with your budget";

type StackHeaderPhase = "intro" | "centered";

function getHeaderPhase(cards: HTMLElement[], header: HTMLElement): StackHeaderPhase {
  if (!cards.length) return "intro";

  const lastCard = cards[cards.length - 1];
  const deck =
    lastCard.querySelector<HTMLElement>("[data-stack-deck]") ?? lastCard;
  const headerRect = header.getBoundingClientRect();
  const deckRect = deck.getBoundingClientRect();

  if (deckRect.bottom <= headerRect.top + 8) {
    return "centered";
  }

  if (deckRect.top <= headerRect.top - 8) {
    return "centered";
  }

  return "intro";
}

function applyStackHeaderPhase(
  header: HTMLElement,
  phase: StackHeaderPhase,
  introMarkup: string,
) {
  const inner = header.querySelector<HTMLElement>("[data-stack-header-inner]");
  if (!inner) return;

  if (phase === "intro") {
    inner.innerHTML = introMarkup;
    return;
  }

  inner.innerHTML = `<h2 class="heading-display w-full text-center text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-[1.02]">${STACK_HEADER_CENTERED}</h2>`;
}

function StackSectionHeader({
  sticky = false,
  headerRef,
}: {
  sticky?: boolean;
  headerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  if (sticky) {
    return (
      <div ref={headerRef} className="stack-section-intro">
        <div
          data-stack-header-inner
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="min-w-0">
            <p className="eyebrow mb-3 sm:mb-4">Features</p>
            <h2 className="heading-display max-w-2xl text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-[1.02]">
              Built for Student Budgets
            </h2>
          </div>
          <Link
            href="/what-we-do"
            className="inline-flex shrink-0 items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-accent-green sm:self-auto"
          >
            View All Features
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-14 flex flex-col gap-4 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
      <ScrollReveal>
        <p className="eyebrow mb-3 sm:mb-4">Features</p>
        <h2 className="heading-display max-w-2xl text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-[1.02]">
          Built for Student Budgets
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.08}>
        <Link
          href="/what-we-do"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-accent-green"
        >
          View All Features
          <ArrowRight size={14} />
        </Link>
      </ScrollReveal>
    </div>
  );
}

export function StackedServicesSection() {
  const reducedMotion = useReducedMotion();
  const mounted = useMounted();
  const staticStack = mounted && reducedMotion;
  const stackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staticStack || !stackRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const cards = Array.from(
      stackRef.current.querySelectorAll<HTMLElement>("[data-stack-card]"),
    );
    const decks = cards.map(
      (card) => card.querySelector<HTMLElement>("[data-stack-deck]")!,
    );

    decks.forEach((deck) => {
      gsap.set(deck, {
        transformPerspective: 1500,
        force3D: true,
        transformOrigin: "50% 0%",
      });
    });

    let headerPhase: StackHeaderPhase = "intro";
    const header = headerRef.current;
    const introMarkup =
      header?.querySelector<HTMLElement>("[data-stack-header-inner]")
        ?.innerHTML ?? "";

    const updateDeck = () => {
      cards.forEach((card, index) => {
        const { scale, z, brightness } = getCardDeckState(cards, index);

        gsap.set(decks[index], {
          scale,
          z,
          filter: `brightness(${brightness})`,
          overwrite: "auto",
        });

        const onTop = getCardsOnTopProgress(cards, index);
        const arrival = getStickyProgress(cards, index);
        const isFront = arrival > 0.98 && onTop < 0.02;

        decks[index].classList.toggle("stack-card-deck--front", isFront);
        card.style.pointerEvents = isFront ? "auto" : "none";
      });

      if (header && introMarkup) {
        const phase = getHeaderPhase(cards, header);
        if (phase !== headerPhase) {
          headerPhase = phase;
          applyStackHeaderPhase(header, phase, introMarkup);
        }
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: stackRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: updateDeck,
      invalidateOnRefresh: true,
    });

    updateDeck();
    ScrollTrigger.addEventListener("refreshInit", updateDeck);
    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      ScrollTrigger.removeEventListener("refreshInit", updateDeck);
    };
  }, [staticStack]);

  return (
    <section id="services" className="stack-section scroll-mt-28 bg-white pt-8">
      <div className="container-main">
        {!staticStack && <StackSectionHeader sticky headerRef={headerRef} />}

        {staticStack ? (
          <>
            <StackSectionHeader />
            <div className="space-y-6 pb-12">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="mx-auto min-h-[min(var(--stack-card-height),var(--stack-card-max-height))] overflow-hidden rounded-[2rem]"
                  style={{
                    backgroundColor: service.stackColor,
                    width: "var(--stack-card-width)",
                  }}
                >
                  <StackedServiceCardBody service={service} />
                </article>
              ))}
            </div>
          </>
        ) : (
          <div ref={stackRef} className="stack-perspective overflow-visible">
            {services.map((service, index) => (
              <article
                key={service.id}
                data-stack-card
                className="stack-card"
                style={
                  {
                    "--stack-index": index,
                  } as React.CSSProperties
                }
                aria-label={`${service.title} service`}
              >
                <div
                  data-stack-deck
                  className="stack-card-deck"
                  style={{ transformOrigin: "50% 0%" }}
                >
                  <div
                    className="stack-card-shell"
                    style={{ backgroundColor: service.stackColor }}
                    aria-hidden
                  />
                  <StackedServiceCardBody service={service} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StackedServiceCardBody({ service }: { service: Service }) {
  const tags = serviceTags(service.shortTitle);
  const highlights = service.details.benefits.slice(0, 2);

  return (
    <div className="stack-card-content">
      <div className="relative order-1 min-h-0 overflow-hidden lg:order-2 lg:h-full">
        <Image
          src={service.stackImage}
          alt={service.stackImageLabel}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 42vw, 100vw"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-black/45 lg:via-black/15 lg:to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-l from-black/20 via-transparent to-transparent lg:block"
          aria-hidden
        />
      </div>

      <div className="order-2 flex min-h-0 flex-col justify-between px-5 py-5 sm:px-8 sm:py-8 lg:order-1 lg:px-10 lg:py-9 xl:px-12">
        <div className="flex flex-col gap-3 sm:gap-5 lg:gap-6">
          <h3 className="heading-display text-[clamp(1.5rem,4.8vw,2.625rem)] font-semibold leading-[1.05] text-white">
            {service.title}
          </h3>

          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 sm:gap-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-white/70 sm:px-3 sm:py-1 sm:text-[0.625rem]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <p className="line-clamp-2 max-w-md text-sm leading-relaxed text-white/80 sm:text-[0.9375rem] lg:line-clamp-none">
            {service.description}
          </p>

          <p className="hidden max-w-md text-sm leading-relaxed text-white/55 md:block">
            {service.details.intro}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:gap-5 lg:gap-6">
          <ul className="hidden space-y-2 md:block">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-sm leading-snug text-white/70"
              >
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-green"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href={`/what-we-do#${service.id}`}
            className="inline-flex w-fit items-center gap-2.5 rounded-full bg-white px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#111111] transition-colors hover:bg-accent-green-light hover:text-accent-green sm:px-5 sm:py-2.5 sm:text-xs"
          >
            Learn More
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
