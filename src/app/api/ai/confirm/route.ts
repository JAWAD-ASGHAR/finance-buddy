import { createConfirmationToken } from "@/lib/ai/tools/policy";
import { aiToolSchemas } from "@/lib/ai/tools/definitions";
import { getAuthUser } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    toolName?: keyof typeof aiToolSchemas;
    payload?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { toolName, payload } = body;

  if (
    !toolName ||
    !["delete_expense", "delete_shared_expense", "delete_all_user_data"].includes(
      toolName,
    )
  ) {
    return Response.json({ error: "Invalid tool name" }, { status: 400 });
  }

  const schema = aiToolSchemas[toolName];
  const parsed = schema.safeParse({ ...payload, confirmationToken: undefined });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const { confirmationToken: _ignored, ...cleanPayload } = parsed.data as Record<
    string,
    unknown
  >;

  const token = createConfirmationToken(user.id, toolName, cleanPayload);

  return Response.json({
    confirmationToken: token,
    toolName,
    expiresInSeconds: 300,
  });
}
