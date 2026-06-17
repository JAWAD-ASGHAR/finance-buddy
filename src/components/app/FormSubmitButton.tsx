"use client";

import { useFormStatus } from "react-dom";
import { AppButton } from "@/components/app/ui";

export function FormSubmitButton({
  children,
  className,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <AppButton
      type="submit"
      loading={pending}
      disabled={disabled}
      className={className}
      variant={variant}
    >
      {children}
    </AppButton>
  );
}
