import React, { useEffect, useRef, useState } from "react";

interface VideoAutoAdvanceProps {
  nextTitle: string;
  nextLabel?: string; // e.g. "Up Next" or "Module Complete – Loading Quiz"
  countdownSeconds?: number;
  onProceed: () => void;
  onStop: () => void;
}

export const VideoAutoAdvance: React.FC<VideoAutoAdvanceProps> = ({
  nextTitle,
  nextLabel = "Up Next",
  countdownSeconds = 5,
  onProceed,
  onStop,
}) => {
  const [remaining, setRemaining] = useState(countdownSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start ticking
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onStop();
  };

  const progress = ((countdownSeconds - remaining) / countdownSeconds) * 100;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-start p-5 bg-gradient-to-t from-black/85 via-black/30 to-transparent animate-fade-in pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 shadow-2xl max-w-lg w-full">
        {/* Countdown Ring */}
        <div className="relative shrink-0 w-14 h-14 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="3"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dash}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="relative z-10 text-white font-black text-xl leading-none">
            {remaining}
          </span>
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">
            {nextLabel}
          </p>
          <p className="text-white font-semibold text-sm leading-snug truncate">
            {nextTitle}
          </p>
        </div>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          className="shrink-0 px-4 py-2 rounded-xl border border-white/20 text-white/80 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all"
        >
          Stop
        </button>
      </div>
    </div>
  );
};
