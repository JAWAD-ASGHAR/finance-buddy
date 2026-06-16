import { format, parse, isValid } from "date-fns";
import type { ParsedExpenseText } from "@/types/finance";

const AMOUNT_PATTERNS = [
  /£\s*(\d+(?:\.\d{1,2})?)/i,
  /(\d+(?:\.\d{1,2})?)\s*(?:gbp|pounds?)/i,
  /^(\d+(?:\.\d{1,2})?)\b/,
  /\b(\d+(?:\.\d{1,2})?)\s*$/,
];

const DATE_PATTERNS: Array<{ regex: RegExp; parse: (match: RegExpMatchArray) => string | null }> = [
  {
    regex: /\b(\d{4}-\d{2}-\d{2})\b/,
    parse: (m) => m[1] ?? null,
  },
  {
    regex: /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
    parse: (m) => {
      const raw = m[1];
      if (!raw) return null;
      for (const fmt of ["d/M/yyyy", "d/M/yy", "dd/MM/yyyy"]) {
        const parsed = parse(raw, fmt, new Date());
        if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
      }
      return null;
    },
  },
  {
    regex: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    parse: () => format(new Date(), "yyyy-MM-dd"),
  },
  {
    regex: /\b(yesterday)\b/i,
    parse: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return format(d, "yyyy-MM-dd");
    },
  },
  {
    regex: /\b(today)\b/i,
    parse: () => format(new Date(), "yyyy-MM-dd"),
  },
];

export function parseExpenseText(raw: string): ParsedExpenseText {
  const text = raw.trim();
  let amountCents: number | null = null;
  let description = text;
  let expenseDate: string | null = null;

  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const parsed = Number.parseFloat(match[1]);
      if (!Number.isNaN(parsed) && parsed > 0) {
        amountCents = Math.round(parsed * 100);
        description = text.replace(match[0], "").trim();
        break;
      }
    }
  }

  for (const { regex, parse: parseDate } of DATE_PATTERNS) {
    const match = text.match(regex);
    if (match) {
      expenseDate = parseDate(match);
      if (expenseDate) {
        description = description.replace(match[0], "").trim();
      }
      break;
    }
  }

  description = description.replace(/\s+/g, " ").trim();

  if (!description && text) {
    description = text.replace(/£?\d+(?:\.\d{1,2})?/g, "").trim() || "Expense";
  }

  return { amountCents, description, expenseDate };
}

export function parseReceiptText(raw: string): ParsedExpenseText {
  const lines = raw
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const totalLine = lines.find((line) =>
    /total|amount due|balance/i.test(line),
  );
  const amountSource = totalLine ?? lines.join(" ");
  const parsed = parseExpenseText(amountSource);

  const merchantLine =
    lines.find((line) => !/total|tax|subtotal|change|card/i.test(line)) ??
    lines[0] ??
    "Receipt expense";

  return {
    amountCents: parsed.amountCents,
    description: merchantLine.slice(0, 120),
    expenseDate: parsed.expenseDate ?? format(new Date(), "yyyy-MM-dd"),
  };
}
