/**
 * Daily Reporting Layer
 * Logs voice interactions and generates daily summary reports.
 */

import { prisma } from "./prisma";

interface InteractionLog {
  userId: string;
  query: string;
  queryType: string;
  response: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
}

export async function logInteraction(log: InteractionLog) {
  return prisma.voiceInteraction.create({
    data: {
      userId: log.userId,
      query: log.query,
      queryType: log.queryType,
      response: log.response,
      duration: log.duration,
      success: log.success,
      errorMessage: log.errorMessage,
    },
  });
}

export async function generateDailyReport(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Total queries
  const totalQueries = await prisma.voiceInteraction.count({
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
  });

  if (totalQueries === 0) {
    return null; // No activity to report
  }

  // Unique users
  const uniqueUsersResult = await prisma.voiceInteraction.findMany({
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const uniqueUsers = uniqueUsersResult.length;

  // Average response time
  const avgResult = await prisma.voiceInteraction.aggregate({
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    _avg: { duration: true },
  });
  const avgResponseTime = Math.round(avgResult._avg.duration || 0);

  // Error count
  const errorCount = await prisma.voiceInteraction.count({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay },
      success: false,
    },
  });

  // Top query types
  const queryTypeCounts = await prisma.voiceInteraction.groupBy({
    by: ["queryType"],
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    _count: { queryType: true },
    orderBy: { _count: { queryType: "desc" } },
    take: 5,
  });
  const topQueryTypes = queryTypeCounts.map((q: { queryType: string; _count: { queryType: number } }) => ({
    type: q.queryType,
    count: q._count.queryType,
  }));

  // Peak hour
  const allInteractions = await prisma.voiceInteraction.findMany({
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    select: { createdAt: true },
  });
  const hourCounts = new Array(24).fill(0);
  for (const i of allInteractions) {
    hourCounts[i.createdAt.getHours()]++;
  }
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Save report
  const report = await prisma.dailyReport.upsert({
    where: { date: startOfDay },
    update: {
      totalQueries,
      uniqueUsers,
      avgResponseTime,
      errorCount,
      topQueryTypes: JSON.stringify(topQueryTypes),
      peakHour,
    },
    create: {
      date: startOfDay,
      totalQueries,
      uniqueUsers,
      avgResponseTime,
      errorCount,
      topQueryTypes: JSON.stringify(topQueryTypes),
      peakHour,
    },
  });

  return report;
}

export async function getReportForDate(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const report = await prisma.dailyReport.findUnique({
    where: { date: startOfDay },
  });

  if (!report) return null;

  return {
    ...report,
    topQueryTypes: JSON.parse(report.topQueryTypes),
  };
}

export async function getRecentReports(days: number = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.dailyReport.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "desc" },
  });
}

export function formatReportAsText(report: {
  date: Date;
  totalQueries: number;
  uniqueUsers: number;
  avgResponseTime: number;
  errorCount: number;
  topQueryTypes: { type: string; count: number }[];
  peakHour: number;
}): string {
  const dateStr = report.date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const queryTypes = report.topQueryTypes
    .map((q) => `  ${q.type}: ${q.count} queries`)
    .join("\n");

  return `
MAINTAINED AI - Daily Usage Report
====================================
Date: ${dateStr}

Summary:
  Total Queries: ${report.totalQueries}
  Unique Users: ${report.uniqueUsers}
  Avg Response Time: ${report.avgResponseTime}ms
  Errors: ${report.errorCount}
  Error Rate: ${((report.errorCount / report.totalQueries) * 100).toFixed(1)}%
  Peak Hour: ${String(report.peakHour).padStart(2, "0")}:00

Top Query Types:
${queryTypes}
====================================
  `.trim();
}
