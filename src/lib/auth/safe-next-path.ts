export function safeNextPath(
  raw: string | null,
  fallback = "/dashboard",
): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return fallback;
}
