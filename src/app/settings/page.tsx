"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  // Load settings from localStorage
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src="/logo.svg" alt="Maintained" className="h-6 brightness-0 invert" />
        <div className="w-6" />
      </header>

      <div className="flex-1 px-6 py-8 max-w-lg mx-auto w-full">
        <h1 className="text-xl font-semibold mb-8">Settings</h1>

        {/* Profile */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">Account</h2>
          <div className="bg-white/[0.04] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Name</span>
              <span className="text-sm">{session.user?.name || "—"}</span>
            </div>
            <div className="border-t border-white/[0.06]" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Email</span>
              <span className="text-sm">{session.user?.email || "—"}</span>
            </div>
          </div>
        </section>

        {/* Voice */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">Voice Assistant</h2>
          <div className="bg-white/[0.04] rounded-2xl p-5 space-y-5">
            {/* Auto listen */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Auto-listen on open</p>
                <p className="text-xs text-white/30 mt-0.5">Start listening when you open the app</p>
              </div>
              <button
                onClick={() => setAutoListen(!autoListen)}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${
                  autoListen ? "bg-brand-gold" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                    autoListen ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Welcome greeting */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Welcome greeting</p>
                <p className="text-xs text-white/30 mt-0.5">Speak greeting on login</p>
              </div>
              <button
                onClick={() => setGreeting(!greeting)}
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${
                  greeting ? "bg-brand-gold" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                    greeting ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-white/[0.06]" />

            {/* Voice speed */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm">Voice speed</p>
                <span className="text-xs text-white/40">{voiceSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-gold [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">Support</h2>
          <div className="bg-white/[0.04] rounded-2xl p-5 space-y-3">
            <a href="mailto:support@maintained.com" className="flex items-center justify-between group">
              <div>
                <p className="text-sm group-hover:text-white transition-colors">Contact support</p>
                <p className="text-xs text-white/30 mt-0.5">Get help with your account</p>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <div className="border-t border-white/[0.06]" />
            <a href="#" className="flex items-center justify-between group">
              <div>
                <p className="text-sm group-hover:text-white transition-colors">Privacy policy</p>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>

        {/* About */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">About</h2>
          <div className="bg-white/[0.04] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Version</span>
              <span className="text-sm text-white/40">1.0.0</span>
            </div>
            <div className="border-t border-white/[0.06]" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Built by</span>
              <span className="text-sm text-white/40">Ikaroa</span>
            </div>
          </div>
        </section>

        {/* Save */}
        <button
          onClick={saveSettings}
          className={`w-full rounded-full py-3.5 font-semibold text-sm uppercase tracking-widest transition-all duration-300 ${
            saved
              ? "bg-green-500/20 text-green-400"
              : "bg-brand-gold text-brand-black hover:bg-brand-gold/80"
          }`}
        >
          {saved ? "Saved" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
