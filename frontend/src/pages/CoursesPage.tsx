import React, { useState, useEffect, useMemo, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseCardSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { CourseFilterModal, FilterState } from "@/components/courses/CourseFilterModal";
import { Course } from "@/types";
import { courseService, categoryService } from "@/services/apiClient";
import { Search, SlidersHorizontal, X, RotateCcw, RotateCw, BookOpen } from "lucide-react";

const INITIAL_FILTERS: FilterState = {
  categories: [],
  level: "",
  minPrice: 0,
  maxPrice: 10000,
};

export const CoursesPage: React.FC = () => {
  const { courses: initialCourses } = useBstorm();

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isInitialLoad, setIsInitialLoad] = useState(initialCourses.length === 0);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    "Digital Marketing",
    "Content Creation",
    "Web Development",
    "Data Analytics",
    "Graphic Design",
  ]);

  // Keep track of active fetch requests to avoid race conditions
  const latestRequestId = useRef(0);

  // Load available categories from database
  useEffect(() => {
    categoryService.getAll().then((cats) => {
      if (cats && cats.length > 0) {
        setAvailableCategories(cats.map((c) => c.name));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialCourses.length > 0 && courses.length === 0) {
      setCourses(initialCourses);
      setIsInitialLoad(false);
    }
  }, [initialCourses, courses.length]);

  // Fetch courses with search + filters
  useEffect(() => {
    const requestId = ++latestRequestId.current;
    setIsFiltering(true);

    const timer = setTimeout(async () => {
      try {
        const data = await courseService.getAll({
          categories: activeFilters.categories.length > 0 ? activeFilters.categories : undefined,
          level: activeFilters.level || undefined,
          minPrice: activeFilters.minPrice > 0 ? activeFilters.minPrice : undefined,
          maxPrice: activeFilters.maxPrice < 10000 ? activeFilters.maxPrice : undefined,
          search: searchQuery.trim() || undefined,
        });

        if (requestId === latestRequestId.current) {
          setCourses(data);
          setIsInitialLoad(false);
        }
      } catch (err) {
        console.error("Failed to load courses from API:", err);
      } finally {
        if (requestId === latestRequestId.current) {
          setIsFiltering(false);
        }
      }
    }, searchQuery ? 250 : 0);

    return () => clearTimeout(timer);
  }, [activeFilters, searchQuery]);

  // Calculate active filter count for badge indicator
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilters.categories.length > 0) count += activeFilters.categories.length;
    if (activeFilters.level) count += 1;
    if (activeFilters.minPrice > 0 || activeFilters.maxPrice < 10000) count += 1;
    return count;
  }, [activeFilters]);

  const handleResetFilters = () => {
    setActiveFilters(INITIAL_FILTERS);
    setSearchQuery("");
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await courseService.getAll({
        categories: activeFilters.categories.length > 0 ? activeFilters.categories : undefined,
        level: activeFilters.level || undefined,
        minPrice: activeFilters.minPrice > 0 ? activeFilters.minPrice : undefined,
        maxPrice: activeFilters.maxPrice < 10000 ? activeFilters.maxPrice : undefined,
        search: searchQuery.trim() || undefined,
      });
      setCourses(data);
    } catch (err) {
      console.error("Failed to refresh courses:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoadingData = isInitialLoad || isFiltering || isRefreshing;

  return (
    <AppShell maxWidth="w-full max-w-[1536px]">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <header className="flex flex-col gap-2">
          <div className="flex flex-col">
            <div className="mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Course Catalog
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Practical Courses
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Hands-on digital skills designed for college students and beginners with verified certificates.
            </p>
          </div>
        </header>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by title, topic, or instructor..."
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white text-xs sm:text-sm font-medium text-slate-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter Button (Opens Modal) */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex-1 sm:flex-initial h-11 px-5 rounded-xl border font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeFilterCount > 0
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-stone-50 hover:bg-stone-100 text-slate-700 border-stone-200"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Refresh Courses Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-11 px-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              title="Refresh Courses"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-stone-500">Active filters:</span>

            {activeFilters.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      categories: prev.categories.filter((c) => c !== cat),
                    }))
                  }
                  className="hover:text-emerald-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {activeFilters.level && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium">
                <span>Level: {activeFilters.level}</span>
                <button
                  type="button"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, level: "" }))}
                  className="hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(activeFilters.minPrice > 0 || activeFilters.maxPrice < 10000) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium">
                <span>
                  Price: ₹{activeFilters.minPrice} – ₹{activeFilters.maxPrice}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      minPrice: 0,
                      maxPrice: 10000,
                    }))
                  }
                  className="hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 ml-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* Course Catalog Grid */}
        {isLoadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mb-1">
              <BookOpen className="w-7 h-7 text-stone-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No matching courses found
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md">
              We couldn't find any courses matching your search or filter criteria. Try adjusting the keywords or clearing selected filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <CourseFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeFilters={activeFilters}
        onApply={(updated) => setActiveFilters(updated)}
        availableCategories={availableCategories}
      />
    </AppShell>
  );
};
