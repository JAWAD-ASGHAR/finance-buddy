"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useState } from "react";
import {
  findClickableUnderCursor,
  resolveCursorLabel,
} from "@/lib/cursor-labels";
import { useMounted } from "@/lib/use-mounted";

const LABEL_SIDE_GAP = 14;
const LABEL_EDGE_BUFFER = 16;

const SPRING_LABEL = { type: "spring" as const, stiffness: 420, damping: 26, mass: 0.55 };

const MEASURE_CLASS = "custom-cursor__label-measure";

type CursorTone = "on-light" | "on-dark";
type LabelPlacement = "left" | "right";

function resolveLabelPlacement(
  clientX: number,
  labelWidth: number,
): LabelPlacement {
  const needed = LABEL_SIDE_GAP + labelWidth + LABEL_EDGE_BUFFER;
  const fitsRight = window.innerWidth - clientX >= needed;
  const fitsLeft = clientX >= needed;

  if (fitsRight) return "right";
  if (fitsLeft) return "left";
  return window.innerWidth - clientX >= clientX ? "right" : "left";
}

function parseCssColor(color: string) {
  const match = color.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/,
  );
  if (!match) return null;

  const alpha = match[4] === undefined ? 1 : Number(match[4]);
  if (alpha < 0.08) return null;

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: alpha,
  };
}

function relativeLuminance(r: number, g: number, b: number) {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  );
}

function resolveCursorTone(element: Element | null): CursorTone {
  let current: Element | null = element;

  while (current) {
    const { backgroundColor } = getComputedStyle(current);
    const rgb = parseCssColor(backgroundColor);

    if (rgb) {
      return relativeLuminance(rgb.r, rgb.g, rgb.b) > 0.55
        ? "on-light"
        : "on-dark";
    }

    current = current.parentElement;
  }

  return "on-light";
}

export function CustomCursor() {
  const mounted = useMounted();
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tone, setTone] = useState<CursorTone>("on-light");
  const [label, setLabel] = useState<string | null>(null);
  const [labelPlacement, setLabelPlacement] = useState<LabelPlacement>("right");

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    if (!mounted || reducedMotion) return;

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const hasHover = window.matchMedia("(hover: hover)").matches;
    if (!hasFinePointer || !hasHover) return;

    const measureEl = document.createElement("span");
    measureEl.className = MEASURE_CLASS;
    measureEl.setAttribute("aria-hidden", "true");
    measureEl.hidden = true;
    document.body.appendChild(measureEl);

    setEnabled(true);

    let activeLabel: string | null = null;

    const measureLabelWidth = (text: string) => {
      measureEl.hidden = false;
      measureEl.textContent = text;
      const width = measureEl.getBoundingClientRect().width;
      measureEl.hidden = true;
      measureEl.textContent = "";
      return width;
    };

    const updateFromPointer = (clientX: number, clientY: number) => {
      const clickable = findClickableUnderCursor(clientX, clientY);
      const pointerTarget =
        clickable ?? document.elementFromPoint(clientX, clientY);
      const nextLabel = clickable ? resolveCursorLabel(pointerTarget) : null;

      activeLabel = nextLabel;
      setLabel(nextLabel);
      if (nextLabel) {
        setLabelPlacement(
          resolveLabelPlacement(clientX, measureLabelWidth(nextLabel)),
        );
      }
      setTone(resolveCursorTone(pointerTarget));
    };

    const move = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      updateFromPointer(event.clientX, event.clientY);
      setVisible(true);
    };

    const onResize = () => {
      if (!activeLabel) return;
      setLabelPlacement(
        resolveLabelPlacement(cursorX.get(), measureLabelWidth(activeLabel)),
      );
    };

    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        updateFromPointer(cursorX.get(), cursorY.get());
      });
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.documentElement.addEventListener("mouseleave", hide);
    document.documentElement.addEventListener("mouseenter", show);

    return () => {
      measureEl.remove();
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.documentElement.removeEventListener("mouseenter", show);
    };
  }, [mounted, reducedMotion, cursorX, cursorY]);

  if (!mounted || reducedMotion || !enabled) return null;

  return (
    <motion.div
      aria-hidden
      className={`custom-cursor pointer-events-none fixed top-0 left-0 z-[9999] custom-cursor--${tone}`}
      style={{ x: cursorX, y: cursorY }}
      animate={{
        opacity: visible ? 1 : 0,
      }}
      transition={{
        opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <AnimatePresence mode="popLayout">
        {label ? (
          <motion.span
            key={`${label}-${labelPlacement}`}
            className={`custom-cursor__label custom-cursor__label--${labelPlacement}`}
            style={
              labelPlacement === "right"
                ? { left: LABEL_SIDE_GAP }
                : { right: LABEL_SIDE_GAP }
            }
            initial={{
              opacity: 0,
              x: labelPlacement === "right" ? -12 : 12,
              scale: 0.82,
              filter: "blur(4px)",
            }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              x: labelPlacement === "right" ? -8 : 8,
              scale: 0.9,
              filter: "blur(2px)",
            }}
            transition={SPRING_LABEL}
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
