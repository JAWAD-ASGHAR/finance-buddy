import type { CategorySuggestion } from "@/types/finance";

export function CategorySuggestion({
  suggestion,
}: {
  suggestion: CategorySuggestion;
}) {
  const confidenceColor =
    suggestion.confidence === "high"
      ? "text-emerald-700"
      : suggestion.confidence === "medium"
        ? "text-amber-700"
        : "text-muted-foreground";

  return (
    <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
      <p>
        Suggested:{" "}
        <span className="font-medium">{suggestion.categoryName}</span>{" "}
        <span className={`text-xs uppercase ${confidenceColor}`}>
          ({suggestion.confidence} confidence)
        </span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{suggestion.reason}</p>
    </div>
  );
}
