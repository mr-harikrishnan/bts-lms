"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const getBreadcrumbs = () => {
    if (customBreadcrumb) return customBreadcrumb;

    if (pathname === "/dashboard") {
      return (
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <span className="hover:text-on-surface transition-colors cursor-pointer">
            Platform
          </span>
          <span className="material-symbols-outlined text-[16px] text-outline">
            chevron_right
          </span>
          <span className="text-primary font-semibold">Dashboard Overview</span>
        </div>
      );
    }

    if (pathname === "/courses") {
      return (
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <Link href="/dashboard" className="hover:text-on-surface transition-colors">
            BSTORM
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline">
            chevron_right
          </span>
          <span className="text-primary font-semibold">Browse Courses</span>
        </div>
      );
    }

    if (pathname === "/my-courses") {
      return (
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <Link href="/dashboard" className="hover:text-on-surface transition-colors">
            Platform
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline">
            chevron_right
          </span>
          <span className="text-primary font-semibold">My Enrolled Courses</span>
        </div>
      );
    }

    if (pathname === "/certificates") {
      return (
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <Link href="/dashboard" className="hover:text-on-surface transition-colors">
            Platform
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline">
            chevron_right
          </span>
          <span className="text-primary font-semibold">Verified Credentials</span>
        </div>
      );
    }

    if (pathname.startsWith("/settings")) {
      return (
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <Link href="/dashboard" className="hover:text-on-surface transition-colors">
            Platform
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline">
            chevron_right
          </span>
          <span className="text-primary font-semibold">
            {pathname.includes("/profile") ? "Edit Profile" : "Account Settings"}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
        <Link href="/dashboard" className="hover:text-on-surface transition-colors">
          Platform
        </Link>
        <span className="material-symbols-outlined text-[16px] text-outline">
          chevron_right
        </span>
        <span className="text-primary font-semibold">Overview</span>
      </div>
    );
  };

  return (
    <header className="fixed top-0 lg:left-[260px] left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-[#E5E7EB] z-40 px-4 sm:px-8 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 text-primary hover:bg-surface-container-low rounded-lg"
          aria-label="Open Sidebar Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {getBreadcrumbs()}
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <button
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all relative"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface-container-lowest"></span>
        </button>

        <div className="h-6 w-[1px] bg-[#E5E7EB]"></div>

        <Link
          href="/settings/profile"
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight group-hover:text-primary transition-colors">
              {user.name || "Hari"}
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              Learner
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${user.name} Profile`}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E5E7EB] group-hover:ring-secondary transition-all"
            src={user.avatar}
          />
        </Link>
      </div>
    </header>
  );
};
