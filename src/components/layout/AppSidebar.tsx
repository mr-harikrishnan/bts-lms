"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBstorm } from "@/context/BstormContext";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useBstorm();

  const isCoursesActive =
    pathname === "/courses" || pathname.startsWith("/courses/");
  const isMyCoursesActive = pathname === "/my-courses";
  const isCertificatesActive =
    pathname === "/certificates" || pathname.startsWith("/certificates/");
  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest border-r border-[#E5E7EB] z-50 flex flex-col justify-between py-6 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Platform Name */}
          <div className="px-6 mb-8 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              onClick={onClose}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="BSTORM Logo"
                className="h-9 w-9 rounded-lg object-contain shadow-xs"
                src="/logo.png"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-none">
                  BSTORM
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium tracking-wider uppercase mt-0.5">
                  by Brainstorm Creators
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-on-surface-variant hover:text-primary rounded-lg"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 flex flex-col gap-1.5">
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                pathname === "/dashboard"
                  ? "bg-secondary-container text-on-secondary-fixed font-semibold"
                  : "font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                dashboard
              </span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/courses"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isCoursesActive
                  ? "bg-secondary-container text-on-secondary-fixed font-semibold"
                  : "font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                auto_stories
              </span>
              <span>Courses</span>
            </Link>

            <Link
              href="/my-courses"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isMyCoursesActive
                  ? "bg-secondary-container text-on-secondary-fixed font-semibold"
                  : "font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                school
              </span>
              <span>My Courses</span>
            </Link>

            <Link
              href="/certificates"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isCertificatesActive
                  ? "bg-secondary-container text-on-secondary-fixed font-semibold"
                  : "font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                workspace_premium
              </span>
              <span>Certificates</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 border-t border-[#E5E7EB] pt-4 flex flex-col gap-1.5">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isSettingsActive
                ? "bg-secondary-container text-on-secondary-fixed font-semibold"
                : "font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
            <span>Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-label-md text-label-md text-error hover:bg-error-container hover:text-on-error-container transition-all text-left w-full"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
