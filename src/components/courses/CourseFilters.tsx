"use client";

import React from "react";
import { CourseCategory } from "@/types";

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CourseCategory;
  onCategoryChange: (cat: CourseCategory) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  selectedDuration: string;
  onDurationChange: (dur: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  counts: {
    all: number;
    marketing: number;
    content: number;
    web: number;
  };
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  selectedDuration,
  onDurationChange,
  selectedSort,
  onSortChange,
  counts,
}) => {
  return (
    <div className="bg-surface-container-lowest p-4 md:p-5 rounded-xl shadow-sm flex flex-col gap-4 border border-[#E5E7EB]">
      {/* Top row: Search input + secondary dropdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="relative lg:col-span-6">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            id="course-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses, topics, or skills..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary border border-transparent focus:border-secondary shadow-sm transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-3 gap-2 lg:col-span-6">
          {/* Skill Level Dropdown */}
          <div className="relative">
            <select
              value={selectedLevel}
              onChange={(e) => onLevelChange(e.target.value)}
              className="w-full appearance-none bg-surface-container-low font-label-md text-label-md text-on-surface px-3 py-2.5 rounded-xl cursor-pointer focus:outline-none hover:bg-surface-container border border-transparent focus:border-secondary transition-colors"
            >
              <option value="">Skill Level (All)</option>
              <option value="Beginner-Friendly">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Duration Dropdown */}
          <div className="relative">
            <select
              value={selectedDuration}
              onChange={(e) => onDurationChange(e.target.value)}
              className="w-full appearance-none bg-surface-container-low font-label-md text-label-md text-on-surface px-3 py-2.5 rounded-xl cursor-pointer focus:outline-none hover:bg-surface-container border border-transparent focus:border-secondary transition-colors"
            >
              <option value="">Duration (Any)</option>
              <option value="short">4 - 8 Weeks</option>
              <option value="medium">8 - 12 Weeks</option>
              <option value="long">14 - 16 Weeks</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full appearance-none bg-surface-container-low font-label-md text-label-md text-on-surface px-3 py-2.5 rounded-xl cursor-pointer focus:outline-none hover:bg-surface-container border border-transparent focus:border-secondary transition-colors"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="newest">Sort: Newly Released</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: Track category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <button
          onClick={() => onCategoryChange("All Tracks")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
            selectedCategory === "All Tracks"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          }`}
        >
          All Tracks ({counts.all})
        </button>

        <button
          onClick={() => onCategoryChange("Digital Marketing")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
            selectedCategory === "Digital Marketing"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          }`}
        >
          Digital Marketing ({counts.marketing})
        </button>

        <button
          onClick={() => onCategoryChange("Content Creation")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
            selectedCategory === "Content Creation"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          }`}
        >
          Content Creation ({counts.content})
        </button>

        <button
          onClick={() => onCategoryChange("Web Development")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
            selectedCategory === "Web Development"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          }`}
        >
          Web Development ({counts.web})
        </button>

        <div className="ml-auto hidden xl:flex items-center gap-1.5 text-outline font-caption text-caption">
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Showing {counts.all} catalog tracks</span>
        </div>
      </div>
    </div>
  );
};
