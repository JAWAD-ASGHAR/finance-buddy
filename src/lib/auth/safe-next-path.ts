function isSafeRelativePath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return false;
  }

  if (path.includes("://") || path.includes("@")) {
    return false;
  }

  try {
    const decoded = decodeURIComponent(path);
    if (
      decoded.startsWith("//") ||
      decoded.includes("://") ||
      decoded.includes("\\")
    ) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

export function safeNextPath(
  raw: string | null,
  fallback = "/dashboard",
): string {
  if (raw && isSafeRelativePath(raw)) {
    return raw;
  }
  return fallback;
}
