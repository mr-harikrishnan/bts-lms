import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

export const PublicHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useBstorm();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              isActive("/")
                ? "text-[#2D3536] font-semibold bg-stone-100/90"
                : "hover:text-[#2D3536] hover:bg-stone-100/70"
            }`}
            to="/"
          >
            Home
          </Link>
          <Link
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              isActive("/courses")
                ? "text-[#2D3536] font-semibold bg-stone-100/90"
                : "hover:text-[#2D3536] hover:bg-stone-100/70"
            }`}
            to="/courses"
          >
            Courses
          </Link>
          <Link
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              isActive("/about")
                ? "text-[#2D3536] font-semibold bg-stone-100/90"
                : "hover:text-[#2D3536] hover:bg-stone-100/70"
            }`}
            to="/about"
          >
            About
          </Link>
          <Link
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              isActive("/contact")
                ? "text-[#2D3536] font-semibold bg-stone-100/90"
                : "hover:text-[#2D3536] hover:bg-stone-100/70"
            }`}
            to="/contact"
          >
            Contact
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user?.isLoggedIn ? (
            <>
              {user.role === "admin" && (
                <Link
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  to="/admin"
                >
                  Admin Console
                </Link>
              )}
              <Link
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D3536] text-white text-xs sm:text-[13px] font-medium hover:bg-stone-800 transition-colors shadow-xs group"
                to="/dashboard"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </>
          ) : (
            <>
              <Link
                className="text-xs sm:text-[13px] font-medium text-stone-700 hover:text-[#2D3536] transition-colors"
                to="/login"
              >
                Sign In
              </Link>
              <Link
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D3536] text-white text-xs sm:text-[13px] font-medium hover:bg-stone-800 transition-colors shadow-xs group"
                to="/signup"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </>
          )}
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
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`text-sm font-medium py-1.5 border-b border-stone-100 ${
              isActive("/") ? "text-[#2D3536] font-semibold" : "text-stone-700"
            }`}
          >
            Home
          </Link>
          <Link
            to="/courses"
            onClick={() => setMobileOpen(false)}
            className={`text-sm font-medium py-1.5 border-b border-stone-100 ${
              isActive("/courses") ? "text-[#2D3536] font-semibold" : "text-stone-700"
            }`}
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
            {user?.isLoggedIn ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2D3536] text-white text-xs font-medium"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
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
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
