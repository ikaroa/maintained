import { NextResponse } from "next/server";
import { generateDailyReport, formatReportAsText, getReportForDate } from "@/lib/reporting";

/**
 * Cron endpoint for generating daily reports.
 * Call this via a cron job each morning (e.g., 6 AM):
 *   curl -X POST https://your-domain.com/api/reports/cron \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function POST(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const yesterday = new Date(Date.now() - 86400000);
  yesterday.setHours(0, 0, 0, 0);

  // Generate the report
  const report = await generateDailyReport(yesterday);

  if (!report) {
    return NextResponse.json({ message: "No activity yesterday, no report generated." });
  }

  // Fetch the formatted report
  const fullReport = await getReportForDate(yesterday);
  const text = fullReport ? formatReportAsText(fullReport) : "Report generated but could not be formatted.";

  // TODO: Send email or post to dashboard
  // For now, return the report text
  console.log("Daily Report Generated:\n", text);

  return NextResponse.json({
    message: "Daily report generated successfully",
    report: fullReport,
  });
}
