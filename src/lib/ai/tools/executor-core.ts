import {
  confirmationRequiredMessage,
  createConfirmationToken,
  DESTRUCTIVE_TOOLS,
  validateConfirmationToken,
} from "@/lib/ai/tools/policy";
import { aiToolSchemas, type AiToolName } from "@/lib/ai/tools/definitions";
import {
  createMonthlyBudgetForUser,
  updateBudgetIncomeForUser,
} from "@/lib/services/budgets";
import {
  addExpenseForUser,
  addExpenseFromTextForUser,
  deleteAllUserDataForUser,
  deleteExpenseForUser,
  updateExpenseCategoryForUser,
} from "@/lib/services/expenses";
import { markAlertReadForUser } from "@/lib/services/alerts";
import { getSpendingReportForUser } from "@/lib/services/reports";
import { getDefaultReportDateRange } from "@/lib/finance/report-date-range";
import {
  listFriendsForUser,
  respondToFriendRequestForUser,
  sendFriendRequestByUsernameForUser,
} from "@/lib/services/friends";
import {
  createSharedExpenseForUser,
  deleteSharedExpenseForUser,
  listSharedExpensesForUser,
} from "@/lib/services/shared-expenses";
import {
  getFriendActivityForUser,
  getFriendBalancesForUser,
  recordSettlementForUser,
} from "@/lib/services/settlements";
import {
  getCurrentBudgetSnapshotForUser,
  getDashboardSnapshotForUser,
  getLatestReportSnapshotForUser,
  listAlertsForUser,
  listCategoriesForUser,
  listExpensesForUser,
} from "@/lib/services/reads";
import {
  revalidateBudgetPaths,
  revalidateExpensePaths,
  revalidateSharedPaths,
} from "@/lib/services/revalidate";

export type ToolExecutionContext = {
  userId: string;
  revalidate?: boolean;
};

function serializeResult(result: unknown): string {
  return JSON.stringify(result, null, 2);
}

function wrapServiceResult(result: {
  success: boolean;
  error?: string;
  data?: unknown;
}) {
  if (!result.success) {
    return { error: result.error ?? "Operation failed" };
  }
  return { success: true, data: result.data };
}

const WRITE_REVALIDATE: Partial<
  Record<AiToolName, (input?: Record<string, unknown>) => void>
> = {
  create_monthly_budget: () => revalidateBudgetPaths(),
  update_budget_income: () => revalidateBudgetPaths(),
  add_expense: () => revalidateExpensePaths(),
  add_expense_from_text: () => revalidateExpensePaths(),
  update_expense_category: () => revalidateExpensePaths(),
  delete_expense: () => revalidateExpensePaths(),
  delete_all_user_data: () => {
    revalidateBudgetPaths();
    revalidateExpensePaths();
  },
  mark_alert_read: () => revalidateBudgetPaths(),
  send_friend_request: () => revalidateSharedPaths(),
  respond_to_friend_request: () => revalidateSharedPaths(),
  create_shared_expense: () => {
    revalidateSharedPaths();
    revalidateExpensePaths();
  },
  delete_shared_expense: () => {
    revalidateSharedPaths();
    revalidateExpensePaths();
  },
  record_settlement: (input) =>
    revalidateSharedPaths(input?.friendId as string | undefined),
};

