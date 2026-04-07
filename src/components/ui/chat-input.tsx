"use client"

import React, { useEffect, useState, useRef, useCallback, memo } from "react";

interface ChatInputProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
}

interface SendButtonProps {
  isDisabled: boolean;
}

const SendButton = memo(({ isDisabled }: SendButtonProps) => (
  <button
    type="submit"
    aria-label="Send message"
    disabled={isDisabled}
    className={`ml-auto self-center h-8 w-8 flex items-center justify-center rounded-full border-0 p-0 transition-all z-20 shrink-0 ${
      isDisabled
        ? "opacity-40 cursor-not-allowed bg-white/10 text-white/30"
        : "opacity-90 bg-brand-gold text-brand-black hover:opacity-100 cursor-pointer hover:shadow-lg"
    }`}
  >
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block ${isDisabled ? "opacity-50" : "opacity-100"}`}
    >
      <path
        d="M16 22L16 10M16 10L11 15M16 10L21 15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
));

SendButton.displayName = "SendButton";

export default function ChatInput({
  placeholder = "Ask MAINTAINED...",
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const throttleRef = useRef<number | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 22;
      const maxHeight = lineHeight * 4 + 16;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + "px";
    }
  }, [value]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && onSubmit && !disabled) {
        onSubmit(value.trim());
        setValue("");
      }
    },
    [value, onSubmit, disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    },
    [handleSubmit]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current && !throttleRef.current) {
      throttleRef.current = window.setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setMousePosition({ x, y });
        }
        throttleRef.current = null;
      }, 50);
    }
  }, []);

  const isSubmitDisabled = disabled || !value.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative flex items-center w-full bg-white/[0.06] backdrop-blur-xl rounded-full p-1.5 pl-5 overflow-visible group transition-all duration-300 border border-white/[0.08] hover:border-white/[0.15] focus-within:border-brand-aqua/30"
        style={{
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Glow on hover */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `
              0 0 0 1px rgba(171, 203, 209, 0.08),
              0 0 12px rgba(171, 203, 209, 0.06),
              0 0 24px rgba(205, 176, 104, 0.04)
            `,
          }}
        />

        {/* Cursor-following glow */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle 100px at ${mousePosition.x}% ${mousePosition.y}%, rgba(171,203,209,0.06) 0%, rgba(205,176,104,0.03) 40%, transparent 100%)`,
          }}
        />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Message Input"
          rows={1}
          className="flex-1 min-h-8 max-h-24 bg-transparent text-sm font-normal text-white/90 placeholder-white/25 border-0 outline-none pr-3 py-1.5 z-20 relative resize-none overflow-y-auto"
          style={{
            lineHeight: "22px",
          }}
          disabled={disabled}
        />

        <SendButton isDisabled={isSubmitDisabled} />
      </div>
    </form>
  );
}
