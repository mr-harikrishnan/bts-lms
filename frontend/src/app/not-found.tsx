import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 font-sans text-[#2D3536]">
      {/* Top Header */}
      <header className="h-20 px-6 sm:px-10 border-b border-stone-200/70 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BSTORM Logo"
            className="h-9 w-9 rounded-xl object-contain shadow-xs ring-1 ring-slate-900/5 group-hover:scale-105 transition-transform"
            src="/logo.png"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#2D3536] tracking-tight leading-none">
              BSTORM
            </span>
            <span className="text-[11px] text-stone-500 font-medium tracking-wide mt-0.5">
              by Brainstorm Creators
            </span>
          </div>
        </Link>
        <Link
          href="/courses"
          className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-sm font-semibold hover:bg-stone-50 transition-colors shadow-xs"
        >
          Explore Courses
        </Link>
      </header>

      {/* Main 404 Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200/80 text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-stone-100 text-[#697C70] flex items-center justify-center ring-8 ring-stone-50">
            <span className="material-symbols-outlined text-[44px]">
              sentiment_dissatisfied
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#697C70]">
              Error 404 • Page Not Found
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3536] tracking-tight">
              Lost in the Digital Cloud?
            </h1>
            <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed mt-1">
              The page you are looking for does not exist, has been moved, or requires a different access link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            <Link
              href="/courses"
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#2D3536] text-white text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm text-center"
            >
              Browse Course Catalog
            </Link>
            <Link
              href="/"
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-stone-100 text-[#2D3536] text-sm font-semibold hover:bg-stone-200/70 border border-stone-200 transition-all text-center"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-5 border-t border-stone-200/70 text-center text-xs text-stone-500 bg-white/50 backdrop-blur-sm">
        Provided by Brainstorm Creators • Designed for College Students & Beginners
      </footer>
    </div>
  );
}
