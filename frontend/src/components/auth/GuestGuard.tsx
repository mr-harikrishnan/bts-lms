"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBstorm } from "@/context/BstormContext";

interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { user, isHydrated } = useBstorm();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && user.isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isHydrated, user.isLoggedIn, router]);

  // Prevent flash while checking session or redirecting authenticated users
  if (!isHydrated || user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-stone-200 border-t-[#697C70] rounded-full animate-spin" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-[#2D3536]">
              Loading Workspace
            </span>
            <span className="text-xs text-stone-500">
              Verifying your session...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
