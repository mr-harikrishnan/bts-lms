"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { CourseCard } from "@/components/courses/CourseCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function DashboardPage() {
  const { user, courses, enrolledCourses, getCourseProgress, certificates } = useBstorm();

  // Primary active course for Continue Learning hero
  const activeEnrollment = enrolledCourses[0];
  const activeCourse = activeEnrollment
    ? courses.find((c) => c.id === activeEnrollment.courseId)
    : courses[0];

  const activeProgress = activeCourse
    ? getCourseProgress(activeCourse.id)
    : { completedCount: 0, totalCount: 12, percentage: 0 };

  // Recommended courses that are not yet enrolled
  const recommendedCourses = courses
    .filter((c) => !enrolledCourses.some((e) => e.courseId === c.id))
    .slice(0, 2);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        {/* Welcome Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <div className="mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Student Workspace
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user.name || "Hari"}!
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Enrolled with {user.grantName || "PSG Tech Academic Grant"} • {user.college || "PSG College of Technology"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>

        {/* Learning Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-caption text-caption font-medium">Enrolled Tracks</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">
                auto_stories
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              {enrolledCourses.length}
            </span>
            <span className="font-caption text-caption text-secondary font-medium">
              Active Curriculum
            </span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-caption text-caption font-medium">Lessons Completed</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">
                done_all
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              {enrolledCourses.reduce(
                (acc, e) => acc + e.completedLessonIds.length,
                0
              )}
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              Across all tracks
            </span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-caption text-caption font-medium">Credentials Earned</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">
                workspace_premium
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              {certificates.length}
            </span>
            <span className="font-caption text-caption text-secondary font-medium">
              Verified Certificates
            </span>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-caption text-caption font-medium">Student Standing</span>
              <span className="material-symbols-outlined text-[#E5A93C] text-[20px]">
                military_tech
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              Top 8%
            </span>
            <span className="font-caption text-caption text-secondary font-semibold">
              Top Performer
            </span>
          </div>
        </div>

        {/* Continue Learning Featured Banner */}
        {activeCourse && (
          <section className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start w-full lg:w-auto">
              {/* 16:9 Thumbnail */}
              <div className="w-full sm:w-56 aspect-video rounded-xl overflow-hidden shrink-0 relative bg-surface-container shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCourse.thumbnail}
                  alt={activeCourse.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-primary/80 backdrop-blur-sm text-on-primary font-caption text-caption font-mono">
                  {activeCourse.duration}
                </span>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                    Continue Learning
                  </span>
                  <span className="font-caption text-caption text-outline">
                    {activeCourse.category}
                  </span>
                </div>

                <h2 className="font-headline-sm text-headline-sm text-primary font-bold leading-snug">
                  {activeCourse.title}
                </h2>

                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 max-w-xl">
                  {activeCourse.description}
                </p>

                {/* Progress bar */}
                <div className="mt-2 flex flex-col gap-1.5 max-w-md">
                  <div className="flex justify-between font-caption text-caption">
                    <span className="text-on-surface-variant">Course Progress</span>
                    <span className="font-bold text-secondary">
                      {activeProgress.percentage}% ({activeProgress.completedCount}/
                      {activeProgress.totalCount} Lessons)
                    </span>
                  </div>
                  <ProgressBar progress={activeProgress.percentage} heightClass="h-2" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <Link
                href={`/courses/${activeCourse.id}/learn`}
                className="px-6 py-3 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary/90 transition-all shadow-sm flex items-center justify-center gap-2 text-center"
              >
                <span>Resume Workspace</span>
                <span className="material-symbols-outlined text-[18px]">
                  play_arrow
                </span>
              </Link>
              <Link
                href="/my-courses"
                className="px-6 py-3 rounded-xl bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container transition-all border border-[#E5E7EB] flex items-center justify-center gap-2 text-center"
              >
                <span>View All Enrolled</span>
              </Link>
            </div>
          </section>
        )}

        {/* Recommended Tracks Section */}
        <section className="flex flex-col gap-5 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Recommended Specializations for You
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Based on your learning history and career goals.
              </p>
            </div>
            <Link
              href="/courses"
              className="font-label-md text-label-md text-secondary font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Explore All</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
