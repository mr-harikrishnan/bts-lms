import React, { useState, useEffect } from "react";
import { X, Check, RotateCcw, SlidersHorizontal } from "lucide-react";

export interface FilterState {
  categories: string[];
  level: string;
  minPrice: number;
  maxPrice: number;
}

interface CourseFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: FilterState;
  onApply: (filters: FilterState) => void;
  availableCategories: string[];
}

export const CourseFilterModal: React.FC<CourseFilterModalProps> = ({
  isOpen,
  onClose,
  activeFilters,
  onApply,
  availableCategories,
}) => {
  const [draftCategories, setDraftCategories] = useState<string[]>(activeFilters.categories);
  const [draftLevel, setDraftLevel] = useState<string>(activeFilters.level);
  const [draftMinPrice, setDraftMinPrice] = useState<number>(activeFilters.minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState<number>(activeFilters.maxPrice);

  // Sync draft state with activeFilters whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftCategories(activeFilters.categories);
      setDraftLevel(activeFilters.level);
      setDraftMinPrice(activeFilters.minPrice);
      setDraftMaxPrice(activeFilters.maxPrice);
    }
  }, [isOpen, activeFilters]);

  if (!isOpen) return null;

  const toggleCategory = (category: string) => {
    setDraftCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleReset = () => {
    setDraftCategories([]);
    setDraftLevel("");
    setDraftMinPrice(0);
    setDraftMaxPrice(10000);
  };

  const handleConfirm = () => {
    onApply({
      categories: draftCategories,
      level: draftLevel,
      minPrice: draftMinPrice,
      maxPrice: draftMaxPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 px-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-800">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Filter Courses
              </h2>
              <p className="text-xs text-stone-500">
                Adjust criteria and click Confirm to apply
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 divide-y divide-stone-100">
          {/* 1. Price Filter (Range / Bar) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Price Range (₹)
              </label>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                ₹{draftMinPrice.toLocaleString()} – ₹{draftMaxPrice.toLocaleString()}
              </span>
            </div>

            {/* Range Bar Slider */}
            <div className="pt-2 pb-1">
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={draftMaxPrice}
                onChange={(e) => setDraftMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Inputs: Start Price & End Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-stone-500 block mb-1">Start Price</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={draftMaxPrice}
                    value={draftMinPrice}
                    onChange={(e) => setDraftMinPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-stone-500 block mb-1">End Price</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={draftMinPrice}
                    max="50000"
                    value={draftMaxPrice}
                    onChange={(e) => setDraftMaxPrice(Math.max(draftMinPrice, Number(e.target.value)))}
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Skill Level */}
          <div className="pt-5 flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Skill Level
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All Levels", value: "" },
                { label: "Beginner", value: "Beginner" },
                { label: "Intermediate", value: "Intermediate" },
                { label: "Advanced", value: "Advanced" },
              ].map((lvl) => {
                const isSelected = draftLevel === lvl.value;
                return (
                  <button
                    key={lvl.label}
                    type="button"
                    onClick={() => setDraftLevel(lvl.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-stone-100 hover:bg-stone-200/70 text-slate-700 border border-stone-200"
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Category (Multi-select) */}
          <div className="pt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Categories (Multi-Select)
              </label>
              {draftCategories.length > 0 && (
                <span className="text-xs text-stone-500">
                  {draftCategories.length} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableCategories.map((cat) => {
                const isChecked = draftCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-50 border-emerald-500/40 text-emerald-950 font-semibold"
                        : "bg-white border-stone-200 hover:bg-stone-50 text-slate-700 text-xs"
                    }`}
                  >
                    <span className="text-xs truncate mr-2">{cat}</span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-emerald-600 text-white"
                          : "border border-stone-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Confirm & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
