import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { generateDailyReport, getReportForDate, getRecentReports, formatReportAsText } from "@/lib/reporting";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const dateStr = searchParams.get("date");

  if (action === "generate") {
    const date = dateStr ? new Date(dateStr) : new Date(Date.now() - 86400000); // yesterday
    const report = await generateDailyReport(date);
    if (!report) {
      return NextResponse.json({ message: "No activity to report for this date" });
    }
    return NextResponse.json(report);
  }

  if (action === "text" && dateStr) {
    const report = await getReportForDate(new Date(dateStr));
    if (!report) {
      return NextResponse.json({ message: "No report found for this date" });
    }
    const text = formatReportAsText(report);
    return new NextResponse(text, {
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (dateStr) {
    const report = await getReportForDate(new Date(dateStr));
    return NextResponse.json(report || { message: "No report found" });
  }

  // Default: return recent reports
  const days = parseInt(searchParams.get("days") || "7");
  const reports = await getRecentReports(days);
  return NextResponse.json(reports);
}
