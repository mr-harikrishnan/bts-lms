import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  CreditCard,
  ExternalLink,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useBstorm();
  const pathname = location.pathname;

  const navItems = [
    { label: "Overview", to: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Courses", to: "/admin/courses", icon: BookOpen },
    { label: "Learners", to: "/admin/users", icon: Users },
    { label: "Enrollments", to: "/admin/enrollments", icon: GraduationCap },
    { label: "Transactions", to: "/admin/payments", icon: CreditCard },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.to;
    return pathname === item.to || pathname.startsWith(item.to + "/");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex text-stone-800 font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#1F2425] text-stone-200 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-stone-800 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-stone-800/80">
            <Link
              to="/admin"
              className="flex items-center gap-2.5 group select-none"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center p-1 group-hover:border-stone-500 transition-colors">
                <img alt="DLABS Logo" className="w-6 h-6 object-contain" src="/logo.png" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white tracking-tight">DLABS</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-semibold">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">LMS Management Console</span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-stone-400 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3 flex flex-col gap-1">
            <div className="px-3 pt-3 pb-1 text-[10px] font-mono tracking-wider text-stone-400 uppercase">
              Management
            </div>

            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    active
                      ? "bg-stone-800 text-white font-semibold shadow-xs border border-stone-700"
                      : "text-stone-300 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-amber-400" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & User Strip */}
        <div className="p-3 border-t border-stone-800/80 flex flex-col gap-2">
          {/* Switch to Learner View */}
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              <span>Learner View</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
          </Link>

          {/* Admin User info card */}
          <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-white truncate">{user.name || "Administrator"}</span>
                <span className="text-[10px] text-stone-400 font-mono truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-700/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                {title || "Admin Console"}
              </h1>
              {subtitle && <p className="text-xs text-stone-500 leading-tight">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] text-stone-700 font-medium">Session Secure</span>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <span>Switch to Learner Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
