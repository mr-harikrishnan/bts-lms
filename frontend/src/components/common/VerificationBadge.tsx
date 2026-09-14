import React from 'react';

interface VerificationBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  color?: 'blue' | 'emerald';
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  size = 'md',
  tooltip = 'Verified Learner',
  color = 'blue',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  };

  const badgeColor = color === 'emerald' ? '#059669' : '#0095F6';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 group relative select-none ${className}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {/* Instagram-style Scalloped Verification Rosette */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${sizeClasses[size]} transition-transform duration-200 group-hover:scale-110 drop-shadow-xs`}
        style={{ color: badgeColor }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.5l-3.8-3.8 1.41-1.41 2.39 2.38 6.19-6.19 1.41 1.41-7.6 7.61z" style={{ display: 'none' }} />
        {/* Authentic 16-point Instagram Badge Shape */}
        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.06 4.31l-4.52-4.52 1.41-1.41 3.11 3.11 7.07-7.07 1.41 1.41-8.48 8.48z" />
      </svg>
    </span>
  );
};
