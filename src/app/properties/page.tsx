"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/ui/tab-bar";
import TopBar from "@/components/ui/top-bar";
import VoiceOverlay from "@/components/voice-overlay";

interface Property {
  id: string;
  name: string;
  unit: string;
  image: string;
  status: "Active" | "Pending" | "Inactive";
  score: number;
  type: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lastInspection: string;
  nextService: string;
  reports: {
    id: string;
    title: string;
    date: string;
    type: "Inspection" | "Repair" | "Service" | "Emergency";
    status: "Completed" | "In Progress" | "Scheduled";
    engineer: string;
    cost?: string;
    summary: string;
  }[];
}

const properties: Property[] = [
  {
    id: "1",
    name: "Marina Residence Tower 1",
    unit: "Unit 1204",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    status: "Active",
    score: 72,
    type: "Apartment",
    area: "Dubai Marina",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1450,
    lastInspection: "12 Mar 2026",
    nextService: "28 Apr 2026",
    reports: [
      { id: "r1", title: "AC Unit Servicing", date: "12 Mar 2026", type: "Service", status: "Completed", engineer: "Ahmed K.", cost: "AED 350", summary: "Full AC service completed. Filters replaced, gas topped up. System running at optimal efficiency." },
      { id: "r2", title: "Plumbing — Kitchen Leak", date: "28 Feb 2026", type: "Repair", status: "Completed", engineer: "James T.", cost: "AED 220", summary: "Fixed leaking pipe under kitchen sink. Replaced worn washer and tightened connections." },
      { id: "r3", title: "Annual Property Inspection", date: "15 Feb 2026", type: "Inspection", status: "Completed", engineer: "Sarah M.", summary: "General condition: Good. Minor paint touch-ups recommended in hallway. All systems operational." },
      { id: "r4", title: "Electrical — Socket Replacement", date: "5 Jan 2026", type: "Repair", status: "Completed", engineer: "Omar H.", cost: "AED 180", summary: "Replaced faulty socket in master bedroom. Tested all circuits, no further issues found." },
      { id: "r5", title: "Deep Cleaning", date: "22 Apr 2026", type: "Service", status: "Scheduled", engineer: "TBC", summary: "Scheduled full property deep clean including kitchen, bathrooms, and balcony." },
    ],
  },
  {
    id: "2",
    name: "Downtown Views",
    unit: "Unit 503",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    status: "Active",
    score: 85,
    type: "Apartment",
    area: "Downtown Dubai",
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2100,
    lastInspection: "20 Mar 2026",
    nextService: "15 Apr 2026",
    reports: [
      { id: "r6", title: "Quarterly Inspection", date: "20 Mar 2026", type: "Inspection", status: "Completed", engineer: "Sarah M.", summary: "Excellent condition. All appliances functioning. Recommended seal replacement on balcony door within 3 months." },
      { id: "r7", title: "Water Heater Replacement", date: "10 Mar 2026", type: "Repair", status: "Completed", engineer: "Ahmed K.", cost: "AED 2,400", summary: "Replaced 15L water heater with new energy-efficient unit. Old unit was 8 years old, showing corrosion." },
      { id: "r8", title: "Painting — Touch Up", date: "1 Mar 2026", type: "Service", status: "Completed", engineer: "Ravi P.", cost: "AED 600", summary: "Repainted living room accent wall and touched up hallway scuffs. Color-matched to original specification." },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "bg-brand-blue/[0.06] text-brand-blue",
    Pending: "bg-brand-gold/10 text-brand-gold",
    Inactive: "bg-brand-black/[0.06] text-brand-black/40",
    Completed: "bg-brand-blue/[0.06] text-brand-blue",
    "In Progress": "bg-brand-gold/10 text-brand-gold",
    Scheduled: "bg-brand-aqua/15 text-brand-blue/70",
  };
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${colors[status] || "bg-brand-grey text-brand-black/40"}`}>
      {status}
    </span>
  );
}

function ReportTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Inspection: "bg-brand-blue/[0.06] text-brand-blue",
    Repair: "bg-red-50 text-red-600",
    Service: "bg-brand-gold/10 text-brand-gold",
    Emergency: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${colors[type] || "bg-brand-grey text-brand-black/40"}`}>
      {type}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[13px] text-brand-black/40">{label}</span>
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
}

