import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isHydrated, logout } = useBstorm();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isHydrated && !user.isLoggedIn) {
      const isExplicitLogout =
        typeof window !== "undefined" &&
        sessionStorage.getItem("just_logged_out") === "true";

      if (isExplicitLogout) {
        navigate("/", { replace: true });
        return;
      }

      const redirectUrl = `/login?redirect=${encodeURIComponent(
        location.pathname + location.search
      )}`;
      navigate(redirectUrl, { replace: true });
    }
  }, [isHydrated, user.isLoggedIn, navigate, location]);

  // 1. Show secure loader while hydrating session
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 text-stone-200">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400 mb-4" />
        <p className="text-xs font-mono tracking-wider uppercase text-stone-400">
          Authenticating Administrative Credentials...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: redirected via useEffect; render placeholder to prevent UI flash
  if (!user.isLoggedIn) {
    const isExplicitLogout =
      typeof window !== "undefined" &&
      sessionStorage.getItem("just_logged_out") === "true";

    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
        <p className="text-xs text-stone-400 font-mono">
          {isExplicitLogout ? "Signing out..." : "Redirecting to Secure Sign In..."}
        </p>
      </div>
    );
  }

  // 3. Authenticated but lacks Administrator privileges: Zero-trust Access Denied screen
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#1F2425] flex items-center justify-center p-4 sm:p-6 select-none">
        <div className="w-full max-w-md bg-stone-900/95 border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl text-center backdrop-blur-xl relative overflow-hidden">
          {/* Ambient Security Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono uppercase tracking-wider mb-3">
            Error 403 • Forbidden Access
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Administrative Privileges Required
          </h1>

          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-6">
            The requested console is restricted strictly to authorized platform administrators. Your account (<span className="text-stone-300 font-mono">{user.email}</span>) does not possess executive elevation.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/dashboard"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D3536] hover:bg-stone-700 text-white text-xs sm:text-sm font-medium transition-colors border border-stone-700 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Learner Portal</span>
            </Link>

            <button
              onClick={async () => {
                await logout("/login");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs sm:text-sm font-medium transition-colors border border-stone-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Fully Authorized Administrator
  return <>{children}</>;
};
