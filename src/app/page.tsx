"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { SiriOrb } from "@/components/ui/siri-orb";
import ChatInput from "@/components/ui/chat-input";

function AnimatedMenuIcon({ isOpen, className = "w-6 h-6" }: { isOpen: boolean; className?: string }) {
  return (
    <div className={`${className} flex flex-col justify-center items-start gap-[5px]`}>
      <span className={`block h-[2px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] origin-center ${
        isOpen ? "w-5 translate-y-[7px] rotate-45" : "w-3.5"
      }`} />
      <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)] ${
        isOpen ? "w-5 opacity-0 translate-x-3" : "w-5 opacity-100"
      }`} />
      <span className={`block h-[2px] bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] origin-center ${
        isOpen ? "w-5 -translate-y-[7px] -rotate-45" : "w-5"
      }`} />
    </div>
  );
}

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export default function VoiceAssistant() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Welcome greeting + auto-start listening
  useEffect(() => {
    if (status === "authenticated" && !hasGreeted) {
      setHasGreeted(true);
      // Speak welcome message
      const greeting = "Welcome to Maintained, how can we help you today?";
      const utterance = new SpeechSynthesisUtterance(greeting);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onend = () => {
        // Auto-start listening after greeting finishes
        startListening();
      };
      window.speechSynthesis.speak(utterance);
    }
  }, [status, hasGreeted]);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch {
      setError("Microphone access denied. Please allow microphone access.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  async function sendAudio(audioBlob: Blob) {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    try {
      const res = await fetch("/api/voice", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConversation((prev) => [
        ...prev,
        { role: "user", text: data.transcript, timestamp: new Date() },
        { role: "assistant", text: data.response, timestamp: new Date() },
      ]);
      if (data.audio) {
        const audioBytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
        const blob = new Blob([audioBytes], { type: "audio/mp3" });
        new Audio(URL.createObjectURL(blob)).play();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process voice query");
    } finally {
      setIsProcessing(false);
    }
  }

  async function sendText(text: string) {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConversation((prev) => [
        ...prev,
        { role: "user", text, timestamp: new Date() },
        { role: "assistant", text: data.response, timestamp: new Date() },
      ]);
      if (data.audio) {
        const audioBytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
        const blob = new Blob([audioBytes], { type: "audio/mp3" });
        new Audio(URL.createObjectURL(blob)).play();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process query");
    } finally {
      setIsProcessing(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const hasConversation = conversation.length > 0;

  // Orb colors shift based on state
  const orbColors = isListening
    ? { c1: "oklch(80% 0.10 200)", c2: "oklch(78% 0.12 195)", c3: "oklch(85% 0.08 190)" } // bright aqua
    : isProcessing
    ? { c1: "oklch(75% 0.14 85)", c2: "oklch(40% 0.06 220)", c3: "oklch(70% 0.12 75)" }   // gold pulse
    : { c1: "oklch(72% 0.12 85)", c2: "oklch(35% 0.05 220)", c3: "oklch(78% 0.08 200)" };  // default gold/blue

  const orbSpeed = isListening ? 4 : isProcessing ? 8 : 20;

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      {/* Fullscreen menu */}
      <div
        className={`fixed inset-0 z-50 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.77,0,0.18,1)] ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Animated background panels */}
        <div className={`absolute inset-0 bg-brand-black transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.18,1)] origin-top ${
          menuOpen ? "scale-y-100" : "scale-y-0"
        }`} />

        {/* Menu header — spacer to match main header height */}
        <div className="relative z-10 px-6 py-4 h-14" />

        {/* Menu items — each with staggered animation */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 max-w-sm mx-auto w-full">
          <nav className="space-y-3">
            {[
              { href: "/", label: "Voice Assistant", active: true, icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z", delay: 150 },
              { href: "/reports", label: "Reports", active: false, icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", delay: 200 },
              { href: "/settings", label: "Settings", active: false, icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z", delay: 250 },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-medium transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] ${
                  item.active
                    ? "text-white bg-white/[0.06] hover:bg-white/10"
                    : "text-white/40 hover:text-white hover:bg-white/[0.04]"
                } ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                style={{ transitionDelay: menuOpen ? `${item.delay}ms` : "0ms" }}
              >
                <svg className={`w-5 h-5 ${item.active ? "text-brand-aqua" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Menu footer */}
        <div
          className={`relative z-10 px-8 pb-10 max-w-sm mx-auto w-full transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] ${
            menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: menuOpen ? "300ms" : "0ms" }}
        >
          <div className="border-t border-white/[0.06] pt-6">
            <div className="mb-4 px-5">
              <p className="text-sm text-white/70">{session.user?.name || session.user?.email}</p>
              <p className="text-xs text-white/25 mt-0.5">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-4 px-5 py-3 rounded-2xl text-white/25 text-sm transition-colors hover:text-white hover:bg-white/[0.04] w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white/70 hover:text-white transition-colors z-[60] relative">
          <AnimatedMenuIcon isOpen={menuOpen} />
        </button>
        <img src="/logo.svg" alt="Maintained" className="h-6 brightness-0 invert" />
        <div className="w-6" />
      </header>

      {/* Main content */}
      {!hasConversation ? (
        /* Empty state: centered orb */
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Orb — tap to toggle listening */}
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else if (!isProcessing) {
                startListening();
              }
            }}
            disabled={isProcessing}
            className={`relative mb-10 cursor-pointer transition-transform duration-300 ${
              isListening ? "scale-110" : isProcessing ? "scale-105" : "hover:scale-105"
            }`}
          >
            <SiriOrb
              size="180px"
              colors={orbColors}
              animationDuration={orbSpeed}
              className="drop-shadow-2xl"
            />

            {/* Center mic icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {isProcessing ? (
                <div className="flex items-center gap-[3px]">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-white/70 rounded-full animate-pulse"
                      style={{
                        height: "18px",
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: "0.6s",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <svg
                  className={`w-8 h-8 transition-all duration-300 ${
                    isListening ? "text-white scale-110" : "text-white/60"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </div>
          </button>

          <p className={`text-sm mb-1 transition-all duration-500 ${
            isListening ? "text-brand-aqua/80" : isProcessing ? "text-brand-gold/60" : "text-white/25"
          }`}>
            {isListening ? "Listening... tap to stop" : isProcessing ? "Thinking..." : "Tap to speak"}
          </p>
          <p className="text-white/15 text-xs">
            {!isListening && !isProcessing && "or type a message below"}
          </p>

          {error && (
            <p className="mt-4 text-red-400/80 text-sm text-center max-w-xs">{error}</p>
          )}
        </div>
      ) : (
        /* Conversation view */
        <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full">
          {conversation.map((entry, i) => (
            <div key={i} className={`mb-4 flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-md rounded-2xl px-4 py-3 ${
                  entry.role === "user"
                    ? "bg-brand-blue text-white"
                    : "bg-white/5 text-white/90"
                }`}
              >
                <p className="text-sm leading-relaxed">{entry.text}</p>
              </div>
            </div>
          ))}
          <div ref={conversationEndRef} />

          {error && (
            <div className="text-center">
              <p className="text-red-400/80 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom input bar */}
      <div className="shrink-0 px-6 pb-8 pt-4 flex items-center gap-3 max-w-2xl mx-auto w-full">
        <ChatInput
          placeholder="Ask MAINTAINED..."
          onSubmit={sendText}
          disabled={isProcessing}
        />

        {hasConversation && (
          <button
            onClick={() => {
              if (isListening) stopListening();
              else if (!isProcessing) startListening();
            }}
            disabled={isProcessing}
            className={`shrink-0 transition-all duration-300 ${
              isListening ? "scale-110" : ""
            }`}
          >
            <SiriOrb
              size="44px"
              colors={orbColors}
              animationDuration={orbSpeed}
            />
          </button>
        )}
      </div>
    </div>
  );
}
