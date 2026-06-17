export const SKELETON_NAMES = {
  dashboard: "app-dashboard",
  expenses: "app-expenses",
  expenseForm: "app-expense-form",
  budgetForm: "app-budget-form",
  reports: "app-reports",
  profile: "app-settings",
  shared: "app-shared",
  friends: "app-friends",
  friendDetail: "app-friend-detail",
  sharedExpenseForm: "app-shared-expense-form",
  authForm: "auth-form",
  marketingHero: "marketing-hero",
} as const;

export type SkeletonName = (typeof SKELETON_NAMES)[keyof typeof SKELETON_NAMES];
