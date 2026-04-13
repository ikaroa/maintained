"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/ui/tab-bar";
import VoiceOverlay from "@/components/voice-overlay";

interface Reward {
  id: string;
  name: string;
  points: number;
  description: string;
}

interface RedeemedReward {
  id: string;
  name: string;
  points: number;
  date: string;
}

const availableRewards: Reward[] = [
  { id: "r1", name: "Free AC Service", points: 500, description: "One complimentary AC cleaning and gas top-up for any property" },
  { id: "r2", name: "10% Off Deep Clean", points: 200, description: "Discount on full property deep cleaning service" },
  { id: "r3", name: "Priority Booking", points: 800, description: "Skip the queue — get next-day service for any booking" },
  { id: "r4", name: "Free Annual Inspection", points: 2000, description: "Comprehensive property inspection covering all systems" },
  { id: "r5", name: "Free Handyman Visit", points: 300, description: "One hour of general handyman work at no charge" },
];

function getTier(points: number) {
  if (points >= 2000) return { name: "Elite", next: null, nextPoints: 0, color: "text-brand-blue" };
  if (points >= 1500) return { name: "Platinum", next: "Elite", nextPoints: 2000, color: "text-brand-aqua" };
  if (points >= 1000) return { name: "Gold", next: "Platinum", nextPoints: 1500, color: "text-brand-gold" };
  if (points >= 500) return { name: "Silver", next: "Gold", nextPoints: 1000, color: "text-white/60" };
  return { name: "Bronze", next: "Silver", nextPoints: 500, color: "text-brand-gold/60" };
}

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [points, setPoints] = useState(1240);
  const [redeemed, setRedeemed] = useState<RedeemedReward[]>([
    { id: "rh1", name: "10% Off Deep Clean", points: 200, date: "5 Mar 2026" },
  ]);
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tab, setTab] = useState<"available" | "history">("available");

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  if (status === "loading" || !session) return null;

  const tier = getTier(points);

  function handleRedeem(reward: Reward) {
    if (points < reward.points) return;
    setPoints(prev => prev - reward.points);
    setRedeemed(prev => [
      { id: `rh${Date.now()}`, name: reward.name, points: reward.points, date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
      ...prev,
    ]);
    setConfirmReward(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  }

  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      <div className="flex items-center justify-center pt-12 pb-0">
        <img src="/logo.svg" alt="Maintained" className="h-[18px]" style={{ filter: "brightness(0) saturate(100%) invert(17%) sepia(20%) saturate(1200%) hue-rotate(160deg) brightness(95%) contrast(95%)" }} />
      </div>
      <header className="px-6 pt-3 pb-3">
        <h1 className="text-[26px] font-semibold tracking-tight">Rewards</h1>
      </header>

      <div className="flex-1 px-5 space-y-4 stagger">
        {/* Points hero */}
        <div className="rounded-[20px] bg-gradient-to-br from-brand-blue to-brand-black p-6 text-white shadow-lg shadow-brand-blue/10">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium mb-1">Your Points</p>
          <p className="text-[40px] font-bold leading-none tracking-tight">{points.toLocaleString()}</p>
          <p className={`text-[13px] mt-1.5 font-medium ${tier.color}`}>{tier.name} Tier Member</p>
          {tier.next && (
            <>
              <div className="mt-5 h-[5px] rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-gold/80 to-brand-gold rounded-full transition-all duration-700" style={{ width: `${(points / tier.nextPoints) * 100}%` }} />
              </div>
              <p className="text-[11px] text-white/25 mt-2 font-medium">{tier.nextPoints - points} points to {tier.next}</p>
            </>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex bg-brand-black/[0.04] rounded-xl p-1">
          <button
            onClick={() => setTab("available")}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              tab === "available" ? "bg-white text-brand-black shadow-sm" : "text-brand-black/35"
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              tab === "history" ? "bg-white text-brand-black shadow-sm" : "text-brand-black/35"
            }`}
          >
            History ({redeemed.length})
          </button>
        </div>

        {tab === "available" ? (
          availableRewards.map((r) => {
            const canAfford = points >= r.points;
            return (
              <div key={r.id} className={`card ${!canAfford ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-[14px] font-semibold text-brand-black/80">{r.name}</p>
                    <p className="text-[12px] text-brand-black/35 mt-0.5">{r.description}</p>
                    <p className="text-[13px] text-brand-gold font-semibold mt-2">{r.points} points</p>
                  </div>
                  <button
                    onClick={() => canAfford && setConfirmReward(r)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-95 shrink-0 ${
                      canAfford
                        ? "bg-brand-gold/10 text-brand-gold"
                        : "bg-brand-grey/50 text-brand-black/20"
                    }`}
                  >
                    {canAfford ? "Redeem" : `Need ${r.points - points} more`}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          redeemed.length === 0 ? (
            <div className="text-center pt-12">
              <p className="text-brand-black/30 text-[14px]">No rewards redeemed yet</p>
            </div>
          ) : (
            redeemed.map((r) => (
              <div key={r.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-brand-black/80">{r.name}</p>
                    <p className="text-[12px] text-brand-black/35 mt-0.5">{r.date}</p>
                  </div>
                  <span className="text-[12px] text-brand-black/25 font-medium">-{r.points} pts</span>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Confirmation modal */}
      {confirmReward && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmReward(null)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-fade-slide-up">
            <div className="w-10 h-1 bg-brand-black/10 rounded-full mx-auto mb-6" />
            <h3 className="text-[17px] font-semibold mb-2">Redeem {confirmReward.name}?</h3>
            <p className="text-[13px] text-brand-black/45 mb-1">{confirmReward.description}</p>
            <p className="text-[14px] font-semibold text-brand-gold mb-6">{confirmReward.points} points will be deducted</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReward(null)}
                className="flex-1 py-3.5 rounded-2xl bg-brand-black/[0.04] text-brand-black/60 text-[13px] font-semibold active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRedeem(confirmReward)}
                className="flex-1 py-3.5 rounded-2xl bg-brand-gold text-brand-black text-[13px] font-semibold active:scale-[0.98] transition-transform"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-blue text-white px-6 py-3 rounded-2xl shadow-xl animate-fade-slide-up flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span className="text-[13px] font-semibold">Reward Redeemed!</span>
        </div>
      )}

      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
