"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function MyCoursesPage() {
  const { enrolledCourses, courses, getCourseProgress, certificates } = useBstorm();
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed">("in-progress");

  // Map enrolled progress with course data
  const enrolledWithData = enrolledCourses.map((enr) => {
    const course = courses.find((c) => c.id === enr.courseId) || courses[0];
    const progress = getCourseProgress(enr.courseId);
    const cert = certificates.find((c) => c.courseId === enr.courseId);
    const isCompleted = enr.isCompleted || progress.percentage === 100 || !!cert;

    return {
      enrollment: enr,
      course,
      progress,
      cert,
      isCompleted,
    };
  });

  const inProgressList = enrolledWithData.filter((item) => !item.isCompleted);
  const completedList = enrolledWithData.filter((item) => item.isCompleted);

  const currentList = activeTab === "in-progress" ? inProgressList : completedList;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <div className="mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Enrolled Tracks
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Courses
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track your active progress, resumed lessons, and earned industry credentials.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Enroll in More Tracks</span>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-3 border-b border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab("in-progress")}
            className={`pb-3 px-1 font-label-md text-label-md font-semibold transition-all relative ${
              activeTab === "in-progress"
                ? "text-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>In Progress ({inProgressList.length})</span>
            {activeTab === "in-progress" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-3 px-1 font-label-md text-label-md font-semibold transition-all relative ${
              activeTab === "completed"
                ? "text-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>Completed & Certified ({completedList.length})</span>
            {activeTab === "completed" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
            )}
          </button>
        </div>

        {/* Course List */}
        {currentList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentList.map(({ course, progress, cert, isCompleted }) => (
              <div
                key={course.id}
                className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-5 shadow-sm flex flex-col justify-between gap-4 group hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 relative bg-surface-container shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-primary/80 backdrop-blur-sm text-on-primary font-caption text-[10px] font-mono">
                      {course.duration}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-semibold">
                        {course.category}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-bold">
                          <span
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          Certified
                        </span>
                      ) : (
                        <span className="font-caption text-caption text-outline">
                          {progress.completedCount} of {progress.totalCount} Lessons
                        </span>
                      )}
                    </div>

                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold text-base leading-snug truncate">
                      {course.title}
                    </h3>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container">
                  <div className="flex justify-between font-caption text-caption text-on-surface-variant">
                    <span>Course Progress</span>
                    <span className="font-semibold text-secondary">
                      {progress.percentage}% Completed
                    </span>
                  </div>
                  <ProgressBar progress={progress.percentage} heightClass="h-2" />
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-surface-container"
                    />
                    <span className="font-caption text-caption text-on-surface-variant">
                      {course.instructor.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {cert ? (
                      <Link
                        href={`/certificates/${cert.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary-container text-on-secondary-fixed font-label-md text-label-md font-semibold hover:opacity-90 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          workspace_premium
                        </span>
                        <span>View Certificate</span>
                      </Link>
                    ) : progress.completedCount >= progress.totalCount ? (
                      <Link
                        href={`/test/${course.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary/90 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          verified
                        </span>
                        <span>Take Final Test</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${course.id}/learn`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
                      >
                        <span>Continue Course</span>
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_forward
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline">
              {activeTab === "in-progress" ? "school" : "workspace_premium"}
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              {activeTab === "in-progress"
                ? "No tracks currently in progress"
                : "No certificates earned yet"}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              {activeTab === "in-progress"
                ? "Explore our practical career courses to begin your self-paced learning journey."
                : "Complete all course lessons and score 70% or higher in the final test to earn your verified certificate."}
            </p>
            <Link
              href="/courses"
              className="mt-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
