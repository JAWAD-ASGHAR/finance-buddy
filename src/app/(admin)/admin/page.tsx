import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminStats, getMonthlySignupCount } from "@/lib/admin/queries";

export default async function AdminPage() {
  const [stats, signupsThisMonth] = await Promise.all([
    getAdminStats(),
    getMonthlySignupCount(),
  ]);

  const statCards = [
    { label: "Total users", value: stats.totalUsers },
    { label: "Signups this month", value: signupsThisMonth },
    { label: "Budgets created", value: stats.totalBudgets },
    { label: "Expenses logged", value: stats.totalExpenses },
    { label: "Alerts generated", value: stats.totalAlerts },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Admin overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          System-level metrics only. Individual student budgets are not shown
          here — privacy by design.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent signups</CardTitle>
          <CardDescription>
            Latest accounts — no financial data exposed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display name</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No users yet.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.displayName ?? "—"}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? "Admin" : "Student"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
