"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export default function VoiceAssistant() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch {
      setError("Microphone access denied. Please allow microphone access to use the voice assistant.");
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
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
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
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process query");
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && !isListening && !isProcessing && e.target === document.body) {
        e.preventDefault();
        startListening();
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === "Space" && isListening) {
        e.preventDefault();
        stopListening();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isListening, isProcessing, startListening, stopListening]);

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
      <header className="border-b border-brand-blue px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">MAINTAINED</h1>
          <p className="text-sm text-gray-400">AI Voice Assistant</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/reports" className="text-sm text-gray-400 hover:text-white transition-colors">
            Reports
          </a>
          <span className="text-sm text-gray-400">{session.user?.name || session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
        {conversation.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-brand-aqua" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Ready to assist</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Hold <kbd className="px-2 py-0.5 rounded bg-brand-blue text-xs font-mono">Space</kbd> to talk, or tap the microphone button. Ask about jobs, invoices, estimates, or customers.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "What's the status of job 12345?",
                "How much is invoice 67890?",
                "Show me recent jobs",
                "Look up customer Acme Corp",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => sendText(example)}
                  className="px-3 py-1.5 rounded-full text-xs bg-brand-blue text-gray-300 hover:bg-brand-blue/80 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {conversation.map((entry, i) => (
          <div key={i} className={`mb-4 flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-lg rounded-2xl px-4 py-3 ${
                entry.role === "user"
                  ? "bg-brand-gold text-white"
                  : "bg-brand-blue text-gray-100"
              }`}
            >
              <p>{entry.text}</p>
              <p className="text-xs mt-1 opacity-50">
                {entry.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={conversationEndRef} />
      </div>

      {error && (
        <div className="px-6 pb-2 max-w-3xl mx-auto w-full">
          <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-2 text-red-300 text-sm">
            {error}
          </div>
        </div>
      )}

      <div className="border-t border-brand-blue px-6 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-4">
          <TextInput onSend={sendText} disabled={isProcessing} />
          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            disabled={isProcessing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isListening
                ? "bg-red-500 scale-110 animate-pulse"
                : isProcessing
                ? "bg-gray-700 cursor-wait"
                : "bg-brand-gold hover:bg-brand-gold/80"
            }`}
          >
            {isProcessing ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          {isListening ? "Listening... Release to send" : isProcessing ? "Processing..." : "Hold to talk or type a message"}
        </p>
      </div>
    </div>
  );
}

function TextInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 rounded-l-lg border border-gray-700 bg-brand-blue/60 px-4 py-3 text-white placeholder-gray-500 focus:border-brand-aqua focus:ring-1 focus:ring-brand-aqua outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-r-lg bg-brand-blue px-4 py-3 text-gray-300 hover:bg-brand-blue/80 transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
