import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  label: string;
  className?: string;
  aspectRatio?: string;
};

export function ImagePlaceholder({
  label,
  className,
  aspectRatio = "aspect-[4/3]",
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "placeholder-skeleton rounded-2xl",
        aspectRatio,
        className,
      )}
      role="img"
      aria-label={label}
    >
      [Image Placeholder: {label}]
    </div>
  );
}
