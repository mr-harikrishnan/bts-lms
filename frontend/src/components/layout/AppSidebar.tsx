import React, { useState } from "react";
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
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LifeBuoy,
} from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { user, logout } = useBstorm();
  const isLoggedIn = user?.isLoggedIn;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isCoursesActive =
    pathname === "/courses" || pathname.startsWith("/courses/");
  const isMyCoursesActive = pathname === "/my-courses";
  const isCertificatesActive =
    pathname === "/certificates" || pathname.startsWith("/certificates/");
  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");
  const isHelpActive =
    pathname === "/help" || pathname.startsWith("/help") || pathname.startsWith("/help/");
  const isAdminTicketsActive =
    pathname === "/admin/tickets" || pathname.startsWith("/admin/tickets");

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
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
        className={`fixed left-0 top-0 h-full bg-white border-r border-stone-200 z-50 flex flex-col justify-between py-5 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]"
        } w-[260px] ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Row 1: Logo & Branding */}
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center px-2" : "justify-between px-5"
            }`}
          >
            <Link
              to={isLoggedIn ? "/dashboard" : "/"}
              className="flex items-center gap-3 overflow-hidden"
              onClick={onClose}
              title={isCollapsed ? "DLABS - Practical Digital Skills" : undefined}
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 p-1 shrink-0">
                <img
                  alt="DLABS Logo"
                  className="object-contain w-7 h-7"
                  src="/logo.png"
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-sans text-base font-bold text-[#2D3536] tracking-tight leading-tight">
                    DLABS
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium tracking-normal truncate">
                    Practical Digital Skills
                  </span>
                </div>
              )}
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

          {/* Row 2: Dedicated Open / Close Control in Separate Row */}
          {onToggleCollapse && (
            <div
              className={`hidden lg:flex ${
                isCollapsed ? "justify-center px-2 mt-3 mb-4" : "px-5 mt-2.5 mb-5"
              }`}
            >
              <button
                type="button"
                onClick={onToggleCollapse}
                className={`flex items-center text-xs font-medium text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-xl transition-all cursor-pointer ${
                  isCollapsed
                    ? "w-8 h-8 justify-center p-0"
                    : "w-full px-3 py-1.5 justify-between"
                }`}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {!isCollapsed && <span className="text-[11px] text-stone-500">Collapse Menu</span>}
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-stone-600" />
                )}
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-2.5 flex flex-col gap-1">
            {isLoggedIn ? (
              /* Authenticated Navigation */
              <>
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  title={isCollapsed ? "Dashboard" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Dashboard</span>}
                </Link>

                <Link
                  to="/courses"
                  onClick={onClose}
                  title={isCollapsed ? "Courses" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isCoursesActive
                      ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Courses</span>}
                </Link>

                <Link
                  to="/my-courses"
                  onClick={onClose}
                  title={isCollapsed ? "My Courses" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isMyCoursesActive
                      ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>My Courses</span>}
                </Link>

                <Link
                  to="/certificates"
                  onClick={onClose}
                  title={isCollapsed ? "Certificates" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isCertificatesActive
                      ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Certificates</span>}
                </Link>

                {user.role === "admin" && (
                  <>
                    <Link
                      to="/admin"
                      onClick={onClose}
                      title={isCollapsed ? "Admin Console" : undefined}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        pathname === "/admin" || (pathname.startsWith("/admin") && !isAdminTicketsActive)
                          ? "bg-amber-500/10 text-amber-900 border border-amber-500/30 font-semibold"
                          : "text-amber-800 bg-amber-50/60 hover:bg-amber-100/80"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <span className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                        {!isCollapsed && <span>Admin Console</span>}
                      </span>
                      {!isCollapsed && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 text-[9px] font-mono uppercase font-bold">
                          Staff
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/admin/tickets"
                      onClick={onClose}
                      title={isCollapsed ? "Admin Tickets" : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isAdminTicketsActive
                          ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                          : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <LifeBuoy className="w-4 h-4 shrink-0 text-emerald-600" />
                      {!isCollapsed && <span>Support Tickets</span>}
                    </Link>
                  </>
                )}
              </>
            ) : (
              /* Public / Logged-Out Navigation: Courses Only */
              <Link
                to="/courses"
                onClick={onClose}
                title={isCollapsed ? "Courses" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isCoursesActive
                    ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                    : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Courses</span>}
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="px-2.5 border-t border-stone-200 pt-3 flex flex-col gap-1">
          {isLoggedIn ? (
            /* Authenticated Bottom Actions: Settings, Help & Logout */
            <>
              <Link
                to="/settings"
                onClick={onClose}
                title={isCollapsed ? "Settings" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isSettingsActive
                    ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                    : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </Link>

              {/* Help & Support Tickets Link - Positioned above Logout */}
              <Link
                to="/help"
                onClick={onClose}
                title={isCollapsed ? "Help & Support Tickets" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isHelpActive
                    ? "bg-[#2D3536] text-white font-semibold shadow-xs"
                    : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <HelpCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                {!isCollapsed && <span>Help & Support</span>}
              </Link>

              <button
                type="button"
                onClick={handleLogoutClick}
                title={isCollapsed ? "Logout" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left w-full cursor-pointer ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </>
          ) : (
            /* Public Bottom Action: Login Only */
            <Link
              to="/login"
              onClick={onClose}
              title={isCollapsed ? "Login" : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-100/70 hover:text-stone-900 transition-colors ${
                isCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Login</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1.5">Sign Out Confirmation</h3>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              Are you sure you want to sign out of your account? Any active progress has been securely saved.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
