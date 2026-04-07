"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Report {
  id: string;
  date: string;
  totalQueries: number;
  uniqueUsers: number;
  avgResponseTime: number;
  errorCount: number;
  topQueryTypes: string;
  peakHour: number;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/reports?days=30")
        .then((r) => r.json())
        .then((data) => {
          setReports(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  async function generateReport() {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    await fetch(`/api/reports?action=generate&date=${yesterday}`);
    // Refresh
    const res = await fetch("/api/reports?days=30");
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <div className="text-white">Loading reports...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <header className="border-b border-brand-blue px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">MAINTAINED</h1>
          <p className="text-sm text-gray-400">Daily Reports</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            Voice Assistant
          </a>
          <button
            onClick={generateReport}
            className="text-sm bg-brand-gold hover:bg-brand-gold/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            Generate Report
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No reports yet.</p>
            <p className="text-gray-500 mt-2">Reports are generated daily based on voice assistant usage.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            {reports[0] && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  label="Queries Today"
                  value={String(reports[0].totalQueries)}
                />
                <StatCard
                  label="Active Users"
                  value={String(reports[0].uniqueUsers)}
                />
                <StatCard
                  label="Avg Response"
                  value={`${reports[0].avgResponseTime}ms`}
                />
                <StatCard
                  label="Error Rate"
                  value={`${((reports[0].errorCount / Math.max(reports[0].totalQueries, 1)) * 100).toFixed(1)}%`}
                />
              </div>
            )}

            {/* Reports Table */}
            <div className="bg-brand-blue/40 rounded-xl border border-brand-blue overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-blue text-gray-400">
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-right">Queries</th>
                    <th className="px-6 py-3 text-right">Users</th>
                    <th className="px-6 py-3 text-right">Avg Response</th>
                    <th className="px-6 py-3 text-right">Errors</th>
                    <th className="px-6 py-3 text-right">Peak Hour</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const queryTypes = (() => {
                      try {
                        return JSON.parse(report.topQueryTypes);
                      } catch {
                        return [];
                      }
                    })();
                    return (
                      <tr key={report.id} className="border-b border-brand-blue/50 hover:bg-gray-800/30">
                        <td className="px-6 py-3">
                          {new Date(report.date).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="px-6 py-3 text-right">{report.totalQueries}</td>
                        <td className="px-6 py-3 text-right">{report.uniqueUsers}</td>
                        <td className="px-6 py-3 text-right">{report.avgResponseTime}ms</td>
                        <td className="px-6 py-3 text-right">
                          <span className={report.errorCount > 0 ? "text-red-400" : "text-green-400"}>
                            {report.errorCount}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {String(report.peakHour).padStart(2, "0")}:00
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-blue/40 rounded-xl border border-brand-blue p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
