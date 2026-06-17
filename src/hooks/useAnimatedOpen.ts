"use client";

import { useEffect, useState } from "react";

export function useAnimatedOpen(open: boolean, durationMs = 250) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        setVisible(true);
      });

      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => {
      setMounted(false);
    }, durationMs);

    return () => window.clearTimeout(timeout);
  }, [open, durationMs]);

  return { mounted, visible };
}
