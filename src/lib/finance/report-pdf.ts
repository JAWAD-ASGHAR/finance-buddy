import type { MonthlyReportSummary } from "@/types/finance";
import type { ReportPeriodPreset } from "@/lib/finance/report-date-range";
import { getReportPresetLabel } from "@/lib/finance/report-date-range";
import { format } from "date-fns";

type FormatMoney = (cents: number) => string;

function formatRemainingLabel(
  remainingCents: number,
  formatMoney: FormatMoney,
): string {
  if (remainingCents >= 0) {
    return `${formatMoney(remainingCents)} remaining`;
  }

  return `${formatMoney(Math.abs(remainingCents))} over budget`;
}

function formatPercentUsed(spentCents: number, allocatedCents: number): string {
  if (allocatedCents <= 0) {
    return spentCents > 0 ? "Over limit" : "—";
  }

  const percent = Math.round((spentCents / allocatedCents) * 100);
  return percent > 100 ? `${percent}% (over)` : `${percent}%`;
}

export async function downloadSpendingReportPdf({
  summary,
  formatMoney,
  preset,
}: {
  summary: MonthlyReportSummary;
  formatMoney: FormatMoney;
  preset: ReportPeriodPreset;
}) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 18;

  doc.setFillColor(22, 101, 52);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Finance Buddy", margin, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(getReportPresetLabel(preset), margin, 22);

  doc.setTextColor(30, 30, 30);
  y = 38;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Spending Report", margin, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Period: ${summary.periodLabel}`, margin, y);
  y += 5;
  doc.text(`Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}`, margin, y);

  y += 10;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: 255,
      fontStyle: "bold",
    },
    head: [["Metric", "Amount"]],
    body: [
      ["Monthly income", formatMoney(summary.incomeCents)],
      ["Total spent", formatMoney(summary.totalSpentCents)],
      ["Balance", formatRemainingLabel(summary.remainingCents, formatMoney)],
    ],
    margin: { left: margin, right: margin },
  });

  y = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY
    ? ((doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 12)
    : y + 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text("Category breakdown", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y + 4,
    theme: "striped",
    headStyles: {
      fillColor: [39, 39, 42],
      textColor: 255,
      fontStyle: "bold",
    },
    head: [["Category", "Spent", "Budget", "Used"]],
    body:
      summary.categoryBreakdown.length > 0
        ? summary.categoryBreakdown.map((category) => [
            category.name,
            formatMoney(category.spentCents),
            formatMoney(category.allocatedCents),
            formatPercentUsed(category.spentCents, category.allocatedCents),
          ])
        : [["No spending recorded", "—", "—", "—"]],
    margin: { left: margin, right: margin },
  });

  y = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY
    ? ((doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 12)
    : y + 40;

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Forecast", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const forecastLines = [
    `Month-to-date spend: ${formatMoney(summary.forecast.spentToDateCents)}`,
    `Daily burn rate: ${formatMoney(summary.forecast.dailyBurnRateCents)}`,
    summary.forecast.onTrack
      ? `On track to finish ${formatMoney(summary.forecast.projectedEndBalanceCents)} under budget.`
      : `At current pace, projected ${formatMoney(Math.abs(summary.forecast.projectedEndBalanceCents))} over budget.`,
  ];

  for (const line of forecastLines) {
    doc.text(line, margin, y);
    y += 5;
  }

  y += 6;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text("Insights", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  for (const insight of summary.insights) {
    const lines = doc.splitTextToSize(`• ${insight}`, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(summary.disclaimer, margin, footerY, {
    maxWidth: pageWidth - margin * 2,
  });

  const slug = summary.periodLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  doc.save(`finance-buddy-${preset}-report-${slug || "export"}.pdf`);
}
