"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/apiClient";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!token) {
      setErrorMessage("Missing or invalid password reset token in the link.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authService.resetPassword(token, password);
      setSuccessMessage(
        response.message ||
          "Password has been successfully reset. You can now sign in."
      );
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Unable to reset password. The token may be expired or already used."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80">
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mb-4 border border-emerald-100 shadow-xs">
          <span className="material-symbols-outlined text-[26px]">key</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Create New Password
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-normal leading-relaxed">
          Please choose a strong password with at least 8 characters.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5 animate-shake">
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
            check_circle
          </span>
          <div>
            <p className="font-semibold">{successMessage}</p>
            <p className="text-[11px] text-emerald-700 mt-1">
              Redirecting to sign-in page...
            </p>
          </div>
        </div>
      )}

      {!token ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <p className="font-semibold mb-1">Invalid Link</p>
          <p>
            No reset token found. Please check the link from your email or request a new reset link.
          </p>
          <Link
            href="/forgot-password"
            className="mt-3 inline-block font-semibold text-emerald-700 hover:underline"
          >
            Request new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!successMessage}
            className="mt-2 w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  sync
                </span>
                <span>Resetting Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <Link
          href="/login"
          className="text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
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
        <Link
          href="/login"
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all hover:border-slate-300"
        >
          Sign in
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-pulse h-80" />
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/50">
        © {new Date().getFullYear()} BSTORM Academy. All rights reserved.
      </footer>
    </div>
  );
}
