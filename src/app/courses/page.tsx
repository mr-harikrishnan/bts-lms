"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseCategory } from "@/types";

export default function CoursesCatalogPage() {
  const { courses } = useBstorm();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>("All Tracks");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedSort, setSelectedSort] = useState("popular");

  // Category counts
  const counts = useMemo(() => {
    return {
      all: courses.length,
      marketing: courses.filter((c) => c.category === "Digital Marketing").length,
      content: courses.filter((c) => c.category === "Content Creation").length,
      web: courses.filter((c) => c.category === "Web Development").length,
    };
  }, [courses]);

  // Filtered & Sorted courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        // Category filter
        if (
          selectedCategory !== "All Tracks" &&
          course.category !== selectedCategory
        ) {
          return false;
        }

        // Skill level filter
        if (selectedLevel && course.level !== selectedLevel) {
          return false;
        }

        // Duration filter
        if (selectedDuration === "short" && course.durationWeeks > 8) return false;
        if (
          selectedDuration === "medium" &&
          (course.durationWeeks < 8 || course.durationWeeks > 12)
        )
          return false;
        if (selectedDuration === "long" && course.durationWeeks < 13) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = course.title.toLowerCase().includes(q);
          const matchesDesc = course.description.toLowerCase().includes(q);
          const matchesSkills = course.skills.some((s) =>
            s.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesDesc && !matchesSkills) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "rating") return b.rating - a.rating;
        if (selectedSort === "newest") return b.originalPrice - a.originalPrice;
        // Default most popular (reviewsCount)
        return b.reviewsCount - a.reviewsCount;
      });
  }, [
    courses,
    selectedCategory,
    selectedLevel,
    selectedDuration,
    searchQuery,
    selectedSort,
  ]);

  return (
    <AppShell maxWidth="max-w-[1280px]">
      <div className="flex flex-col gap-6">
        {/* Self-Paced Courses Highlights Banner */}
        <section className="w-full">
          <div className="relative overflow-hidden bg-primary-container text-on-primary rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#E5E7EB]">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  campaign
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
                    Self-Paced Tracks
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="font-caption text-caption text-secondary-fixed-dim">
                    Beginner Friendly · Instant Access
                  </span>
                </div>
                <p className="font-body-md text-body-md text-surface-container-lowest mt-0.5">
                  Learn practical digital skills step-by-step with hands-on practice projects.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 z-10">
              <a
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-sm font-semibold"
                href="#catalog"
              >
                <span>Browse Courses</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Page Header & Integrated Search Toolbar */}
        <header className="flex flex-col gap-4" id="catalog">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col">
              <div className="mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Course Catalog
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Practical Online Courses
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Simple, step-by-step practical courses designed for college students and beginners.
              </p>
            </div>
          </div>

          {/* Search & Filter Component */}
          <CourseFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            selectedDuration={selectedDuration}
            onDurationChange={setSelectedDuration}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            counts={counts}
          />
        </header>

        {/* 3-Column Course Grid */}
        <main className="mb-12">
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-outline">
                search_off
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                No courses found matching &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                Try adjusting your search terms or clearing category filters to view all available tracks.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Tracks");
                  setSelectedLevel("");
                  setSelectedDuration("");
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}
