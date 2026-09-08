"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseCategory, Course } from "@/types";
import { courseService } from "@/services/apiClient";

export default function CoursesCatalogPage() {
  const { courses: initialCourses } = useBstorm();

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isInitialLoad, setIsInitialLoad] = useState(initialCourses.length === 0);
  const [isFiltering, setIsFiltering] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>("All Tracks");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedSort, setSelectedSort] = useState("popular");

  // Keep track of active fetch requests to avoid race conditions
  const latestRequestId = useRef(0);

  useEffect(() => {
    if (initialCourses.length > 0 && courses.length === 0) {
      setCourses(initialCourses);
      setIsInitialLoad(false);
    }
  }, [initialCourses, courses.length]);

  useEffect(() => {
    const requestId = ++latestRequestId.current;
    setIsFiltering(true);

    const timer = setTimeout(async () => {
      try {
        const data = await courseService.getAll({
          category: selectedCategory !== "All Tracks" ? selectedCategory : undefined,
          level: selectedLevel || undefined,
          duration: selectedDuration || undefined,
          search: searchQuery || undefined,
          sort: selectedSort || undefined,
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
    }, searchQuery ? 250 : 0); // Debounce search queries

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedLevel, selectedDuration, searchQuery, selectedSort]);

  // Category counts from currently loaded catalog
  const counts = useMemo(() => {
    const totalSource = initialCourses.length > 0 ? initialCourses : courses;
    return {
      all: totalSource.length,
      marketing: totalSource.filter((c) => c.category === "Digital Marketing").length,
      content: totalSource.filter((c) => c.category === "Content Creation").length,
      web: totalSource.filter((c) => c.category === "Web Development").length,
    };
  }, [initialCourses, courses]);

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
                    Industry Program
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-stone-300">Self-Paced Learning</span>
                </div>
                <h3 className="font-title-md text-base md:text-lg font-bold text-white mt-0.5">
                  100% Practical Skills • Real Industry Capstones
                </h3>
                <p className="font-body-sm text-xs md:text-sm text-stone-300 max-w-xl">
                  Structured learning tracks with live capstone projects, personalized code reviews, and industry certificates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 z-10 w-full md:w-auto">
              <a
                href="#catalog"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary font-label-md text-label-md font-bold hover:bg-stone-100 transition-all shadow-sm"
              >
                <span>Browse Tracks</span>
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

          {/* Search & Filter Component - Stays mounted to retain focus */}
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
          {isInitialLoad ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]"
                />
              ))}
            </div>
          ) : isFiltering ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-60 transition-opacity">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-outline">
                search_off
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                {searchQuery.trim()
                  ? `No courses found matching "${searchQuery}"`
                  : "No courses found matching selected filters"}
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
