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

  const orbColors = isListening
    ? { c1: "oklch(80% 0.10 200)", c2: "oklch(78% 0.12 195)", c3: "oklch(85% 0.08 190)" }
    : isProcessing
    ? { c1: "oklch(75% 0.14 85)", c2: "oklch(40% 0.06 220)", c3: "oklch(70% 0.12 75)" }
    : { c1: "oklch(72% 0.12 85)", c2: "oklch(35% 0.05 220)", c3: "oklch(78% 0.08 200)" };

  const orbSpeed = isListening ? 4 : isProcessing ? 8 : 20;
  const hasConversation = conversation.length > 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-brand-black transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] origin-bottom ${
        isOpen ? "scale-y-100" : "scale-y-0"
      }`} />

      {/* Header */}
      <div className={`relative z-10 px-6 py-4 flex items-center justify-between transition-all duration-500 delay-100 ${
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
        </button>
        <p className="text-sm text-white/50 font-medium">AI Assistant</p>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {!hasConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <button
              onClick={() => {
                if (isListening) stopListening();
                else if (!isProcessing) startListening();
              }}
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
                <div className={`max-w-md rounded-2xl px-4 py-3 ${entry.role === "user" ? "bg-brand-blue text-white" : "bg-white/5 text-white/90"}`}>
                  <p className="text-sm leading-relaxed">{entry.text}</p>
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
