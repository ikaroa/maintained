"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { SiriOrb } from "@/components/ui/siri-orb";
import ChatInput from "@/components/ui/chat-input";

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock responses when API is unavailable
function getMockResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("score") || lower.includes("status"))
    return "Your home status score is 72 out of 100. Your property is performing well across all categories.";
  if (lower.includes("book") || lower.includes("plumb"))
    return "I can help with that. Head to the Services tab to book a plumber. We have availability tomorrow morning.";
  if (lower.includes("point") || lower.includes("reward"))
    return "You have 1,240 points as a Gold tier member. You're 260 points away from Platinum. Check the Rewards tab to redeem.";
  if (lower.includes("invoice") || lower.includes("cost") || lower.includes("price"))
    return "Your last service was an AC unit cleaning on 12 March, costing AED 350. Would you like to see all invoices?";
  if (lower.includes("property") || lower.includes("properties"))
    return "You have 2 properties registered. Marina Residence Tower 1 with a score of 72, and Downtown Views with a score of 85.";
  if (lower.includes("job") || lower.includes("work order"))
    return "You have 1 scheduled booking: Deep Cleaning at Downtown Views on 22 April at 10:00.";
  if (lower.includes("engineer") || lower.includes("technician"))
    return "Your assigned engineers include Ahmed K. for AC services and James T. for plumbing. All are certified and background-checked.";
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey"))
    return "Hello! I'm your Maintained assistant. I can help with bookings, property info, invoices, and more. What would you like to know?";
  if (lower.includes("help"))
    return "I can help you check your home score, book services, view invoices, check reward points, or look up property details. Just ask!";
  return "I'd be happy to help with that. You can ask me about your properties, bookings, invoices, reward points, or home score.";
}

export default function VoiceOverlay({ isOpen, onClose }: VoiceOverlayProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Read settings
  const getSettings = () => {
    try {
      const s = localStorage.getItem("maintained-settings");
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  };

  // Auto-listen when overlay first opens (only if no conversation yet)
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current && conversation.length === 0) {
      const settings = getSettings();
      if (settings.autoListen !== false) {
        const timer = setTimeout(() => startListening(), 500);
        return () => clearTimeout(timer);
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

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
      setError("Microphone access denied.");
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
      addConversation(data.transcript, data.response);
      playResponse(data.response, data.audio);
    } catch {
      // API unavailable — use mock
      addConversation("(voice input)", "I heard you, but I'm running in offline mode. Try typing your question instead.");
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
      addConversation(text, data.response);
      playResponse(data.response, data.audio);
    } catch {
      // Fallback to mock response
      const mockReply = getMockResponse(text);
      addConversation(text, mockReply);
      speakText(mockReply);
    } finally {
      setIsProcessing(false);
    }
  }

  function addConversation(userText: string, assistantText: string) {
    setConversation(prev => [
      ...prev,
      { role: "user", text: userText, timestamp: new Date() },
      { role: "assistant", text: assistantText, timestamp: new Date() },
    ]);
  }

  function playResponse(text: string, audioBase64?: string) {
    if (audioBase64) {
      try {
        const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([audioBytes], { type: "audio/mp3" });
        const audio = new Audio(URL.createObjectURL(blob));
        const settings = getSettings();
        audio.playbackRate = settings.voiceSpeed || 1;
        audio.play();
        return;
      } catch { /* fall through to speech synthesis */ }
    }
    speakText(text);
  }

  function speakText(text: string) {
    const settings = getSettings();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.voiceSpeed || 1;
    window.speechSynthesis.speak(utterance);
  }

  const orbColors = isListening
    ? { c1: "oklch(30% 0.045 230)", c2: "oklch(82% 0.12 85)", c3: "oklch(27% 0.04 230)" }
    : isProcessing
    ? { c1: "oklch(27% 0.04 230)", c2: "oklch(80% 0.13 85)", c3: "oklch(25% 0.035 230)" }
    : { c1: "oklch(27% 0.04 230)", c2: "oklch(78% 0.10 85)", c3: "oklch(24% 0.035 230)" };

  const orbSpeed = isListening ? 4 : isProcessing ? 8 : 20;
  const hasConversation = conversation.length > 0;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Fully opaque background */}
      <div className="absolute inset-0 bg-brand-black" />

      {/* Header */}
      <div className={`relative z-10 px-5 pt-3 pb-0 flex items-center justify-between transition-all duration-500 delay-100 ${
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}>
        <button onClick={(e) => {
          e.stopPropagation();
          if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
          }
          window.speechSynthesis.cancel();
          onClose();
        }} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
        </button>
        <p className="text-[13px] text-white/40 font-medium">AI Assistant</p>
        {hasConversation ? (
          <button onClick={() => setConversation([])} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/30 hover:text-white/60 transition-colors active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        ) : <div className="w-9" />}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {!hasConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <button
              onClick={() => { if (isListening) stopListening(); else if (!isProcessing) startListening(); }}
              disabled={isProcessing}
              className={`relative mb-10 cursor-pointer transition-transform duration-300 ${
                isListening ? "scale-110" : isProcessing ? "scale-105" : "hover:scale-105"
              }`}
            >
              <SiriOrb size="180px" colors={orbColors} animationDuration={orbSpeed} className="drop-shadow-2xl" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isProcessing ? (
                  <div className="flex items-center gap-[3px]">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1 bg-white/70 rounded-full animate-pulse" style={{ height: "18px", animationDelay: `${i * 0.15}s`, animationDuration: "0.6s" }} />
                    ))}
                  </div>
                ) : (
                  <svg className={`w-8 h-8 transition-all duration-300 ${isListening ? "text-white scale-110" : "text-white/60"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>
            </button>
            <p className={`text-sm mb-1 transition-all duration-500 ${isListening ? "text-brand-aqua/80" : isProcessing ? "text-brand-gold/60" : "text-white/25"}`}>
              {isListening ? "Listening... tap to stop" : isProcessing ? "Thinking..." : "Tap to speak"}
            </p>
            <p className="text-white/15 text-xs">{!isListening && !isProcessing && "or type a message below"}</p>
            {error && <p className="mt-4 text-red-400/80 text-sm text-center max-w-xs">{error}</p>}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full">
            {conversation.map((entry, i) => (
              <div key={i} className={`mb-4 flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${entry.role === "user" ? "bg-brand-blue text-white" : "bg-white/[0.06] text-white/85"}`}>
                  <p className="text-[13px] leading-relaxed">{entry.text}</p>
                </div>
              </div>
            ))}
            <div ref={conversationEndRef} />
            {error && <p className="text-red-400/80 text-sm text-center">{error}</p>}
          </div>
        )}
      </div>

      {/* Bottom input */}
      <div className={`relative z-10 shrink-0 px-6 pb-10 pt-4 flex items-center gap-3 max-w-2xl mx-auto w-full transition-all duration-500 delay-200 ${
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        <ChatInput placeholder="Ask MAINTAINED..." onSubmit={sendText} disabled={isProcessing} />
        {hasConversation && (
          <button
            onClick={() => { if (isListening) stopListening(); else if (!isProcessing) startListening(); }}
            disabled={isProcessing}
            className={`shrink-0 transition-all duration-300 ${isListening ? "scale-110" : ""}`}
          >
            <SiriOrb size="44px" colors={orbColors} animationDuration={orbSpeed} />
          </button>
        )}
      </div>
    </div>
  );
}
