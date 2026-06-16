export const CLICKABLE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label[for], summary, .cursor-pointer, [data-cursor-hover]';

const CTA_TEXT_MAX_LENGTH = 48;

function isInteractive(element: Element) {
  if (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return !element.disabled;
  }

  return element.getAttribute("aria-disabled") !== "true";
}

export function findClickableUnderCursor(
  clientX: number,
  clientY: number,
): Element | null {
  const center = document.elementFromPoint(clientX, clientY);
  const clickable = center?.closest(CLICKABLE_SELECTOR) ?? null;

  if (clickable && isInteractive(clickable)) {
    return clickable;
  }

  return null;
}

const SERVICE_LABELS: Record<string, string> = {
  "budget-setup": "Budget",
  "expense-tracking": "Log",
  "auto-categorize": "Category",
  "forecast-alerts": "Forecast",
  "savings-goals": "Save",
  "monthly-reports": "Report",
};

const NAV_LABELS: Record<string, string> = {
  "/": "Home",
  "/what-we-do": "Features",
  "/about": "About",
  "/contact": "Contact",
};

function resolveAriaLabelLabel(ariaLabel: string): string | null {
  const normalized = ariaLabel.trim().toLowerCase();

  if (normalized.includes("back to top")) return "Top";
  if (normalized.includes("previous")) return "Prev";
  if (normalized.includes("next")) return "Next";
  if (normalized.startsWith("close")) return "Close";
  if (normalized.startsWith("open")) return "Open";

  return null;
}

function resolveExpandedLabel(element: Element): string | null {
  const expanded = element.getAttribute("aria-expanded");
  if (expanded === "true") return "Close";
  if (expanded === "false") return "Open";
  return null;
}

function resolveCtaTextLabel(text: string): string | null {
  if (!text || text.length > CTA_TEXT_MAX_LENGTH) return null;

  if (text.startsWith("book") || text.includes("book a")) return "Book";
  if (text.includes("learn more")) return "Details";
  if (text.includes("view all") || text.includes("view our")) return "View all";
  if (text.includes("contact us") || text === "contact") return "Contact";
  if (text.includes("send") || text.includes("submit")) return "Send";
  if (text.includes("privacy") || text.includes("terms")) return "Policy";

  return null;
}

export function resolveCursorLabel(element: Element | null): string | null {
  if (!element) return null;

  const clickable = element.closest(CLICKABLE_SELECTOR);
  if (!clickable) return null;

  const explicit = clickable.getAttribute("data-cursor-label");
  if (explicit) return explicit;

  const expandedLabel = resolveExpandedLabel(clickable);
  if (expandedLabel) return expandedLabel;

  const ariaLabel = clickable.getAttribute("aria-label");
  if (ariaLabel) {
    const ariaLabelResult = resolveAriaLabelLabel(ariaLabel);
    if (ariaLabelResult) return ariaLabelResult;
  }

  const href = clickable.getAttribute("href") ?? "";

  for (const [id, label] of Object.entries(SERVICE_LABELS)) {
    if (href.includes(`#${id}`)) return label;
  }

  if (href.startsWith("tel:")) return "Call";
  if (href.startsWith("mailto:")) return "Email";

  const navLabel = NAV_LABELS[href.split("?")[0] ?? ""];
  if (navLabel) return navLabel;

  if (href.includes("/contact")) return "Contact";
  if (href.startsWith("#")) return "Jump";

  const text = clickable.textContent?.trim().toLowerCase() ?? "";
  const ctaLabel = resolveCtaTextLabel(text);
  if (ctaLabel) return ctaLabel;

  if (clickable.tagName === "INPUT" || clickable.tagName === "TEXTAREA") {
    return "Type";
  }

  if (clickable.tagName === "SELECT") {
    return "Choose";
  }

  if (clickable.tagName === "A") {
    return "Go";
  }

  return "Select";
}
