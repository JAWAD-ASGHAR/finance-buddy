"use client";

import { useFormStatus } from "react-dom";

export function PendingFieldset({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <fieldset disabled={pending} className="contents">
      {children}
    </fieldset>
  );
}
