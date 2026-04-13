"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Phase = "landing" | "form" | "forgot";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

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
      triggerShake();
    } else {
      router.push("/");
    }
  }

  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setResetEmail("");
      setPhase("form");
    }, 3000);
  }

  // Don't render login UI if already authenticated
  if (status === "authenticated") {
    return null;
  }

  const showForm = phase === "form" || phase === "forgot";

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden">
      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(-50%) translateY(-50%); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(calc(-50% - 6px)) translateY(-50%); }
          20%, 40%, 60%, 80% { transform: translateX(calc(-50% + 6px)) translateY(-50%); }
        }
        .shake-animate {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

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
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-out ${
          showForm
            ? "bg-brand-black/85"
            : "bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent"
        }`}
      />

      {/* Back arrow — visible when in form or forgot phase */}
      <button
        onClick={() => {
          if (phase === "forgot") {
            setPhase("form");
            setResetSent(false);
            setResetEmail("");
          } else {
            setPhase("landing");
          }
          setError("");
        }}
        className={`fixed top-6 left-6 z-20 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 ${
          showForm
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      </button>

      {/* Content block: logo + form */}
      <div
        className={`fixed z-10 w-full max-w-sm px-8 left-1/2 transition-all duration-700 ease-out ${
          shaking ? "shake-animate" : ""
        }`}
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
              showForm ? "h-8" : "h-11"
            }`}
          />
        </div>

        {/* Login form fields */}
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
                onClick={() => {
                  setPhase("forgot");
                  setError("");
                }}
                className="text-white/40 text-xs hover:text-white/70 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>

        {/* Forgot password sub-view */}
        <div
          className={`transition-all duration-700 ease-out overflow-hidden ${
            phase === "forgot"
              ? "max-h-[500px] opacity-100 mb-0"
              : "max-h-0 opacity-0 mb-0"
          }`}
        >
          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-aqua/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand-aqua"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="text-white/70 text-sm leading-relaxed px-2">
                If an account exists with that email, you&apos;ll receive a
                reset link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <p className="text-white/50 text-xs text-center mb-1">
                Enter your email to receive a password reset link.
              </p>
              <div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoFocus={phase === "forgot"}
                  className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white placeholder-white/40 focus:border-brand-aqua focus:ring-1 focus:ring-brand-aqua outline-none backdrop-blur-sm text-sm"
                  placeholder="Email address"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-brand-gold px-6 py-3.5 text-brand-black font-semibold text-sm uppercase tracking-widest hover:bg-brand-gold/80 transition-colors"
              >
                Send Reset Link
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setPhase("form")}
                  className="text-white/40 text-xs hover:text-white/70 transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Landing: Sign In button pinned to bottom */}
      <div
        className={`relative z-10 w-full max-w-sm px-8 mt-auto pb-16 transition-all duration-500 ease-out ${
          phase === "landing"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
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
