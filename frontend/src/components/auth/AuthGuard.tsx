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

  // Always render children — pages handle their own loading skeletons via isLoading
  return <>{children}</>;
};
