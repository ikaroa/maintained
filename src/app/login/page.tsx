"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phase, setPhase] = useState<"landing" | "form">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden">
      {/* Splash video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-out ${
        phase === "form"
          ? "bg-brand-black/85"
          : "bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent"
      }`} />

      {/*
        Single content block: logo + form + button all together.
        In "landing": positioned at center (top: 50%) with button below.
        In "form": slides up to ~35% and reveals form fields.
      */}
      <div
        className="fixed z-10 w-full max-w-sm px-8 left-1/2 transition-all duration-700 ease-out"
        style={{
          top: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src="/logo.svg"
            alt="Maintained"
            className={`mx-auto brightness-0 invert transition-all duration-700 ${
              phase === "form" ? "h-8" : "h-11"
            }`}
          />
        </div>

        {/* Form fields — height animates in */}
        <div
          className={`transition-all duration-700 ease-out overflow-hidden ${
            phase === "form"
              ? "max-h-[500px] opacity-100 mb-0"
              : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={phase === "form"}
                className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white placeholder-white/40 focus:border-brand-aqua focus:ring-1 focus:ring-brand-aqua outline-none backdrop-blur-sm text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white placeholder-white/40 focus:border-brand-aqua focus:ring-1 focus:ring-brand-aqua outline-none backdrop-blur-sm text-sm"
                placeholder="Password"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-gold px-6 py-3.5 text-brand-black font-semibold text-sm uppercase tracking-widest hover:bg-brand-gold/80 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-white/40 text-xs hover:text-white/70 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Landing: Sign In button pinned to bottom */}
      <div className={`relative z-10 w-full max-w-sm px-8 mt-auto pb-16 transition-all duration-500 ease-out ${
        phase === "landing"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}>
        <button
          onClick={() => setPhase("form")}
          className="w-full rounded-full bg-brand-gold px-6 py-3.5 text-brand-black font-semibold text-sm uppercase tracking-widest hover:bg-brand-gold/80 transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
