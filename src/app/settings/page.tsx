"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-[44px] h-[26px] rounded-full transition-colors duration-300 relative shrink-0 ${
        value ? "bg-brand-gold" : "bg-brand-black/10"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
          value ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [autoListen, setAutoListen] = useState(true);
  const [greeting, setGreeting] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const settings = localStorage.getItem("maintained-settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      setVoiceSpeed(parsed.voiceSpeed ?? 1);
      setAutoListen(parsed.autoListen ?? true);
      setGreeting(parsed.greeting ?? true);
    }
  }, []);

  function saveSettings() {
    localStorage.setItem(
      "maintained-settings",
      JSON.stringify({ voiceSpeed, autoListen, greeting })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col">
      {/* Header */}
      <header className="px-6 pt-16 pb-2 flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white shadow-sm shadow-black/[0.04] flex items-center justify-center active:scale-95 transition-transform">
          <svg className="w-5 h-5 text-brand-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-[20px] font-semibold">Settings</h1>
      </header>

      <div className="flex-1 px-5 pt-6 pb-12 space-y-6 stagger">
        {/* Account */}
        <section>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3 px-1">Account</p>
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-brand-black/40">Name</span>
              <span className="text-[13px] font-medium">{session.user?.name || "—"}</span>
            </div>
            <div className="border-t border-brand-black/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-brand-black/40">Email</span>
              <span className="text-[13px] font-medium">{session.user?.email || "—"}</span>
            </div>
          </div>
        </section>

        {/* Voice */}
        <section>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3 px-1">Voice Assistant</p>
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-brand-black/80">Auto-listen on open</p>
                <p className="text-[11px] text-brand-black/30 mt-0.5">Start listening when app opens</p>
              </div>
              <Toggle value={autoListen} onChange={setAutoListen} />
            </div>

            <div className="border-t border-brand-black/[0.04]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-brand-black/80">Welcome greeting</p>
                <p className="text-[11px] text-brand-black/30 mt-0.5">Speak greeting on login</p>
              </div>
              <Toggle value={greeting} onChange={setGreeting} />
            </div>

            <div className="border-t border-brand-black/[0.04]" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-medium text-brand-black/80">Voice speed</p>
                <span className="text-[12px] text-brand-black/30 font-mono">{voiceSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full h-[5px] bg-brand-black/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-gold [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:shadow-brand-gold/30 [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3 px-1">Support</p>
          <div className="card space-y-3">
            <a href="mailto:support@maintained.com" className="flex items-center justify-between group">
              <div>
                <p className="text-[13px] font-medium text-brand-black/80 group-hover:text-brand-black transition-colors">Contact support</p>
                <p className="text-[11px] text-brand-black/30 mt-0.5">Get help with your account</p>
              </div>
              <svg className="w-4 h-4 text-brand-black/15 group-hover:text-brand-black/30 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
            <div className="border-t border-brand-black/[0.04]" />
            <a href="#" className="flex items-center justify-between group">
              <p className="text-[13px] font-medium text-brand-black/80 group-hover:text-brand-black transition-colors">Privacy policy</p>
              <svg className="w-4 h-4 text-brand-black/15 group-hover:text-brand-black/30 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          </div>
        </section>

        {/* About */}
        <section>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3 px-1">About</p>
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-brand-black/40">Version</span>
              <span className="text-[13px] text-brand-black/30">1.0.0</span>
            </div>
            <div className="border-t border-brand-black/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-brand-black/40">Built by</span>
              <span className="text-[13px] text-brand-black/30">Ikaroa</span>
            </div>
          </div>
        </section>

        {/* Save */}
        <button
          onClick={saveSettings}
          className={`w-full py-3.5 rounded-2xl font-semibold text-[13px] uppercase tracking-widest transition-all duration-300 active:scale-[0.98] ${
            saved
              ? "bg-brand-blue/10 text-brand-blue"
              : "bg-brand-blue text-white shadow-lg shadow-brand-blue/15"
          }`}
        >
          {saved ? "Saved" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
