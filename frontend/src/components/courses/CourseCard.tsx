"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
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

  const calculatedHours = course.hoursLive
    ? `${course.hoursLive} Hours`
    : course.duration || "Self-Paced";

  const targetUrl = enrolled
    ? `/courses/${course._id}/learn`
    : user.isLoggedIn
    ? `/checkout/${course._id}`
    : `/login?redirect=/checkout/${course._id}`;

  return (
    <article className="flex flex-col bg-white rounded-2xl shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden border border-slate-200/80 ring-1 ring-slate-900/5">
      {/* Thumbnail Banner with clickable Link */}
      <Link to={targetUrl} className="relative aspect-video overflow-hidden bg-slate-100 block group/thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={course.thumbnail}
          loading="lazy"
        />

        {/* Hover play overlay for enrolled courses */}
        {enrolled && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform group-hover/thumb:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>
        )}

        {/* Badges: Enrolled indicator on left, Category on right */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {enrolled && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md bg-emerald-600 text-white flex items-center gap-1 backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Enrolled
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-xs backdrop-blur-md ${getCategoryBadgeClass(
              course.category
            )}`}
          >
            {course.category}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Enrolled Progress Bar */}
          {enrolled ? (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Course Progress</span>
                <span className="font-bold text-emerald-700">{percentage}%</span>
              </div>
              <ProgressBar progress={percentage} />
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
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{calculatedHours}</span>
                  <span>•</span>
                  <span>{course.lessonCount || 0} Lessons</span>
                </span>
              )}
            </div>
          )}

          {/* Course Title - clickable link */}
          <Link to={targetUrl} className="block group/title">
            <h3 className="text-lg font-bold text-slate-900 group-hover/title:text-emerald-700 transition-colors leading-snug line-clamp-2">
              {course.title}
            </h3>
          </Link>

          {/* Course Meta Info */}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-700 font-semibold">{course.level}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {calculatedHours}
            </span>
            <span>•</span>
            <span>Self-Paced</span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Footer / CTA Actions */}
        <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
          {enrolled ? (
            <>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${user.name} Avatar`}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-200"
                  src={user.avatar}
                />
                <span className="text-xs text-slate-500 font-medium">
                  {user.name}&apos;s Track
                </span>
              </div>
              <Link
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all"
                to={`/courses/${course._id}/learn`}
              >
                <span>{percentage > 0 ? "Continue Learning" : "Start Learning"}</span>
                <span className="material-symbols-outlined text-[15px]">
                  {percentage > 0 ? "arrow_forward" : "play_circle"}
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
                to={user.isLoggedIn ? `/checkout/${course._id}` : `/login?redirect=/checkout/${course._id}`}
              >
                <span>Enroll Now</span>
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
