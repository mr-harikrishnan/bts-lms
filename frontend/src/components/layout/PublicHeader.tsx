import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

export const PublicHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useBstorm();

  return (
    <header className="sticky top-0 left-0 right-0 h-16 sm:h-[68px] bg-white/95 backdrop-blur-md border-b border-stone-200/80 z-50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="w-full max-w-[1536px] mx-auto h-full px-4 sm:px-6 lg:px-10 xl:px-14 flex items-center justify-between">
        {/* Brand / Logo Group */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-50 border border-stone-200/80 p-1 group-hover:border-stone-300 transition-colors">
            <img
              alt="DLABS Logo"
              className="object-contain w-8 h-8"
              src="/logo.png"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-base sm:text-lg font-bold text-[#2D3536] tracking-tight leading-tight">
              DLABS
            </span>
            <span className="text-[11px] text-stone-500 font-medium tracking-normal leading-tight">
              by Brainstorm Creators
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-stone-600">
          <Link
            className="px-3.5 py-1.5 rounded-md hover:text-[#2D3536] hover:bg-stone-100/70 transition-colors"
            to="/courses"
          >
            Courses
          </Link>
          <Link
            className="px-3.5 py-1.5 rounded-md hover:text-[#2D3536] hover:bg-stone-100/70 transition-colors"
            to="/about"
          >
            About
          </Link>
          <Link
            className="px-3.5 py-1.5 rounded-md hover:text-[#2D3536] hover:bg-stone-100/70 transition-colors"
            to="/contact"
          >
            Contact
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-4">
          {user?.isLoggedIn ? (
            <Link
              className="text-xs sm:text-[13px] font-medium text-stone-700 hover:text-[#2D3536] transition-colors"
              to="/dashboard"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className="text-xs sm:text-[13px] font-medium text-stone-700 hover:text-[#2D3536] transition-colors"
              to="/login"
            >
              Sign In
            </Link>
          )}

          <Link
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D3536] text-white text-xs sm:text-[13px] font-medium hover:bg-stone-800 transition-colors shadow-xs group"
            to="/signup"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-6 py-4 flex flex-col gap-3 shadow-md">
          <Link
            to="/courses"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-stone-700 py-1.5 border-b border-stone-100"
          >
            Courses
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-stone-700 py-1.5 border-b border-stone-100"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-stone-700 py-1.5 border-b border-stone-100"
          >
            Contact Us
          </Link>
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-stone-700"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2D3536] text-white text-xs font-medium"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
