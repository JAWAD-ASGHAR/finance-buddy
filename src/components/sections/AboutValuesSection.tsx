"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { aboutValues } from "@/lib/content";
import { useMounted } from "@/lib/use-mounted";

const MOBILE_BREAKPOINT = 640;
const SCROLL_PER_CARD_VH = 0.55;
const SCROLL_PER_CARD_VH_MOBILE = 0.72;

type CardMotionConfig = {
  spread: number;
  xMult: number;
  rotateMult: number;
  scaleDrop: number;
  opacityMult: number;
  yMult: number;
};

const DESKTOP_MOTION: CardMotionConfig = {
  spread: 0.38,
  xMult: 58,
  rotateMult: -14,
  scaleDrop: 0.18,
  opacityMult: 0.92,
  yMult: 14,
};

const MOBILE_MOTION: CardMotionConfig = {
  spread: 0.48,
  xMult: 102,
  rotateMult: -9,
  scaleDrop: 0.24,
  opacityMult: 1.08,
  yMult: 6,
};

function getCardMotionConfig(): CardMotionConfig {
  if (typeof window === "undefined") {
    return DESKTOP_MOTION;
  }

  return window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_MOTION : DESKTOP_MOTION;
}

function getCardMotion(
  cardIndex: number,
  scrollProgress: number,
  total: number,
  config: CardMotionConfig,
) {
  const focus = (cardIndex + 0.5) / total;
  const distance = (scrollProgress - focus) / config.spread;

  const absDistance = Math.min(1, Math.abs(distance));
  const x = distance * config.xMult;
  const rotate = distance * config.rotateMult;
  const scale = 1 - absDistance * config.scaleDrop;
  const opacity = Math.max(0, 1 - absDistance * config.opacityMult);
  const y = Math.sin(cardIndex * 1.35) * config.yMult;
  const zIndex = Math.round((1 - absDistance) * 100);

  return { x, y, rotate, scale, opacity, zIndex };
}

function ValueCard({
  value,
  index,
  staticLayout = false,
}: {
  value: (typeof aboutValues)[number];
  index: number;
  staticLayout?: boolean;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      data-value-card
      data-value-index={index}
      className={
        staticLayout
          ? "value-card value-card--static"
          : "value-card value-card--animated"
      }
      style={{ "--value-color": value.color } as React.CSSProperties}
      aria-label={value.text}
    >
      <div className="value-card-inner">
        <span className="value-card-watermark" aria-hidden>
          {number}
        </span>
        <div className="value-card-content">
          <p className="value-card-eyebrow">{value.label}</p>
          <p className="value-card-text">{value.text}</p>
        </div>
      </div>
    </article>
  );
}

function ValuesStaticGrid() {
  return (
    <section className="section-padding overflow-hidden bg-white">
      <div className="container-main">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-5">Values</p>
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
              What guides our work
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {aboutValues.map((value, index) => (
            <ScrollReveal key={value.id} delay={index * 0.05}>
              <ValueCard value={value} index={index} staticLayout />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutValuesSection() {
  const reducedMotion = useReducedMotion();
  const mounted = useMounted();
  const staticLayout = mounted && reducedMotion;
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staticLayout || !sectionRef.current || !pinRef.current || !stageRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const cards = Array.from(
      stageRef.current.querySelectorAll<HTMLElement>("[data-value-card]"),
    );
    const total = cards.length;

    cards.forEach((card) => {
      gsap.set(card, {
        force3D: true,
        transformPerspective: 1200,
        transformOrigin: "50% 50%",
      });
    });

    const updateCards = (progress: number) => {
      const motion = getCardMotionConfig();
      let bestIndex = 0;
      let bestDistance = Infinity;

      cards.forEach((card, index) => {
        const focus = (index + 0.5) / total;
        const distance = (progress - focus) / motion.spread;
        const absDistance = Math.min(1, Math.abs(distance));
        const { x, y, rotate, scale, opacity, zIndex } = getCardMotion(
          index,
          progress,
          total,
          motion,
        );

        if (absDistance < bestDistance) {
          bestDistance = absDistance;
          bestIndex = index;
        }

        gsap.set(card, {
          x: `${x}vw`,
          y,
          rotation: rotate,
          scale,
          opacity,
          zIndex,
          overwrite: "auto",
        });
      });

      cards.forEach((card, index) => {
        card.classList.toggle("value-card--active", index === bestIndex);
      });
    };

    const scrollDistance = () => {
      const perCardVh =
        window.innerWidth < MOBILE_BREAKPOINT
          ? SCROLL_PER_CARD_VH_MOBILE
          : SCROLL_PER_CARD_VH;

      return window.innerHeight * perCardVh * (total + 0.15);
    };

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: () => `+=${scrollDistance()}`,
      pin: pinRef.current,
      scrub: 0.65,
      invalidateOnRefresh: true,
      onUpdate: (self) => updateCards(self.progress),
    });

    updateCards(0);
    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
    };
  }, [staticLayout]);

  if (staticLayout) {
    return <ValuesStaticGrid />;
  }

  return (
    <section
      ref={sectionRef}
      className="values-scroll-section"
      aria-labelledby="about-values-heading"
    >
      <div ref={pinRef} className="values-scroll-pin">
        <div className="container-main values-scroll-layout">
          <header className="values-scroll-header">
            <p className="eyebrow values-scroll-eyebrow">Values</p>
            <h2
              id="about-values-heading"
              className="heading-display mx-auto max-w-3xl text-center text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-[1.05]"
            >
              What guides our work
            </h2>
          </header>

          <div ref={stageRef} className="values-scroll-stage">
            {aboutValues.map((value, index) => (
              <ValueCard key={value.id} value={value} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
