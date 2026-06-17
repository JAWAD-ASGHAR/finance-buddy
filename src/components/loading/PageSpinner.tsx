export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[min(60vh,32rem)] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground/70" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
