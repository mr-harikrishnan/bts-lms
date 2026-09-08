"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Settings,
  LogOut,
  LogIn,
  X,
} from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useBstorm();
  const isLoggedIn = user?.isLoggedIn;

  const isCoursesActive =
    pathname === "/courses" || pathname.startsWith("/courses/");
  const isMyCoursesActive = pathname === "/my-courses";
  const isCertificatesActive =
    pathname === "/certificates" || pathname.startsWith("/certificates/");
  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClose) onClose();
    logout();
    router.replace("/");
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
              href={isLoggedIn ? "/dashboard" : "/"}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-stone-50 border border-stone-200 p-1">
                <Image
                  alt="BSTORM Logo"
                  className="object-contain"
                  src="/logo.png"
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-base font-bold text-[#2D3536] tracking-tight leading-tight">
                  BSTORM
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
                  href="/dashboard"
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
                  href="/courses"
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
                  href="/my-courses"
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
                  href="/certificates"
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
              </>
            ) : (
              /* Public / Logged-Out Navigation: Courses Only */
              <Link
                href="/courses"
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
                href="/settings"
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
              href="/login"
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