export default function PropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  if (status === "loading" || !session) return null;

  // Property detail view
  if (selectedProperty) {
    const p = selectedProperty;
    return (
      <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-6">
        {/* Hero image */}
        <div className="relative h-56 overflow-hidden">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-brand-black/20" />
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-14 left-5 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-brand-black/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">{p.name}</h1>
                <p className="text-sm text-white/60 mt-0.5">{p.unit} · {p.area}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 pt-5 space-y-5">
          {/* Score card */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-brand-black/70">Home Status Score</p>
              <p className="text-[22px] font-bold">{p.score}<span className="text-sm text-brand-black/25 font-medium">/100</span></p>
            </div>
            <div className="h-[6px] rounded-full bg-brand-grey/50 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-blue to-brand-aqua rounded-full transition-all duration-1000" style={{ width: `${p.score}%` }} />
            </div>
          </div>

          {/* Property details */}
          <div className="card">
            <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-2">Property Details</p>
            <InfoRow label="Type" value={p.type} />
            <div className="border-t border-brand-black/[0.04]" />
            <InfoRow label="Bedrooms" value={String(p.bedrooms)} />
            <div className="border-t border-brand-black/[0.04]" />
            <InfoRow label="Bathrooms" value={String(p.bathrooms)} />
            <div className="border-t border-brand-black/[0.04]" />
            <InfoRow label="Area" value={`${p.sqft.toLocaleString()} sqft`} />
            <div className="border-t border-brand-black/[0.04]" />
            <InfoRow label="Location" value={p.area} />
          </div>

          {/* Service timeline */}
          <div className="card">
            <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-2">Service Timeline</p>
            <InfoRow label="Last Inspection" value={p.lastInspection} />
            <div className="border-t border-brand-black/[0.04]" />
            <InfoRow label="Next Service" value={p.nextService} />
          </div>

          {/* Reports */}
          <div>
            <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3 px-1">
              Maintenance Reports ({p.reports.length})
            </p>
            <div className="space-y-3">
              {p.reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                  className="card card-pressed w-full text-left"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[14px] font-semibold text-brand-black/80">{report.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <ReportTypeBadge type={report.type} />
                        <span className="text-[11px] text-brand-black/30">{report.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={report.status} />
                      <svg className={`w-4 h-4 text-brand-black/15 transition-transform duration-300 ${expandedReport === report.id ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <div className={`overflow-hidden transition-all duration-300 ${expandedReport === report.id ? "max-h-40 mt-3 pt-3 border-t border-brand-black/[0.04]" : "max-h-0"}`}>
                    <p className="text-[12px] text-brand-black/50 leading-relaxed mb-2">{report.summary}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-[11px] text-brand-black/30">
                        <span className="text-brand-black/50">Engineer:</span> {report.engineer}
                      </p>
                      {report.cost && (
                        <p className="text-[11px] text-brand-black/30">
                          <span className="text-brand-black/50">Cost:</span> {report.cost}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Properties list view
  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      <TopBar />
      <header className="px-6 pt-2 pb-2 flex items-start justify-between">
        <div>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest">Portfolio</p>
          <h1 className="text-[26px] font-semibold tracking-tight mt-1">Properties</h1>
        </div>
        <button className="mt-2 w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20 active:scale-95 transition-transform">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </header>

      <div className="flex-1 px-5 pt-4 space-y-4 stagger">
        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProperty(p)}
            className="card card-pressed w-full text-left overflow-hidden !p-0"
          >
            {/* Property image */}
            <div className="relative h-40 overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 to-transparent" />
              <div className="absolute top-3 right-3">
                <StatusBadge status={p.status} />
              </div>
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-semibold text-[15px]">{p.name}</p>
                <p className="text-white/60 text-[12px] mt-0.5">{p.unit} · {p.area}</p>
              </div>
            </div>

            {/* Info bar */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-[12px] text-brand-black/40">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    {p.bedrooms} bed · {p.bathrooms} bath
                  </span>
                  <span>{p.sqft.toLocaleString()} sqft</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold">{p.score}</span>
                  <span className="text-[10px] text-brand-black/25">/100</span>
                </div>
              </div>

              <div className="h-[4px] rounded-full bg-brand-grey/50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-blue to-brand-aqua rounded-full" style={{ width: `${p.score}%` }} />
              </div>

              <div className="flex items-center justify-between mt-3 text-[11px] text-brand-black/30">
                <span>{p.reports.length} reports</span>
                <span>Next: {p.nextService}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
