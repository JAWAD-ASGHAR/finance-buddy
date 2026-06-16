import { cn } from "@/lib/utils";

export function AppCard({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-background p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      {title ? (
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AppPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function AppInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
      />
    </label>
  );
}

export function AppSelect({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <select
        {...props}
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
      >
        {children}
      </select>
    </label>
  );
}

export function AppTextarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <textarea
        {...props}
        className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
      />
    </label>
  );
}

export function AppButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition disabled:opacity-50",
        variant === "primary" && "bg-dark text-white hover:bg-dark-muted",
        variant === "secondary" &&
          "border border-border bg-background text-foreground hover:bg-muted",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AppError({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}
