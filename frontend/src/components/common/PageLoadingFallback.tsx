import React from "react";

export const PageLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 select-none animate-fadeIn">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-stone-200/80 p-2 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="DLABS Logo"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-emerald-500/30 animate-ping pointer-events-none" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-display font-bold text-slate-800 tracking-tight text-sm">
            DLABS
          </span>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">
            Loading interface...
          </span>
        </div>
      </div>
    </div>
  );
};
