/** Server-only Gemini configuration. */

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return key;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

export function getConfirmationSecret(): string {
  return process.env.AI_CONFIRMATION_SECRET ?? getGeminiApiKey();
}
