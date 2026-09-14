import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBstorm } from "@/context/BstormContext";

interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { user, isHydrated } = useBstorm();
  const navigate = useNavigate();

  useEffect(() => {
    if (isHydrated && user.isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isHydrated, user.isLoggedIn, navigate]);

  // When hydrated and logged in, redirecting immediately without showing full-page loading flash
  if (isHydrated && user.isLoggedIn) {
    return null;
  }

  return <>{children}</>;
};
