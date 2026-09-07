import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "neutral" | "outline" | "active";
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "secondary",
  className = "",
  size = "md",
}) => {
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] font-semibold"
      : "px-2.5 py-1 text-label-sm font-semibold";

  let variantClasses = "bg-secondary-container text-on-secondary-fixed";

  if (variant === "primary") {
    variantClasses = "bg-primary text-on-primary";
  } else if (variant === "tertiary") {
    variantClasses = "bg-tertiary-fixed text-on-tertiary-fixed";
  } else if (variant === "neutral") {
    variantClasses = "bg-surface-container text-on-surface-variant font-medium";
  } else if (variant === "outline") {
    variantClasses = "bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-medium border border-[#E5E7EB]";
  } else if (variant === "active") {
    variantClasses = "bg-secondary/10 text-secondary font-bold";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};