export async function executeAiTool(
  toolName: AiToolName,
  args: unknown,
  context: ToolExecutionContext,
): Promise<string> {
  const schema = aiToolSchemas[toolName];
  const parsed = schema.safeParse(args);

  if (!parsed.success) {
    return serializeResult({
      error: parsed.error.issues[0]?.message ?? "Invalid tool arguments",
    });
  }

  const { userId } = context;
  // Narrowed per-case at runtime by Zod; union type is impractical in switch.
  const toolInput = parsed.data as Record<string, unknown>;

  if (DESTRUCTIVE_TOOLS.has(toolName)) {
    const tokenField =
      "confirmationToken" in toolInput
        ? (toolInput.confirmationToken as string | undefined)
        : undefined;
    const { confirmationToken: _removed, ...payload } = toolInput;

    const validation = validateConfirmationToken(
      userId,
      toolName,
      payload,
      tokenField,
    );

    if (!validation.ok) {
      return confirmationRequiredMessage(
        toolName,
        `Confirm ${toolName.replace(/_/g, " ")}`,
      );
    }
  }

  let result: unknown;

  switch (toolName) {
    case "get_dashboard":
      result = await getDashboardSnapshotForUser(userId);
      break;
    case "get_current_budget":
      result = await getCurrentBudgetSnapshotForUser(userId);
      break;
    case "list_expenses":
      result = await listExpensesForUser(
        userId,
        (toolInput.limit as number | undefined) ?? 50,
      );
      break;
    case "list_categories":
      result = await listCategoriesForUser(userId);
      break;
    case "list_alerts":
      result = await listAlertsForUser(userId);
      break;
    case "list_friends":
      result = wrapServiceResult(await listFriendsForUser(userId));
      break;
    case "get_friend_balances":
      result = await getFriendBalancesForUser(userId);
      break;
    case "get_friend_activity":
      result = await getFriendActivityForUser(
        userId,
        toolInput.friendId as string,
      );
      break;
    case "list_shared_expenses":
      result = wrapServiceResult(await listSharedExpensesForUser(userId));
      break;
    case "get_latest_report": {
      const defaults = getDefaultReportDateRange();
      result = await getLatestReportSnapshotForUser(
        userId,
        (toolInput.startDate as string | undefined) ?? defaults.startDate,
        (toolInput.endDate as string | undefined) ?? defaults.endDate,
      );
      break;
    }
    case "create_monthly_budget":
      result = wrapServiceResult(
        await createMonthlyBudgetForUser(userId, toolInput as never),
      );
      break;
    case "update_budget_income":
      result = wrapServiceResult(
        await updateBudgetIncomeForUser(userId, toolInput as never),
      );
      break;
    case "add_expense":
      result = wrapServiceResult(
        await addExpenseForUser(userId, toolInput as never),
      );
      break;
    case "add_expense_from_text":
      result = wrapServiceResult(
        await addExpenseFromTextForUser(userId, toolInput as never),
      );
      break;
    case "update_expense_category":
      result = wrapServiceResult(
        await updateExpenseCategoryForUser(userId, toolInput as never),
      );
      break;
    case "mark_alert_read":
      result = wrapServiceResult(
        await markAlertReadForUser(userId, toolInput.alertId as string),
      );
      break;
    case "generate_monthly_report": {
      const defaults = getDefaultReportDateRange();
      result = wrapServiceResult(
        await getSpendingReportForUser(
          userId,
          (toolInput.startDate as string | undefined) ?? defaults.startDate,
          (toolInput.endDate as string | undefined) ?? defaults.endDate,
        ),
      );
      break;
    }
    case "send_friend_request":
      result = wrapServiceResult(
        await sendFriendRequestByUsernameForUser(
          userId,
          toolInput.username as string,
        ),
      );
      break;
    case "respond_to_friend_request":
      result = wrapServiceResult(
        await respondToFriendRequestForUser(
          userId,
          toolInput.requestId as string,
          toolInput.accept as boolean,
        ),
      );
      break;
    case "create_shared_expense":
      result = wrapServiceResult(
        await createSharedExpenseForUser(userId, toolInput as never),
      );
      break;
    case "record_settlement":
      result = wrapServiceResult(
        await recordSettlementForUser(userId, toolInput as never),
      );
      break;
    case "delete_expense":
      result = wrapServiceResult(
        await deleteExpenseForUser(userId, toolInput.expenseId as string),
      );
      break;
    case "delete_shared_expense":
      result = wrapServiceResult(
        await deleteSharedExpenseForUser(userId, toolInput.expenseId as string),
      );
      break;
    case "delete_all_user_data":
      result = wrapServiceResult(await deleteAllUserDataForUser(userId));
      break;
    case "request_destructive_confirmation": {
      if (!toolInput.userConfirmed) {
        result = {
          status: "awaiting_user_confirmation",
          message:
            "Ask the user to confirm in the chat UI before calling this tool with userConfirmed=true.",
        };
        break;
      }
      const token = createConfirmationToken(
        userId,
        toolInput.toolName as "delete_expense" | "delete_shared_expense" | "delete_all_user_data",
        toolInput.payload,
      );
      result = {
        status: "confirmed",
        confirmationToken: token,
        toolName: toolInput.toolName,
        expiresInSeconds: 300,
      };
      break;
    }
    default:
      result = { error: `Unknown tool: ${toolName}` };
  }

  if (context.revalidate !== false && toolName !== "request_destructive_confirmation") {
    WRITE_REVALIDATE[toolName]?.(toolInput);
  }

  return serializeResult(result);
}
