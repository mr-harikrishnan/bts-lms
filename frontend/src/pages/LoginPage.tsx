import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useBstorm } from "@/context/BstormContext";
import { GuestGuard } from "@/components/auth/GuestGuard";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const { login } = useBstorm();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    navigate(redirectTarget, { replace: true });
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
        {/* Top minimal header */}
        <header className="h-20 px-6 sm:px-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              alt="DLABS Logo"
              className="h-9 w-9 rounded-xl object-contain shadow-xs ring-1 ring-slate-900/5 group-hover:scale-105 transition-transform"
              src="/logo.png"
            />
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-slate-900 tracking-tight leading-none">
                DLABS
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
                by Brainstorm Creators
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">New to DLABS?</span>
            <Link
              to="/signup"
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
                Sign in to DLABS
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

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hari@gmail.com"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm border border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
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
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="py-5 border-t border-slate-200/70 text-center text-xs text-slate-500 bg-white/50 backdrop-blur-sm">
          Provided by Brainstorm Creators • Designed for College Students & Beginners
        </footer>
      </div>
    </GuestGuard>
  );
};
