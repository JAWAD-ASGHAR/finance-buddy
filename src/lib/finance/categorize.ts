const KEYWORD_RULES: Array<{ keywords: string[]; categoryName: string }> = [
  {
    keywords: [
      "uber",
      "lyft",
      "bus",
      "train",
      "tube",
      "metro",
      "taxi",
      "fuel",
      "petrol",
      "parking",
      "bolt",
    ],
    categoryName: "Transport",
  },
  {
    keywords: [
      "netflix",
      "spotify",
      "disney",
      "apple",
      "subscription",
      "prime",
      "hulu",
      "xbox",
      "playstation",
      "gym",
    ],
    categoryName: "Subscriptions",
  },
  {
    keywords: [
      "tesco",
      "sainsbury",
      "asda",
      "aldi",
      "lidl",
      "waitrose",
      "morrisons",
      "co-op",
      "coffee",
      "cafe",
      "starbucks",
      "costa",
      "deliveroo",
      "ubereats",
      "just eat",
      "justeat",
      "food",
      "lunch",
      "dinner",
      "breakfast",
      "grocer",
      "restaurant",
    ],
    categoryName: "Food",
  },
  {
    keywords: [
      "amazon",
      "ebay",
      "asos",
      "zara",
      "h&m",
      "shop",
      "store",
      "clothes",
      "shopping",
    ],
    categoryName: "Shopping",
  },
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function scoreCategory(
  description: string,
  categoryName: string,
): { score: number; matchedKeyword: string | null } {
  const normalized = normalize(description);
  const rule = KEYWORD_RULES.find((r) => r.categoryName === categoryName);
  if (!rule) return { score: 0, matchedKeyword: null };

  for (const keyword of rule.keywords) {
    if (normalized.includes(keyword)) {
      return { score: keyword.length + 10, matchedKeyword: keyword };
    }
  }

  return { score: 0, matchedKeyword: null };
}

export function suggestCategory(
  description: string,
  categories: Array<{ id: string; name: string }>,
  pastExpenses: Array<{
    description: string;
    category_id: string;
    user_corrected: boolean;
  }>,
): {
  categoryId: string;
  categoryName: string;
  confidence: "high" | "medium" | "low";
  reason: string;
} {
  const normalized = normalize(description);
  const scores = new Map<string, { score: number; reason: string }>();

  for (const category of categories) {
    const { score, matchedKeyword } = scoreCategory(
      description,
      category.name,
    );
    if (score > 0 && matchedKeyword) {
      scores.set(category.id, {
        score,
        reason: `Matched keyword "${matchedKeyword}" → ${category.name}`,
      });
    }
  }

  for (const past of pastExpenses) {
    if (!past.user_corrected && past.description.length < 3) continue;
    const pastNorm = normalize(past.description);
    if (
      pastNorm.includes(normalized) ||
      normalized.includes(pastNorm) ||
      shareSignificantWord(normalized, pastNorm)
    ) {
      const existing = scores.get(past.category_id);
      const boost = past.user_corrected ? 15 : 8;
      const category = categories.find((c) => c.id === past.category_id);
      scores.set(past.category_id, {
        score: (existing?.score ?? 0) + boost,
        reason: category
          ? past.user_corrected
            ? `You previously corrected similar entries to ${category.name}`
            : `Similar past expense categorized as ${category.name}`
          : "Based on your history",
      });
    }
  }

  let bestId = categories[0]?.id ?? "";
  let bestScore = 0;
  let bestReason = "Default category";

  for (const [id, { score, reason }] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
      bestReason = reason;
    }
  }

  const bestCategory =
    categories.find((c) => c.id === bestId) ?? categories[0];

  if (!bestCategory) {
    throw new Error("No categories available for suggestion");
  }

  const confidence: "high" | "medium" | "low" =
    bestScore >= 20 ? "high" : bestScore >= 10 ? "medium" : "low";

  if (bestScore === 0) {
    return {
      categoryId: bestCategory.id,
      categoryName: bestCategory.name,
      confidence: "low",
      reason: `No strong match — defaulted to ${bestCategory.name}`,
    };
  }

  return {
    categoryId: bestCategory.id,
    categoryName: bestCategory.name,
    confidence,
    reason: bestReason,
  };
}

function shareSignificantWord(a: string, b: string): boolean {
  const wordsA = a.split(/\s+/).filter((w) => w.length > 3);
  const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 3));
  return wordsA.some((word) => wordsB.has(word));
}
