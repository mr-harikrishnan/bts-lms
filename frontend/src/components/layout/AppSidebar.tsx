import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Settings,
  LogOut,
  LogIn,
  X,
  Shield,
} from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { user, logout } = useBstorm();
  const isLoggedIn = user?.isLoggedIn;

  const isCoursesActive =
    pathname === "/courses" || pathname.startsWith("/courses/");
  const isMyCoursesActive = pathname === "/my-courses";
  const isCertificatesActive =
    pathname === "/certificates" || pathname.startsWith("/certificates/");
  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClose) onClose();
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#2D3536]/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-white border-r border-stone-200 z-50 flex flex-col justify-between py-6 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Platform Name */}
          <div className="px-6 mb-8 flex items-center justify-between">
            <Link
              to={isLoggedIn ? "/dashboard" : "/"}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-stone-50 border border-stone-200 p-1">
                <img
                  alt="DLABS Logo"
                  className="object-contain w-7 h-7"
                  src="/logo.png"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-base font-bold text-[#2D3536] tracking-tight leading-tight">
                  DLABS
                </span>
                <span className="text-[10px] text-stone-500 font-medium tracking-normal">
                  Practical Digital Skills
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-stone-500 hover:text-stone-900 rounded-lg"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 flex flex-col gap-1">
            {isLoggedIn ? (
              /* Authenticated Navigation */
              <>
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/courses"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isCoursesActive
                      ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Courses</span>
                </Link>

                <Link
                  to="/my-courses"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isMyCoursesActive
                      ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>My Courses</span>
                </Link>

                <Link
                  to="/certificates"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isCertificatesActive
                      ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Certificates</span>
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname.startsWith("/admin")
                        ? "bg-amber-500/10 text-amber-900 border border-amber-500/30 font-semibold"
                        : "text-amber-800 bg-amber-50/60 hover:bg-amber-100/80"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>Admin Console</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 text-[9px] font-mono uppercase font-bold">
                      Staff
                    </span>
                  </Link>
                )}
              </>
            ) : (
              /* Public / Logged-Out Navigation: Courses Only */
              <Link
                to="/courses"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isCoursesActive
                    ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                    : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Courses</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 border-t border-stone-200 pt-4 flex flex-col gap-1">
          {isLoggedIn ? (
            /* Authenticated Bottom Actions: Settings & Logout */
            <>
              <Link
                to="/settings"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isSettingsActive
                    ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                    : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            /* Public Bottom Action: Login Only */
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-100/70 hover:text-stone-900 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
