"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBstorm } from "@/context/BstormContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useBstorm();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !email || !collegeName || !district || !state || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    setTimeout(() => {
      signup({
        name: userName,
        email,
        college: collegeName,
        district,
        state,
        rollNumber: "21" + Math.random().toString().substring(2, 8).toUpperCase(),
        grantName: "Student Academic Grant",
      });
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
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
          <span className="text-sm text-slate-500 hidden sm:inline">Already registered?</span>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all hover:border-slate-300"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Form Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80">
          <div className="flex flex-col gap-1.5 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Start learning practical digital skills designed for college students & beginners.
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Hari Prasath"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hari@gmail.com"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                College / Institution *
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="PSG College of Technology"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Coimbatore"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Tamil Nadu"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      sync
                    </span>
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Start Learning</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            By registering, you agree to BSTORM Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-5 border-t border-slate-200/70 text-center text-xs text-slate-500 bg-white/50 backdrop-blur-sm">
        Provided by Brainstorm Creators • Designed for College Students & Beginners
      </footer>
    </div>
  );
}
