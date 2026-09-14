import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Bell,
  Menu,
  ArrowRight,
  BookOpen,
  LifeBuoy,
  CheckCircle2,
  Trash2,
  X,
} from "lucide-react";
import { useBstorm } from "@/context/BstormContext";
import { VerificationBadge } from "@/components/common/VerificationBadge";

interface TopBarProps {
  onMenuToggle?: () => void;
  customBreadcrumb?: React.ReactNode;
  isCollapsed?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuToggle,
  customBreadcrumb,
  isCollapsed = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const {
    user,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    refreshNotifications,
  } = useBstorm();
  const isLoggedIn = user?.isLoggedIn;

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    await markNotificationRead(notif._id);
    setNotifOpen(false);

    if (notif.type === "course_new" && notif.courseId) {
      const courseId = typeof notif.courseId === "object" ? notif.courseId._id : notif.courseId;
      navigate(`/courses`);
    } else if (notif.type === "ticket_reply") {
      navigate(`/help`);
    }
  };

  const getBreadcrumbs = () => {
    if (customBreadcrumb) return customBreadcrumb;

    if (pathname === "/dashboard") {
      return (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
          <span className="hover:text-stone-900 transition-colors">Platform</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2D3536] font-semibold">Dashboard</span>
        </div>
      );
    }

    if (pathname === "/courses") {
      return (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className="hover:text-stone-900 transition-colors"
          >
            DLABS
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2D3536] font-semibold">Courses Catalog</span>
        </div>
      );
    }

    if (pathname === "/my-courses") {
      return (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
          <Link to="/dashboard" className="hover:text-stone-900 transition-colors">
            Platform
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2D3536] font-semibold">My Courses</span>
        </div>
      );
    }

    if (pathname === "/certificates") {
      return (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
          <Link to="/dashboard" className="hover:text-stone-900 transition-colors">
            Platform
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2D3536] font-semibold">Certificates</span>
        </div>
      );
    }

    if (pathname.startsWith("/help")) {
      return (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
          <Link to="/dashboard" className="hover:text-stone-900 transition-colors">
            Platform
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2D3536] font-semibold">Help & Support</span>
        </div>
      );
    }

    if (pathname.startsWith("/settings")) {
      return (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
          <Link to="/dashboard" className="hover:text-stone-900 transition-colors">
            Platform
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2D3536] font-semibold">
            {pathname.includes("/profile") ? "Edit Profile" : "Account Settings"}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
        <Link
          to={isLoggedIn ? "/dashboard" : "/"}
          className="hover:text-stone-900 transition-colors"
        >
          DLABS
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#2D3536] font-semibold">Learning Platform</span>
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? "lg:left-[72px]" : "lg:left-[260px]"
      } left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200 z-40 px-4 sm:px-8 flex items-center justify-between shadow-2xs`}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 text-stone-700 hover:bg-stone-100 rounded-lg"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {getBreadcrumbs()}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {isLoggedIn ? (
          /* Authenticated Header Right Elements */
          <>
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) refreshNotifications().catch(() => {});
                }}
                className="p-2 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Popover Panel */}
              {notifOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-80 sm:w-96 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3.5 px-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Notifications
                      </span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-2">
                        <Bell className="w-8 h-8 text-stone-300 stroke-1" />
                        <span className="font-semibold text-stone-600 text-sm">No notifications</span>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 hover:bg-stone-50 transition-colors cursor-pointer flex items-start gap-3 group ${
                            !notif.isRead ? "bg-emerald-50/30" : ""
                          }`}
                        >
                          <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-100/70 text-emerald-800 shrink-0">
                            {notif.type === "course_new" ? (
                              <BookOpen className="w-3.5 h-3.5" />
                            ) : (
                              <LifeBuoy className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-xs font-semibold truncate ${
                                  !notif.isRead ? "text-slate-900 font-bold" : "text-slate-700"
                                }`}
                              >
                                {notif.title}
                              </span>
                              {!notif.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notif._id);
                            }}
                            title="Clear notification"
                            className="p-1 rounded-md text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-[1px] bg-stone-200"></div>

            <Link
              to="/settings/profile"
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-xs font-semibold text-[#2D3536] leading-tight group-hover:text-emerald-700 transition-colors">
                    {user.name || "User"}
                  </span>
                  <VerificationBadge size="sm" color="blue" tooltip="Verified Student" />
                </div>
                <span className="text-[11px] text-stone-500 capitalize">
                  {user.role === "admin" ? "Administrator" : "Learner"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-stone-200 group-hover:ring-emerald-600 transition-colors relative bg-stone-100 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    alt={`${user.name || "User"} Profile`}
                    className="object-cover w-full h-full"
                    src={user.avatar}
                  />
                ) : (
                  <span className="text-xs font-bold text-stone-700">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          </>
        ) : (
          /* Public / Logged Out Header Right Elements */
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium text-stone-700 hover:text-[#2D3536] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2D3536] text-white text-xs sm:text-sm font-medium hover:bg-stone-800 transition-colors shadow-2xs group"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
