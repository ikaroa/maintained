"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/ui/tab-bar";
import VoiceOverlay from "@/components/voice-overlay";

function AnimatedMenuIcon({ isOpen, className = "w-5 h-5" }: { isOpen: boolean; className?: string }) {
  return (
    <div className={`${className} flex flex-col justify-center items-start gap-[5px]`}>
      <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] origin-center ${
        isOpen ? "w-[18px] translate-y-[6.5px] rotate-45" : "w-3"
      }`} />
      <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)] ${
        isOpen ? "w-[18px] opacity-0 translate-x-2" : "w-[18px] opacity-100"
      }`} />
      <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] origin-center ${
        isOpen ? "w-[18px] -translate-y-[6.5px] -rotate-45" : "w-[18px]"
      }`} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <img src="/logo.svg" alt="Maintained" className="h-8 opacity-30 animate-pulse" />
      </div>
    );
  }

  if (!session) return null;

  const userName = session.user?.name || session.user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      {/* Fullscreen menu */}
      <div
        className={`fixed inset-0 z-50 flex flex-col transition-all duration-600 ease-[cubic-bezier(0.77,0,0.18,1)] ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className={`absolute inset-0 bg-brand-black transition-transform duration-600 ease-[cubic-bezier(0.77,0,0.18,1)] origin-top ${
          menuOpen ? "scale-y-100" : "scale-y-0"
        }`} />
        <div className="relative z-10 h-[72px]" />
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 max-w-sm mx-auto w-full">
          <nav className="space-y-1">
            {[
              { href: "/", label: "Home", delay: 120 },
              { href: "/services", label: "Services", delay: 170 },
              { href: "/rewards", label: "Rewards", delay: 220 },
              { href: "/properties", label: "Properties", delay: 270 },
              { href: "/reports", label: "Reports", delay: 320 },
              { href: "/settings", label: "Settings", delay: 370 },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3.5 rounded-2xl text-[22px] font-light tracking-wide text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: menuOpen ? `${item.delay}ms` : "0ms" }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className={`relative z-10 px-10 pb-12 max-w-sm mx-auto w-full transition-all duration-500 ${
          menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`} style={{ transitionDelay: menuOpen ? "400ms" : "0ms" }}>
          <div className="border-t border-white/[0.06] pt-5">
            <p className="text-xs text-white/20 px-4 mb-3">{session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-white/25 text-sm hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Top bar: menu + logo + actions */}
      <header className="relative z-[60] px-5 pt-12 pb-0 flex items-center justify-between">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition-transform z-[60] relative"
        >
          <AnimatedMenuIcon isOpen={menuOpen} className={`w-5 h-5 transition-colors duration-500 ${menuOpen ? "text-white" : "text-brand-blue"}`} />
        </button>
        <img
          src="/logo.svg"
          alt="Maintained"
          className={`h-[18px] transition-all duration-500 ${menuOpen ? "brightness-0 invert" : ""}`}
          style={menuOpen ? undefined : { filter: "brightness(0) saturate(100%) invert(17%) sepia(20%) saturate(1200%) hue-rotate(160deg) brightness(95%) contrast(95%)" }}
        />
        <button className={`relative w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition-all duration-500 ${menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <svg className="w-[18px] h-[18px] text-brand-blue/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full" />
        </button>
      </header>

      {/* Greeting */}
      <div className="px-6 pt-3 pb-2 animate-fade-slide-up">
        <p className="text-sm text-brand-black/40 font-medium">{getGreeting()}</p>
        <h1 className="text-[26px] font-semibold tracking-tight text-brand-black mt-0.5">
          {userName}
        </h1>
      </div>

      {/* Cards */}
      <div className="flex-1 px-5 pt-6 space-y-4 stagger">

        {/* Home Status Score */}
        <div className="card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/[0.07] flex items-center justify-center">
              <svg className="w-[18px] h-[18px] text-brand-blue" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 01-.53 1.28h-1.44v7.94a.75.75 0 01-.75.75h-3.75a.75.75 0 01-.75-.75V17.5a1.5 1.5 0 00-3 0v4.25a.75.75 0 01-.75.75H6.5a.75.75 0 01-.75-.75v-7.94H4.31a.75.75 0 01-.53-1.28l8.69-8.69z" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-brand-black/70 tracking-wide">Home Status Score</span>
              <span className="text-[9px] text-brand-black/30">TM</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-[42px] font-bold leading-none tracking-tight">72</span>
            <span className="text-lg text-brand-black/25 font-medium">/100</span>
            <span className="text-[13px] text-brand-black/45 ml-3 font-medium">Performing Well</span>
          </div>

          {/* Segmented progress */}
          <div className="flex gap-1 mb-2">
            <div className="flex-1 h-[6px] rounded-full overflow-hidden bg-brand-grey/60">
              <div className="h-full w-full bg-gradient-to-r from-brand-blue to-brand-blue/80 rounded-full" />
            </div>
            <div className="flex-1 h-[6px] rounded-full overflow-hidden bg-brand-grey/60">
              <div className="h-full w-[88%] bg-gradient-to-r from-brand-blue/70 to-brand-aqua rounded-full" />
            </div>
            <div className="flex-1 h-[6px] rounded-full overflow-hidden bg-brand-grey/60" />
            <div className="flex-1 h-[6px] rounded-full overflow-hidden bg-brand-grey/60" />
          </div>
          <div className="flex justify-between text-[10px] text-brand-black/25 font-medium mb-5 px-0.5">
            <span>0</span><span>50</span><span>75</span><span>100</span>
          </div>

          <button className="w-full py-3.5 rounded-2xl bg-brand-blue text-white text-[13px] font-semibold tracking-wide active:scale-[0.98] transition-transform">
            Explore Benefits
          </button>
        </div>

        {/* Elite Tier */}
        <div className="card card-pressed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                <svg className="w-[18px] h-[18px] text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-brand-black/80">Unlock Elite Home Care</p>
                <p className="text-[11px] text-brand-black/35 mt-0.5">72 / 100 — Elite at 90</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-brand-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <div className="mt-4 relative h-[6px] rounded-full bg-brand-grey/50 overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-gold/70 to-brand-gold rounded-full transition-all duration-1000" style={{ width: "72%" }} />
          </div>
        </div>

        {/* Nearest Property */}
        <div className="card card-pressed">
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-wider mb-2">Nearest Property</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold">Marina Residence Tower 1</p>
              <p className="text-[12px] text-brand-black/35 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                200 m away
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-aqua/20 to-brand-blue/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-brand-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Maintain Your Home */}
        <div>
          <h3 className="text-[13px] font-semibold text-brand-black/50 uppercase tracking-wider mb-4 px-1">Maintain Your Home</h3>
          <div className="flex gap-5 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
            {[
              { label: "Plumbing", gradient: "from-brand-blue/[0.08] to-brand-aqua/[0.12]" },
              { label: "Electrical", gradient: "from-brand-gold/[0.12] to-brand-gold/[0.05]" },
              { label: "Cleaning", gradient: "from-brand-aqua/[0.12] to-brand-blue/[0.06]" },
              { label: "AC Service", gradient: "from-brand-blue/[0.06] to-brand-aqua/[0.08]" },
              { label: "Painting", gradient: "from-brand-gold/[0.08] to-brand-cream" },
            ].map((item) => (
              <button key={item.label} className="flex flex-col items-center gap-2.5 shrink-0 active:scale-95 transition-transform">
                <div className={`w-[72px] h-[72px] rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm shadow-black/[0.02]`}>
                  <svg className="w-6 h-6 text-brand-blue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.84-3.38a1 1 0 01-.08-1.69l9.82-5.72a1 1 0 011.34.47l3.54 7.08a1 1 0 01-.47 1.34l-9.82 5.72a1 1 0 01-1.34-.47z" />
                  </svg>
                </div>
                <span className="text-[11px] text-brand-black/50 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Voice overlay */}
      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />

      {/* Tab bar */}
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
