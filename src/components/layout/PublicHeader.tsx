"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBstorm } from "@/context/BstormContext";

export const PublicHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useBstorm();

  return (
    <header className="sticky top-0 left-0 right-0 h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-200/70 z-50 transition-all shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_8px_24px_-12px_rgba(15,23,42,0.05)]">
      <div className="max-w-7xl mx-auto h-full px-6 sm:px-8 flex items-center justify-between">
        {/* Brand / Logo Group */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs group-hover:border-slate-300 group-hover:shadow-xs transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="BSTORM Logo"
              className="h-7 w-7 object-contain group-hover:scale-105 transition-transform"
              src="/logo.png"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
              BSTORM
            </span>
            <span className="text-[11px] text-slate-500 tracking-wide font-medium mt-0.5">
              by Brainstorm Creators
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-all flex items-center gap-1.5"
            href="/courses"
          >
            <span>Courses</span>
          </Link>
          <a
            className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-all"
            href="#tracks"
          >
            Career Tracks
          </a>
          <a
            className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-all"
            href="#methodology"
          >
            Why BSTORM
          </a>
        </nav>

        {/* Right Actions & CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {user.isLoggedIn ? (
            <Link
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 transition-all"
              href="/dashboard"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 transition-all"
              href="/login"
            >
              Sign In
            </Link>
          )}

          <div className="h-5 w-px bg-slate-200/80 mx-0.5" />

          <Link
            className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(15,23,42,0.12)] hover:bg-slate-900 hover:shadow-[0_6px_20px_rgba(15,23,42,0.22)] active:scale-[0.98] transition-all group overflow-hidden border border-slate-800"
            href="/signup"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span>Start Learning</span>
            <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:translate-x-0.5 group-hover:text-white transition-all">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100/80 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[24px]">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-6 py-5 flex flex-col gap-4 shadow-xl animate-fadeIn">
          <Link
            href="/courses"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold text-slate-800 py-2 border-b border-slate-100"
          >
            Courses Catalog
          </Link>
          <a
            href="#tracks"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold text-slate-800 py-2 border-b border-slate-100"
          >
            Career Tracks
          </a>
          <a
            href="#methodology"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold text-slate-800 py-2 border-b border-slate-100"
          >
            Why BSTORM
          </a>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-800 border border-slate-200 bg-slate-50/50"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-slate-950 text-white text-sm font-semibold shadow-sm"
            >
              Start Learning
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
