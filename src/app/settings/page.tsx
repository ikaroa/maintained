"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabBar from "@/components/ui/tab-bar";
import TopBar from "@/components/ui/top-bar";
import VoiceOverlay from "@/components/voice-overlay";

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

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [autoListen, setAutoListen] = useState(true);
  const [greeting, setGreeting] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user?.name) setName(session.user.name);
  }, [status, router, session]);

  useEffect(() => {
    const settings = localStorage.getItem("maintained-settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      setVoiceSpeed(parsed.voiceSpeed ?? 1);
      setAutoListen(parsed.autoListen ?? true);
      setGreeting(parsed.greeting ?? true);
      setNotifications(parsed.notifications ?? true);
    }
  }, []);

  function saveSettings() {
    localStorage.setItem(
      "maintained-settings",
      JSON.stringify({ voiceSpeed, autoListen, greeting, notifications })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-brand-warm text-brand-black flex flex-col pb-28">
      <TopBar />

      <header className="px-6 pt-2 pb-3">
        <h1 className="text-[26px] font-semibold tracking-tight">Settings</h1>
      </header>

      <div className="flex-1 px-5 space-y-6 stagger">
        {/* Account */}
        <section>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3 px-1">Account</p>
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-brand-black/40">Name</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-[13px] font-medium text-right bg-brand-black/[0.03] rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-brand-blue/30 w-32"
                    autoFocus
                  />
                  <button onClick={() => setEditingName(false)} className="text-[12px] text-brand-blue font-semibold">Save</button>
                </div>
              ) : (
                <button onClick={() => setEditingName(true)} className="text-[13px] font-medium flex items-center gap-1.5">
                  {name || session.user?.name || "—"}
                  <svg className="w-3 h-3 text-brand-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                  </svg>
                </button>
              )}
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
                <p className="text-[11px] text-brand-black/30 mt-0.5">Start listening when assistant opens</p>
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
                className="w-full h-[5px] bg-brand-black/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-gold [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3 px-1">Notifications</p>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-brand-black/80">Push notifications</p>
                <p className="text-[11px] text-brand-black/30 mt-0.5">Booking updates, reminders</p>
              </div>
              <Toggle value={notifications} onChange={setNotifications} />
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <p className="text-[11px] text-brand-black/35 font-medium uppercase tracking-widest mb-3 px-1">Support</p>
          <div className="card space-y-3">
            <a href="mailto:support@maintained.ae" className="flex items-center justify-between group">
              <div>
                <p className="text-[13px] font-medium text-brand-black/80">Contact support</p>
                <p className="text-[11px] text-brand-black/30 mt-0.5">support@maintained.ae</p>
              </div>
              <svg className="w-4 h-4 text-brand-black/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
            <div className="border-t border-brand-black/[0.04]" />
            <a href="#" className="flex items-center justify-between group">
              <p className="text-[13px] font-medium text-brand-black/80">Terms & conditions</p>
              <svg className="w-4 h-4 text-brand-black/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
            <div className="border-t border-brand-black/[0.04]" />
            <a href="#" className="flex items-center justify-between group">
              <p className="text-[13px] font-medium text-brand-black/80">Privacy policy</p>
              <svg className="w-4 h-4 text-brand-black/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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

        {/* Sign out */}
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full py-3 text-[13px] text-red-500/60 font-medium hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Sign out confirmation */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSignOutConfirm(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-fade-slide-up">
            <div className="w-10 h-1 bg-brand-black/10 rounded-full mx-auto mb-6" />
            <h3 className="text-[17px] font-semibold mb-2">Sign out?</h3>
            <p className="text-[13px] text-brand-black/45 mb-6">You will need to sign in again to access your account.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl bg-brand-black/[0.04] text-brand-black/60 text-[13px] font-semibold active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white text-[13px] font-semibold active:scale-[0.98] transition-transform"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <VoiceOverlay isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <TabBar onOrbPress={() => setVoiceOpen(true)} isListening={false} isProcessing={false} />
    </div>
  );
}
