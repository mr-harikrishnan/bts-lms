"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight, Bell, Menu, ArrowRight } from "lucide-react";
import { useBstorm } from "@/context/BstormContext";

interface TopBarProps {
  onMenuToggle?: () => void;
  customBreadcrumb?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuToggle,
  customBreadcrumb,
}) => {
  const pathname = usePathname();
  const { user } = useBstorm();
  const isLoggedIn = user?.isLoggedIn;

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
            href={isLoggedIn ? "/dashboard" : "/"}
            className="hover:text-stone-900 transition-colors"
          >
            BSTORM
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2D3536] font-semibold">Courses Catalog</span>
        </div>
      );
    }

    if (pathname === "/my-courses") {
      return (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
          <Link href="/dashboard" className="hover:text-stone-900 transition-colors">
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
          <Link href="/dashboard" className="hover:text-stone-900 transition-colors">
            Platform
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2D3536] font-semibold">Certificates</span>
        </div>
      );
    }

    if (pathname.startsWith("/settings")) {
      return (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 font-medium">
          <Link href="/dashboard" className="hover:text-stone-900 transition-colors">
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
          href={isLoggedIn ? "/dashboard" : "/"}
          className="hover:text-stone-900 transition-colors"
        >
          BSTORM
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#2D3536] font-semibold">Learning Platform</span>
      </div>
    );
  };

  return (
    <header className="fixed top-0 lg:left-[260px] left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200 z-40 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
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
            <button
              className="p-2 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#697C70] ring-2 ring-white"></span>
            </button>

            <div className="h-5 w-[1px] bg-stone-200"></div>

            <Link
              href="/settings/profile"
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-semibold text-[#2D3536] leading-tight group-hover:text-[#697C70] transition-colors">
                  {user.name || "Hari"}
                </span>
                <span className="text-[11px] text-stone-500">
                  Learner
                </span>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-stone-200 group-hover:ring-[#697C70] transition-colors relative">
                <Image
                  alt={`${user.name || "User"} Profile`}
                  className="object-cover"
                  src={user.avatar || "/logo.png"}
                  width={32}
                  height={32}
                />
              </div>
            </Link>
          </>
        ) : (
          /* Public / Logged Out Header Right Elements */
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-stone-700 hover:text-[#2D3536] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
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
