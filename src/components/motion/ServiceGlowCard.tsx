"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useRef, type MouseEvent, type ReactNode } from "react";

export function ServiceGlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const setGlow = useCallback((x: number, y: number, opacity: number) => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--mouse-x", `${x}%`);
    card.style.setProperty("--mouse-y", `${y}%`);
    card.style.setProperty("--glow-opacity", String(opacity));
  }, []);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setGlow(x, y, 1);
  };

  const handleLeave = () => {
    setGlow(50, 50, 0);
  };

  const handleEnter = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) {
      setGlow(50, 50, 0.35);
      return;
    }

    handleMove(event);
  };

  return (
    <div
      ref={cardRef}
      className={`service-glow-card${className ? ` ${className}` : ""}`}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="service-glow-card-shine" aria-hidden />
      <div className="service-glow-card-spotlight" aria-hidden />
      <div className="service-glow-card-content">{children}</div>
    </div>
  );
}
