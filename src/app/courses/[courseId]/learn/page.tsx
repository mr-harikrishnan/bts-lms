"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { CourseCurriculum } from "@/components/learning/CourseCurriculum";
import { Lesson } from "@/types";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CourseLearningPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();

  const {
    courses,
    isEnrolled,
    enrollCourse,
    getEnrolledCourse,
    markLessonComplete,
    setCurrentLesson,
    getCourseProgress,
    user,
  } = useBstorm();

  const course = courses.find((c) => c.id === courseId);
  const enrolled = course ? isEnrolled(course.id) : false;
  const enrollment = course ? getEnrolledCourse(course.id) : undefined;

  // Auto-enroll if opened directly so preview never breaks
  React.useEffect(() => {
    if (course && user.isLoggedIn && !enrolled) {
      enrollCourse(course.id);
    }
  }, [user.isLoggedIn, enrolled, course, enrollCourse]);

  // Check course existence
  if (!course) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline">
              search_off
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Course Not Found
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              The course you are trying to access could not be found.
            </p>
            <Link
              href="/courses"
              className="mt-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
            >
              Browse Course Catalog
            </Link>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  // Flatten all lessons
  const allLessons: { moduleNumber: string; moduleTitle: string; lesson: Lesson }[] = [];
  course.modules.forEach((m) => {
    m.lessons.forEach((l) => {
      allLessons.push({
        moduleNumber: m.moduleNumber,
        moduleTitle: m.title,
        lesson: l,
      });
    });
  });

  const currentLessonId = enrollment?.currentLessonId || allLessons[3]?.lesson.id || allLessons[0]?.lesson.id;
  const completedLessonIds = enrollment?.completedLessonIds || [];

  const currentLessonIndex = allLessons.findIndex(
    (item) => item.lesson.id === currentLessonId
  );
  const activeItem =
    currentLessonIndex !== -1 ? allLessons[currentLessonIndex] : allLessons[0];

  const currentLesson = activeItem.lesson;
  const currentModuleNumber = activeItem.moduleNumber;

  const { completedCount, totalCount, percentage } = getCourseProgress(course.id);
  const isAllCompleted = completedCount >= totalCount && totalCount > 0;
  const isLastLesson = currentLessonIndex === allLessons.length - 1;

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Handlers
  const handleSelectLesson = (lessonId: string) => {
    setCurrentLesson(course.id, lessonId);
    setMobileDrawerOpen(false);
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = allLessons[currentLessonIndex - 1].lesson;
      setCurrentLesson(course.id, prevLesson.id);
    }
  };

  const handleNextLesson = () => {
    if (!isLastLesson) {
      const nextLesson = allLessons[currentLessonIndex + 1].lesson;
      setCurrentLesson(course.id, nextLesson.id);
    } else {
      router.push(`/test/${course.id}`);
    }
  };

  const handleMarkCompleteAndNext = () => {
    markLessonComplete(course.id, currentLesson.id);
    if (!isLastLesson) {
      const nextLesson = allLessons[currentLessonIndex + 1].lesson;
      setCurrentLesson(course.id, nextLesson.id);
    } else {
      router.push(`/test/${course.id}`);
    }
  };

  const isCurrentCompleted = completedLessonIds.includes(currentLesson.id);

  // Custom TopBar Breadcrumb
  const customBreadcrumb = (
    <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
      <Link
        href="/courses"
        className="hover:text-primary transition-colors flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span className="hidden sm:inline">Courses</span>
      </Link>
      <span className="material-symbols-outlined text-[16px] text-outline">
        chevron_right
      </span>
      <span className="text-primary font-semibold truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
        {course.title}
      </span>
      <span className="hidden md:inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold tracking-wide uppercase">
        In Player
      </span>
    </div>
  );

  return (
    <AuthGuard>
      <AppShell customBreadcrumb={customBreadcrumb} maxWidth="max-w-[1440px]">
        <div className="flex flex-col w-full gap-5">
        {/* Sleek Course Learning Top Navigation Bar */}
        <div className="bg-surface-container-lowest border border-[#E5E7EB] rounded-xl px-5 py-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              <span>All Courses</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[15px] text-secondary">
                layers
              </span>
              {course.category} • Career Track
            </span>

            <h2 className="font-headline-sm text-headline-sm text-primary font-bold text-base md:text-lg truncate max-w-xl">
              {course.title}
            </h2>
          </div>

          <div className="flex items-center gap-4 justify-between md:justify-end shrink-0">
            <div className="flex flex-col gap-1 items-end min-w-[200px]">
              <div className="flex items-center justify-between w-full font-label-sm text-label-sm">
                <span className="text-on-surface-variant font-medium">Progress</span>
                <span className="text-secondary font-bold">
                  {completedCount} of {totalCount} lessons ({percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm transition-colors lg:hidden"
              id="toggleCurriculumDrawerBtn"
            >
              <span className="material-symbols-outlined text-[18px]">
                view_sidebar
              </span>
              <span>Outline</span>
            </button>
          </div>
        </div>

        {/* Two-Column Learning Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Stage (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Video Player Component */}
            <VideoPlayer
              lesson={currentLesson}
              course={course}
              moduleNumber={currentModuleNumber}
            />

            {/* Lesson Header & Details Section */}
            <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-[#E5E7EB]">
              {/* Top row pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[15px] text-secondary">
                      play_circle
                    </span>
                    {currentModuleNumber} • Lesson {currentLesson.lessonNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[15px] text-secondary">
                      schedule
                    </span>
                    {currentLesson.duration} Duration
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[15px] text-secondary">
                      terminal
                    </span>
                    Interactive Coding Sandbox Ready
                  </span>
                </div>

                <span
                  className={`inline-flex items-center px-3 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                    isCurrentCompleted
                      ? "bg-secondary-container text-on-secondary-fixed"
                      : "bg-secondary/10 text-secondary"
                  }`}
                >
                  <span>
                    Status: {isCurrentCompleted ? "Completed ✓" : "In Progress"}
                  </span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                {currentLesson.title}
              </h1>

              {/* Educational Content & Overview */}
              <div className="text-on-surface-variant font-body-md text-body-md space-y-3 leading-relaxed border-b border-surface-container pb-5 mb-5">
                {currentLesson.overview.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>

              {/* Key Lesson Takeaways */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    sticky_note_2
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold text-base">
                    Key Lesson Takeaways
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentLesson.takeaways.map((takeaway, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex items-start gap-2.5"
                    >
                      <span
                        className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold text-primary">
                          {takeaway.title}
                        </span>
                        <span className="text-on-surface-variant text-xs mt-0.5">
                          {takeaway.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lesson Action Bar & Navigation */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                <button
                  onClick={handlePrevLesson}
                  disabled={currentLessonIndex === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                  </span>
                  <span>Previous Lesson</span>
                </button>
                <span className="font-caption text-caption text-on-surface-variant hidden sm:inline-block">
                  Lesson {currentLessonIndex + 1} of {allLessons.length}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={handleMarkCompleteAndNext}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm transition-all"
                >
                  <span>
                    {isLastLesson
                      ? isCurrentCompleted
                        ? "Completed ✓ (Go to Final Test)"
                        : "Complete & Take Final Test"
                      : isCurrentCompleted
                      ? "Completed ✓ (Next)"
                      : "Mark as Complete & Next"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    {isLastLesson ? "workspace_premium" : "done_all"}
                  </span>
                </button>

                {isLastLesson ? (
                  <Link
                    href={`/test/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
                  >
                    <span>Final Test</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </Link>
                ) : (
                  <button
                    onClick={handleNextLesson}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md transition-colors shadow-sm"
                  >
                    <span>Next Lesson</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Next Milestone Preview Pill */}
            {currentLessonIndex < allLessons.length - 1 ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-surface-container text-sm">
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    upcoming
                  </span>
                  <span>
                    Next Milestone:{" "}
                    <strong className="text-primary font-semibold">
                      {allLessons[currentLessonIndex + 1].moduleNumber}:{" "}
                      {allLessons[currentLessonIndex + 1].lesson.title}
                    </strong>
                  </span>
                </div>
                <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono">
                  Unlocks Next
                </span>
              </div>
            ) : null}

            {/* Final Test Trigger / Milestone Transition Callout */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#182021] to-[#2D3536] text-white p-5 shadow-sm">
              <div className="absolute right-0 top-0 w-64 h-full bg-secondary/10 blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 text-secondary-fixed shrink-0">
                    <span className="material-symbols-outlined text-[24px]">
                      workspace_premium
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm font-bold text-base text-white">
                        {isAllCompleted
                          ? "Course Lessons Completed!"
                          : "Final Skills Assessment"}
                      </span>
                      <span className="px-2 py-0.2 rounded bg-secondary-container text-on-secondary-container text-[11px] font-semibold border border-secondary/30">
                        Final Test
                      </span>
                    </div>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 max-w-xl leading-relaxed">
                      {isAllCompleted
                        ? "You have completed all lessons! Take the final test and score 70% or higher to get your official certificate."
                        : "Complete all course lessons to unlock your final test. Score 70% or higher to earn your verified certificate."}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/test/${course.id}`}
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md font-semibold transition-all shadow-md"
                >
                  <span>Start Final Test</span>
                  <span className="material-symbols-outlined text-[18px]">
                    verified
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel: Course Curriculum Drawer (col-span-4, sticky) */}
          <div
            className={`lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20 ${
              mobileDrawerOpen
                ? "fixed inset-x-4 top-24 bottom-6 z-50 overflow-y-auto bg-surface p-4 rounded-2xl shadow-2xl border border-secondary"
                : "hidden lg:flex"
            }`}
          >
            {mobileDrawerOpen && (
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] lg:hidden">
                <span className="font-label-md text-label-md font-bold text-primary">
                  Course Outline
                </span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-primary hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              </div>
            )}

            <CourseCurriculum
              course={course}
              currentLessonId={currentLesson.id}
              completedLessonIds={completedLessonIds}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        </div>
      </div>
    </AppShell>
    </AuthGuard>
  );
}
