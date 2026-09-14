import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import {
  StatsCardSkeleton,
  ActiveCourseSkeleton,
} from "@/components/dashboard/DashboardSkeletons";
import {
  RotateCw,
  BookOpen,
  Award,
  CheckCircle2,
  Trophy,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const {
    user,
    courses,
    enrolledCourses,
    getCourseProgress,
    certificates,
    isLoading,
    refreshEnrolled,
    refreshCourses,
  } = useBstorm();

  // Module-specific refreshing state
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [isRefreshingCourse, setIsRefreshingCourse] = useState(false);

  const handleRefreshStats = async () => {
    setIsRefreshingStats(true);
    try {
      await refreshEnrolled();
    } finally {
      setTimeout(() => setIsRefreshingStats(false), 300);
    }
  };

  const handleRefreshCourse = async () => {
    setIsRefreshingCourse(true);
    try {
      await Promise.all([refreshCourses(), refreshEnrolled()]);
    } finally {
      setTimeout(() => setIsRefreshingCourse(false), 300);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="flex flex-col gap-8">
            <div className="h-16 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
            <ActiveCourseSkeleton />
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  // Primary active course for Continue Learning hero
  const activeEnrollment = enrolledCourses[0];
  const activeCourse = activeEnrollment
    ? courses.find((c) => c._id === activeEnrollment.courseId)
    : courses[0];

  const activeProgress = activeCourse
    ? getCourseProgress(activeCourse._id)
    : { completedCount: 0, totalCount: 12, percentage: 0 };

  const hasEnrolled = enrolledCourses.length > 0;

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex flex-col gap-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user.name || "Student"}!
              </h1>
              <VerificationBadge size="md" color="blue" tooltip="Verified Learner" />
            </div>
          </div>

          {/* Module 1: Learning Metric Overview */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Academic Progress & Standing
              </h2>
              <button
                type="button"
                onClick={handleRefreshStats}
                disabled={isRefreshingStats}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh Metrics"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${isRefreshingStats ? "animate-spin text-emerald-600" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>

            {isRefreshingStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-medium">Enrolled Tracks</span>
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {enrolledCourses.length}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Active Curriculum
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-medium">Lessons Completed</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {enrolledCourses.reduce(
                      (acc, e) => acc + (e.completedLessonIds ? e.completedLessonIds.length : 0),
                      0
                    )}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Across enrolled tracks
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-medium">Credentials Earned</span>
                    <Award className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {certificates.length}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Verified Certificates
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-xs font-medium">Student Standing</span>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    Top 8%
                  </span>
                  <span className="text-[11px] text-amber-600 font-semibold">
                    High Achiever
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Module 2: Continue Learning / Current Enrolled Track */}
          {hasEnrolled && activeCourse && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Current Learning Curriculum
                </h2>
                <button
                  type="button"
                  onClick={handleRefreshCourse}
                  disabled={isRefreshingCourse}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh Active Course"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${isRefreshingCourse ? "animate-spin text-emerald-600" : ""}`}
                  />
                  <span>Refresh</span>
                </button>
              </div>

              {isRefreshingCourse ? (
                <ActiveCourseSkeleton />
              ) : (
                <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start w-full lg:w-auto flex-1">
                    <div className="w-full sm:w-56 aspect-video rounded-xl overflow-hidden shrink-0 relative bg-stone-100 shadow-xs">
                      <img
                        src={activeCourse.thumbnail}
                        alt={activeCourse.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-white text-xs font-mono">
                        {activeCourse.duration}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold">
                          Continue Learning
                        </span>
                        <span className="text-xs text-stone-500">
                          {activeCourse.category}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 leading-snug">
                        {activeCourse.title}
                      </h2>

                      <p className="text-xs text-stone-500 line-clamp-2 max-w-xl">
                        {activeCourse.description}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-2 flex flex-col gap-1.5 max-w-md">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-stone-500">Course Progress</span>
                          <span className="font-bold text-emerald-700">
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
                      to={`/courses/${activeCourse._id}/learn`}
                      className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2 text-center group"
                    >
                      <span>Resume Workspace</span>
                      <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                    </Link>
                    <Link
                      to="/my-courses"
                      className="px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200/70 text-slate-800 text-sm font-semibold transition-all border border-stone-200 flex items-center justify-center gap-2 text-center"
                    >
                      <span>View All Enrolled</span>
                    </Link>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Module 3: Course Purchase Banner (Displayed ONLY if user has 0 enrolled courses) */}
          {!hasEnrolled && (
            <section className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-7 md:p-10 shadow-xl border border-slate-700/50 relative overflow-hidden">
              {/* Subtle ambient lighting */}
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider w-fit">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Begin Your Learning Journey</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                    Ready to master practical digital skills?
                  </h2>

                  <p className="text-sm text-stone-300 leading-relaxed">
                    You have not enrolled in any learning tracks yet. Explore our career-focused courses, complete hands-on capstones, and earn industry-recognized verified certificates.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                  <Link
                    to="/courses"
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-slate-950 font-semibold text-sm shadow-md transition-all group"
                  >
                    <span>Browse Course Catalog</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
};
