"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const DRAWER_WIDTH = 420;
const STORAGE_KEY = "finance-buddy-ai-open";

type AiAssistantContextValue = {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  drawerWidth: number;
};

const AiAssistantContext = createContext<AiAssistantContextValue | null>(null);

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setOpenState(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const setOpen = useCallback((value: boolean) => {
    setOpenState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setOpenState((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      open,
      toggle,
      setOpen,
      drawerWidth: DRAWER_WIDTH,
    }),
    [open, toggle, setOpen],
  );

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  );
}

export function useAiAssistant() {
  const context = useContext(AiAssistantContext);
  if (!context) {
    throw new Error("useAiAssistant must be used within AiAssistantProvider");
  }
  return context;
}

export { DRAWER_WIDTH };
