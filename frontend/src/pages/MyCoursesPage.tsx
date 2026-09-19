import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RotateCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CourseCardSkeleton } from "@/components/dashboard/DashboardSkeletons";

export const MyCoursesPage: React.FC = () => {
  const {
    enrolledCourses,
    courses,
    getCourseProgress,
    certificates,
    isLoading,
    refreshEnrolled,
  } = useBstorm();
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed">("in-progress");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshEnrolled();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-20 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
            <div className="h-12 w-64 bg-surface-container-lowest rounded-xl border border-[#E5E7EB]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
              <div className="h-64 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
            </div>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  // Map enrolled progress with course data
  const enrolledWithData = enrolledCourses
    .map((enr) => {
      const cid =
        enr.courseId && typeof enr.courseId === "object"
          ? ((enr.courseId as any)._id || (enr.courseId as any).id || "").toString()
          : (enr.courseId || "").toString();
      const course =
        courses.find((c) => c._id?.toString() === cid) ||
        (typeof enr.courseId === "object" ? (enr.courseId as any) : undefined) ||
        courses[0];
      const progress = getCourseProgress(cid);
      const cert = certificates.find((c) => c.courseId?.toString() === cid);
      const isCompleted = enr.isCompleted || progress.percentage === 100 || !!cert;

      return {
        enrollment: enr,
        course,
        progress,
        cert,
        isCompleted,
      };
    })
    .filter((item) => !!item.course);

  const inProgressList = enrolledWithData.filter((item) => !item.isCompleted);
  const completedList = enrolledWithData.filter((item) => item.isCompleted);

  const currentList = activeTab === "in-progress" ? inProgressList : completedList;

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
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

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Refresh Enrolled Courses"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </button>
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
          {isRefreshing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
          ) : currentList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentList.map(({ course, progress, cert, isCompleted }) => (
                <div
                  key={course._id}
                  className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-5 shadow-sm flex flex-col justify-between gap-4 group hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Clickable Thumbnail linking to Course Player */}
                    <Link
                      to={`/courses/${course._id}/learn`}
                      className="w-full sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 relative bg-surface-container shadow-xs block group/thumb"
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md transform group-hover/thumb:scale-110 transition-transform">
                          <span
                            className="material-symbols-outlined text-[24px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            play_arrow
                          </span>
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-primary/80 backdrop-blur-sm text-on-primary font-caption text-[10px] font-mono">
                        {course.duration}
                      </span>
                    </Link>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-fixed text-[11px] font-semibold">
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

                      {/* Clickable Course Title */}
                      <Link
                        to={`/courses/${course._id}/learn`}
                        className="font-headline-sm text-headline-sm text-primary font-bold text-base leading-snug truncate hover:text-emerald-700 transition-colors block"
                      >
                        {course.title}
                      </Link>

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
                          to={`/certificates/${cert._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary-container text-on-secondary-fixed font-label-md text-label-md font-semibold hover:opacity-90 transition-all shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            workspace_premium
                          </span>
                          <span>View Certificate</span>
                        </Link>
                      ) : progress.totalCount > 0 && progress.completedCount >= progress.totalCount ? (
                        <Link
                          to={`/test/${course._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary/90 transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            verified
                          </span>
                          <span>Take Final Test</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/courses/${course._id}/learn`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-label-md text-label-md font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                        >
                          <span>{progress.completedCount > 0 ? "Continue Course" : "Start Learning"}</span>
                          <span className="material-symbols-outlined text-[16px]">
                            {progress.completedCount > 0 ? "arrow_forward" : "play_circle"}
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
                to="/courses"
                className="mt-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
};
