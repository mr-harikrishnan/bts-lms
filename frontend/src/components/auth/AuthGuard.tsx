"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBstorm } from "@/context/BstormContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isHydrated } = useBstorm();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isHydrated && !user.isLoggedIn) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isHydrated, user.isLoggedIn, router, pathname]);

  // Loading skeleton while hydrating or redirecting
  if (!isHydrated || !user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-stone-200 border-t-[#697C70] rounded-full animate-spin" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-[#2D3536]">
              Verifying Session
            </span>
            <span className="text-xs text-stone-500">
              Please wait while we prepare your learning workspace...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
