"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSSO() {
    await signIn("sso", { callbackUrl: "/" });
  }

  async function handleCredentials(e: React.FormEvent) {
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
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">MAINTAINED</h1>
          <p className="mt-2 text-gray-400">AI-Powered Asset Maintenance</p>
        </div>

        {/* SSO Button */}
        <button
          onClick={handleSSO}
          className="w-full flex items-center justify-center gap-3 rounded-lg bg-brand-gold px-4 py-3 text-white font-medium hover:bg-brand-gold/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Sign in with SSO
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-blue" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-brand-black text-gray-500">or</span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleCredentials} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-brand-blue bg-brand-blue/60 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-aqua focus:ring-1 focus:ring-brand-aqua outline-none"
              placeholder="you@maintained.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-brand-blue bg-brand-blue/60 px-4 py-2.5 text-white placeholder-gray-500 focus:border-brand-aqua focus:ring-1 focus:ring-brand-aqua outline-none"
              placeholder="Enter password"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-gray-900 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
