"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/ui/tab-bar";
import VoiceOverlay from "@/components/voice-overlay";

export default function PropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  if (status === "loading" || !session) return null;

  const properties = [
    { name: "Marina Residence Tower 1", unit: "Unit 1204", status: "Active", score: 72 },
    { name: "Downtown Views", unit: "Unit 503", status: "Active", score: 85 },
  ];

  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      <header className="px-6 pt-16 pb-2 flex items-start justify-between">
        <div>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest">Manage</p>
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
          <button key={p.name} className="card card-pressed w-full text-left">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[15px] font-semibold text-brand-black/85">{p.name}</p>
                <p className="text-[12px] text-brand-black/35 mt-0.5">{p.unit}</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-brand-blue/[0.06] text-brand-blue font-semibold">{p.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-brand-black/35 font-medium">Home Score</span>
                  <span className="text-[12px] font-bold text-brand-black/70">{p.score}/100</span>
                </div>
                <div className="h-[5px] rounded-full bg-brand-grey/50 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-blue to-brand-aqua rounded-full transition-all duration-1000" style={{ width: `${p.score}%` }} />
                </div>
              </div>
              <svg className="w-4 h-4 text-brand-black/15 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        ))}
      </div>
      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
