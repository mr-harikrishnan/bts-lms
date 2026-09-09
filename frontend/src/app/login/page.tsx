"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useBstorm } from "@/context/BstormContext";
import { GuestGuard } from "@/components/auth/GuestGuard";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const { login } = useBstorm();

  const [email, setEmail] = useState("hari.prasath@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both your email address and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address format (e.g. name@domain.com).");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const success = await login(trimmedEmail, trimmedPassword);
    if (!success) {
      setError("Invalid credentials. Please verify your email and password.");
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectTarget);
  };

  const handleQuickDemo = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const success = await login("hari.prasath@example.com", "password123");
    if (!success) {
      setError("Unable to authenticate demo account. Please try again.");
      setIsSubmitting(false);
      return;
    }
    router.replace(redirectTarget);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top minimal header */}
      <header className="h-20 px-6 sm:px-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BSTORM Logo"
            className="h-9 w-9 rounded-xl object-contain shadow-xs ring-1 ring-slate-900/5 group-hover:scale-105 transition-transform"
            src="/logo.png"
          />
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-slate-900 tracking-tight leading-none">
              BSTORM
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
              by Brainstorm Creators
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:inline">New to BSTORM?</span>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all hover:border-slate-300"
          >
            Create account
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80">
          <div className="flex flex-col gap-1.5 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign in to BSTORM
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Continue your courses and project milestones.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-rose-600">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-700 hover:underline cursor-pointer font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    sync
                  </span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Or</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleQuickDemo}
            className="w-full h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 border border-emerald-200/80 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-700">
              bolt
            </span>
            <span>Instant Demo Login (1-Click)</span>
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-5 border-t border-slate-200/70 text-center text-xs text-slate-500 bg-white/50 backdrop-blur-sm">
        Provided by Brainstorm Creators • Designed for College Students & Beginners
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </GuestGuard>
  );
}
