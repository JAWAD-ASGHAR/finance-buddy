import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { getGeminiApiKey, getGeminiModel } from "@/lib/ai/env";
import { createAiToolsForUser } from "@/lib/ai/tools/executor";
import { getAuthUser } from "@/lib/supabase/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!checkRateLimit(user.id)) {
    return new Response("Rate limit exceeded. Try again in a minute.", {
      status: 429,
    });
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const messages = body.messages ?? [];
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    null;

  process.env.GOOGLE_GENERATIVE_AI_API_KEY = getGeminiApiKey();

  const result = streamText({
    model: google(getGeminiModel()),
    system: buildSystemPrompt(displayName),
    messages: await convertToModelMessages(messages),
    tools: createAiToolsForUser(user.id),
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}
