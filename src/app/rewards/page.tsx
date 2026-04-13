"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/ui/tab-bar";
import VoiceOverlay from "@/components/voice-overlay";

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  if (status === "loading" || !session) return null;

  const rewards = [
    { name: "Free AC Service", points: 500, available: true },
    { name: "10% Off Deep Clean", points: 200, available: true },
    { name: "Priority Booking", points: 800, available: true },
    { name: "Free Annual Inspection", points: 2000, available: false },
  ];

  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      <header className="px-6 pt-16 pb-2">
        <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest">Loyalty</p>
        <h1 className="text-[26px] font-semibold tracking-tight mt-1">Rewards</h1>
      </header>
      <div className="flex-1 px-5 pt-4 space-y-4 stagger">
        {/* Points hero */}
        <div className="rounded-[20px] bg-gradient-to-br from-brand-blue to-brand-black p-6 text-white shadow-lg shadow-brand-blue/10">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium mb-1">Your Points</p>
          <p className="text-[40px] font-bold leading-none tracking-tight">1,240</p>
          <p className="text-[13px] text-white/40 mt-1.5 font-medium">Gold Tier Member</p>
          <div className="mt-5 h-[5px] rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-gold/80 to-brand-gold rounded-full" style={{ width: "62%" }} />
          </div>
          <p className="text-[11px] text-white/25 mt-2 font-medium">760 points to Platinum</p>
        </div>

        {/* Rewards */}
        <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest pt-2 px-1">Available Rewards</p>
        {rewards.map((r) => (
          <div key={r.name} className={`card flex items-center justify-between ${!r.available ? "opacity-40" : ""}`}>
            <div>
              <p className="text-[14px] font-semibold text-brand-black/80">{r.name}</p>
              <p className="text-[12px] text-brand-gold font-semibold mt-0.5">{r.points} points</p>
            </div>
            <button className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-95 ${
              r.available
                ? "bg-brand-gold/10 text-brand-gold"
                : "bg-brand-grey/50 text-brand-black/25"
            }`}>
              {r.available ? "Redeem" : "Locked"}
            </button>
          </div>
        ))}
      </div>
      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
