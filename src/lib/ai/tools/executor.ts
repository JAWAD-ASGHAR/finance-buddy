import { tool, zodSchema } from "ai";
import {
  aiToolDescriptions,
  aiToolSchemas,
  type AiToolName,
} from "@/lib/ai/tools/definitions";
import { executeAiTool } from "@/lib/ai/tools/executor-core";

export { executeAiTool } from "@/lib/ai/tools/executor-core";

export function createAiToolsForUser(userId: string) {
  return Object.fromEntries(
    (Object.keys(aiToolSchemas) as AiToolName[]).map((name) => [
      name,
      tool({
        description: aiToolDescriptions[name],
        inputSchema: zodSchema(
          aiToolSchemas[name] as Parameters<typeof zodSchema>[0],
        ),
        execute: async (args: unknown) =>
          executeAiTool(name, args, { userId, revalidate: true }),
      }),
    ]),
  );
}
