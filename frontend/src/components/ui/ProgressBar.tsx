import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  heightClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
  heightClass = "h-1.5",
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`w-full bg-surface-container rounded-full overflow-hidden ${heightClass} ${className}`}
    >
      <div
        className="h-full bg-secondary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
