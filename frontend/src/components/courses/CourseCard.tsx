"use client";

import React from "react";
import Link from "next/link";
import { Course } from "@/types";
import { useBstorm } from "@/context/BstormContext";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { isEnrolled, getCourseProgress, user } = useBstorm();
  const enrolled = user.isLoggedIn && isEnrolled(course._id);
  const { completedCount, totalCount, percentage } = getCourseProgress(course._id);

  // Category badge styling
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Digital Marketing":
        return "bg-secondary-fixed text-on-secondary-fixed";
      case "Content Creation":
        return "bg-tertiary-fixed text-on-tertiary-fixed";
      default:
        return "bg-secondary-container text-on-secondary-fixed";
    }
  };

  return (
    <article className="flex flex-col bg-white rounded-2xl shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden border border-slate-200/80 ring-1 ring-slate-900/5">
      {/* Clean 16:9 Thumbnail Header (No Floating Chips) */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={course.thumbnail}
          alt={course.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Card Content Area */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {enrolled ? (
            /* Enrolled Status Header */
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-semibold text-emerald-700">
                Enrolled ({percentage}% Complete)
              </span>
              <span className="text-slate-400 font-medium">
                {completedCount}/{totalCount} Lessons
              </span>
            </div>
          ) : (
            /* Category & Meta Header (Clean Text, No Chips) */
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-semibold text-emerald-700 uppercase tracking-wider">
                {course.category}
              </span>
              {course.isUpcoming ? (
                <span className="font-semibold text-amber-700">
                  Upcoming Soon
                </span>
              ) : (
                <span className="text-slate-400 font-medium">
                  {course.duration} • {course.lessonCount} Lessons
                </span>
              )}
            </div>
          )}

          {/* Course Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
            {course.title}
          </h3>

          {/* Course Meta Info */}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-700 font-semibold">{course.level}</span>
            <span>•</span>
            <span>{course.durationWeeks} Weeks</span>
            <span>•</span>
            <span>Self-Paced</span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          {/* Capstone Callout (Clean Minimalist Box) */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
              folder_special
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900">
                {course.capstoneTitle}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {course.capstoneDesc}
              </span>
            </div>
          </div>

          {/* Progress Bar (Enrolled Only) */}
          {enrolled && (
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Overall Progress</span>
                <span className="font-semibold text-emerald-700">
                  {percentage}% ({completedCount}/{totalCount} lessons)
                </span>
              </div>
              <ProgressBar progress={percentage} />
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-4 flex items-center justify-between border-t border-slate-100">
          {enrolled ? (
            <>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${user.name} Avatar`}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-100"
                  src={user.avatar}
                />
                <span className="text-xs text-slate-500 font-medium">
                  {user.name}&apos;s Track
                </span>
              </div>
              <Link
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-all shadow-xs"
                href={`/courses/${course._id}/learn`}
              >
                <span>Continue Learning</span>
                <span className="material-symbols-outlined text-[15px]">
                  arrow_forward
                </span>
              </Link>
            </>
          ) : course.isUpcoming ? (
            <>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight">
                  ₹{course.price.toLocaleString()}
                </span>
                <span className="text-xs text-amber-700 font-semibold">
                  Upcoming Soon
                </span>
              </div>
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold border border-slate-200/60 cursor-not-allowed"
              >
                <span>Coming Soon</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">
                    ₹{course.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{course.originalPrice.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-emerald-700 font-semibold">
                  {course.discountPercent}% student discount
                </span>
              </div>
              <Link
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm hover:shadow-md transition-all group/btn"
                href={user.isLoggedIn ? `/checkout/${course._id}` : `/login?redirect=/checkout/${course._id}`}
              >
                <span>View & Enroll</span>
                <span className="material-symbols-outlined text-[15px] group-hover/btn:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
