import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBstorm } from "@/context/BstormContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isHydrated } = useBstorm();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isHydrated && !user.isLoggedIn) {
      const isExplicitLogout =
        typeof window !== "undefined" &&
        sessionStorage.getItem("just_logged_out") === "true";

      if (isExplicitLogout) {
        navigate("/", { replace: true });
        return;
      }

      const redirectUrl = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
      navigate(redirectUrl, { replace: true });
    }
  }, [isHydrated, user.isLoggedIn, navigate, location]);

  // Always render children — pages handle their own loading skeletons via isLoading
  return <>{children}</>;
};
