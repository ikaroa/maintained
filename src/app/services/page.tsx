"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/ui/tab-bar";
import VoiceOverlay from "@/components/voice-overlay";

const services = [
  { name: "Plumbing", desc: "Repairs, installations & maintenance", icon: "M11.42 15.17l-5.84-3.38a1 1 0 01-.08-1.69l9.82-5.72a1 1 0 011.34.47l3.54 7.08a1 1 0 01-.47 1.34l-9.82 5.72a1 1 0 01-1.34-.47z" },
  { name: "Electrical", desc: "Wiring, sockets & lighting", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
  { name: "AC Service", desc: "Cleaning, gas top-up & repair", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  { name: "Cleaning", desc: "Deep clean, regular & move-in/out", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
  { name: "Painting", desc: "Interior & exterior painting", icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" },
  { name: "Handyman", desc: "General fixes & odd jobs", icon: "M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" },
];

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      <header className="px-6 pt-16 pb-2">
        <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest">Explore</p>
        <h1 className="text-[26px] font-semibold tracking-tight mt-1">Services</h1>
      </header>
      <div className="flex-1 px-5 pt-4 space-y-3 stagger">
        {services.map((s) => (
          <button key={s.name} className="card card-pressed w-full flex items-center gap-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-brand-blue/[0.06] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-brand-blue/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-brand-black/80">{s.name}</p>
              <p className="text-[12px] text-brand-black/35 mt-0.5">{s.desc}</p>
            </div>
            <svg className="w-4 h-4 text-brand-black/15 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        ))}
      </div>
      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
