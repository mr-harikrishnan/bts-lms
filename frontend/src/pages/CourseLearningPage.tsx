import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { CourseCurriculum } from "@/components/learning/CourseCurriculum";
import { VideoAutoAdvance } from "@/components/learning/VideoAutoAdvance";
import { ModuleQuizSection } from "@/components/learning/ModuleQuizSection";
import { Lesson, Course, PublicCourseTest } from "@/types";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { courseService } from "@/services/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlatLesson {
  moduleNumber: string;
  moduleTitle: string;
  moduleId: string;
  isLastInModule: boolean;
  lesson: Lesson;
}

interface AutoAdvanceState {
  active: boolean;
  nextLessonId: string;
  nextLessonTitle: string;
  nextLabel: string;
}

// What is currently shown in the main stage
type MainView =
  | { type: "video" }
  | {
      type: "module-quiz";
      moduleId: string;
      moduleTitle: string;
      moduleNumber: string;
      nextLessonId?: string;
      nextModuleTitle?: string;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Given the flattened lessons list, compute which lessonIds are unlocked.
 * Sequential rule: lesson[i] in module M is unlocked if:
 *   - module M itself is unlocked AND
 *   - all previous lessons in M are completed
 *
 * Module M (index > 0) is unlocked when the previous module (M-1) is fully done:
 *   all its videos completed + its required test passed (if it has one).
 */
function computeUnlockedLessonIds(
  modules: Course["modules"],
  completedLessonIds: string[],
  completedModuleTestIds: string[],
  moduleTestMap: Record<string, PublicCourseTest | null>
): Set<string> {
  const unlocked = new Set<string>();

  for (let mi = 0; mi < modules.length; mi++) {
    const mod = modules[mi];
    const lessons = mod.lessons || [];

    // Determine if this module itself is accessible
    const isModuleUnlocked = mi === 0 || isModuleFullyDone(
      modules[mi - 1],
      completedLessonIds,
      completedModuleTestIds,
      moduleTestMap
    );

    if (!isModuleUnlocked) break; // All subsequent modules also locked

    // Unlock lessons sequentially within this module
    for (let li = 0; li < lessons.length; li++) {
      const lesson = lessons[li];
      if (li === 0) {
        unlocked.add(lesson._id);
      } else {
        // Only unlock if previous lesson is completed
        if (completedLessonIds.includes(lessons[li - 1]._id)) {
          unlocked.add(lesson._id);
        } else {
          break; // Stop — can't skip ahead
        }
      }
    }
  }

  return unlocked;
}

/**
 * Check if a module is fully done:
 *   - all lessons completed
 *   - AND required test passed (if module has a required test)
 */
function isModuleFullyDone(
  mod: Course["modules"][0],
  completedLessonIds: string[],
  completedModuleTestIds: string[],
  moduleTestMap: Record<string, PublicCourseTest | null>
): boolean {
  const lessons = mod.lessons || [];
  if (lessons.length === 0) return true;

  const allVideosComplete = lessons.every((l) =>
    completedLessonIds.includes(l._id)
  );
  if (!allVideosComplete) return false;

  const test = moduleTestMap[mod._id] ?? null;
  if (!test) return true; // No test → videos alone complete the module
  if (test.isOptional) return true; // Optional test doesn't block
  return completedModuleTestIds.includes(mod._id); // Required test must be passed
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const {
    courses,
    isEnrolled,
    enrollCourse,
    getEnrolledCourse,
    markLessonComplete,
    setCurrentLesson,
    getCourseProgress,
    user,
    isLoading: isContextLoading,
  } = useBstorm();

  // ── All state hooks at the top ────────────────────────────────────────────
  const [apiCourse, setApiCourse] = useState<Course | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [moduleTestMap, setModuleTestMap] = useState<
    Record<string, PublicCourseTest | null>
  >({});
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState<AutoAdvanceState>({
    active: false,
    nextLessonId: "",
    nextLessonTitle: "",
    nextLabel: "Up Next",
  });
  const [completedModuleTestIds, setCompletedModuleTestIds] = useState<
    string[]
  >([]);
  const [mainView, setMainView] = useState<MainView>({ type: "video" });

  // ── Fetch course ─────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function fetchCourse() {
      if (!courseId) return;
      setIsLoadingApi(true);
      try {
        const data = await courseService.getById(courseId);
        if (mounted) setApiCourse(data);
      } catch (err) {
        console.error("Course fetch error:", err);
      } finally {
        if (mounted) setIsLoadingApi(false);
      }
    }
    fetchCourse();
    return () => { mounted = false; };
  }, [courseId]);

  // ── Fetch module tests (to know which modules have assessments) ───────────
  const fetchModuleTests = useCallback(
    async (course: Course) => {
      if (!course.modules?.length) return;
      setIsLoadingTests(true);
      const results: Record<string, PublicCourseTest | null> = {};
      await Promise.all(
        course.modules.map(async (mod) => {
          try {
            const test = await courseService.getModuleTest(
              course._id,
              mod._id
            );
            results[mod._id] = test ?? null;
          } catch {
            // 404 = no test for this module
            results[mod._id] = null;
          }
        })
      );
      setModuleTestMap(results);
      setIsLoadingTests(false);
    },
    []
  );

  const contextCourse = courses.find((c) => c._id === courseId);
  const course =
    apiCourse?.modules && apiCourse.modules.length > 0
      ? apiCourse
      : contextCourse?.modules && contextCourse.modules.length > 0
      ? contextCourse
      : apiCourse || contextCourse;

  useEffect(() => {
    if (course) fetchModuleTests(course);
  }, [course?._id]);

  const enrolled = course
    ? user.role === "admin" || isEnrolled(course._id)
    : false;
  const enrollment = course ? getEnrolledCourse(course._id) : undefined;

  // Auto-enroll free courses
  useEffect(() => {
    if (course && user.isLoggedIn && !enrolled && course.price === 0) {
      enrollCourse(course._id);
    }
  }, [user.isLoggedIn, enrolled, course, enrollCourse]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isContextLoading || isLoadingApi) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="aspect-video bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
              <div className="h-32 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
            </div>
            <div className="lg:col-span-4 h-[600px] bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

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
            <Link
              to="/courses"
              className="mt-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
            >
              Browse Courses
            </Link>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  if (course.price > 0 && !enrolled) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-amber-500">
              lock
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Enrollment Required
            </h3>
            <Link
              to={`/checkout/${course._id}`}
              className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold"
            >
              Enroll Now (₹{course.price})
            </Link>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────

  const allLessons: FlatLesson[] = [];
  (course.modules || []).forEach((m) => {
    const lessonList = m.lessons || [];
    lessonList.forEach((l, idx) => {
      allLessons.push({
        moduleNumber: m.moduleNumber,
        moduleTitle: m.title,
        moduleId: m._id,
        isLastInModule: idx === lessonList.length - 1,
        lesson: l,
      });
    });
  });

  const completedLessonIds = enrollment?.completedLessonIds || [];

  // Compute which lesson IDs are unlocked (sequential)
  const unlockedLessonIds = computeUnlockedLessonIds(
    course.modules || [],
    completedLessonIds,
    completedModuleTestIds,
    moduleTestMap
  );

  // Current lesson: prefer user-selected, then enrollment cursor, then first unlocked
  const defaultLessonId =
    allLessons.find((item) => unlockedLessonIds.has(item.lesson._id))
      ?.lesson._id || allLessons[0]?.lesson._id;
  const currentLessonId =
    selectedLessonId || enrollment?.currentLessonId || defaultLessonId;

  const currentLessonIndex = allLessons.findIndex(
    (item) => item.lesson._id === currentLessonId
  );
  const activeItem =
    currentLessonIndex !== -1 ? allLessons[currentLessonIndex] : allLessons[0];
  const currentLesson = activeItem?.lesson;
  const currentModuleNumber = activeItem?.moduleNumber || "";
  const isLastLesson = currentLessonIndex === allLessons.length - 1;
  const isCurrentCompleted = currentLesson
    ? completedLessonIds.includes(currentLesson._id)
    : false;

  const { completedCount, totalCount, percentage } = getCourseProgress(
    course._id
  );

  // All modules fully done → final test unlocked
  const allModulesFullyDone =
    (course.modules || []).length > 0 &&
    (course.modules || []).every((m) =>
      isModuleFullyDone(m, completedLessonIds, completedModuleTestIds, moduleTestMap)
    );

  const activeTestModuleId =
    mainView.type === "module-quiz" ? mainView.moduleId : null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const goToLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    if (course) setCurrentLesson(course._id, lessonId);
  };

  const switchToVideoView = () => setMainView({ type: "video" });

  /**
   * Attempt to navigate to a lesson.
   * Only allowed if the lesson is in the unlocked set.
   */
  const handleSelectLesson = (lessonId: string) => {
    if (!unlockedLessonIds.has(lessonId)) return; // locked — silently ignore
    setAutoAdvance((p) => ({ ...p, active: false }));
    setMainView({ type: "video" });
    goToLesson(lessonId);
    setMobileDrawerOpen(false);
  };

  const handleStartModuleTest = (moduleId: string) => {
    const mod = (course.modules || []).find((m) => m._id === moduleId);
    if (!mod) return;
    const modIndex = (course.modules || []).findIndex((m) => m._id === moduleId);
    const nextMod = (course.modules || [])[modIndex + 1];
    const nextModFirstLesson = nextMod?.lessons?.[0];
    setMainView({
      type: "module-quiz",
      moduleId,
      moduleTitle: mod.title,
      moduleNumber: mod.moduleNumber,
      nextModuleTitle: nextMod?.title,
      nextLessonId: nextModFirstLesson?._id,
    });
    setAutoAdvance((p) => ({ ...p, active: false }));
  };

  const handleStartFinalTest = () => {
    navigate(`/test/${course._id}`);
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      const prevId = allLessons[currentLessonIndex - 1].lesson._id;
      if (unlockedLessonIds.has(prevId)) {
        setAutoAdvance((p) => ({ ...p, active: false }));
        setMainView({ type: "video" });
        goToLesson(prevId);
      }
    }
  };

  /**
   * Mark current lesson complete, then advance:
   * - Same module next video → 5s auto-advance
   * - Last video in module → show module quiz (if test exists)
   * - Last video overall → navigate to final test
   */
  const advanceLesson = (shouldMarkComplete: boolean) => {
    if (!course || !currentLesson) return;
    if (shouldMarkComplete && !isCurrentCompleted) {
      markLessonComplete(course._id, currentLesson._id);
    }

    if (isLastLesson) {
      navigate(`/test/${course._id}`);
      return;
    }

    const nextItem = allLessons[currentLessonIndex + 1];
    if (!nextItem) return;

    const isModuleTransition = nextItem.moduleId !== activeItem?.moduleId;

    if (isModuleTransition && activeItem) {
      // Last video of this module — check if there's a test
      const hasTest = !!moduleTestMap[activeItem.moduleId];
      if (hasTest) {
        const mod = (course.modules || []).find(
          (m) => m._id === activeItem.moduleId
        );
        setMainView({
          type: "module-quiz",
          moduleId: activeItem.moduleId,
          moduleTitle: activeItem.moduleTitle,
          moduleNumber: activeItem.moduleNumber,
          nextModuleTitle: nextItem.moduleTitle,
          nextLessonId: nextItem.lesson._id,
        });
        setAutoAdvance((p) => ({ ...p, active: false }));
      } else {
        // No test → directly start auto-advance to next module
        setMainView({ type: "video" });
        setAutoAdvance({
          active: true,
          nextLessonId: nextItem.lesson._id,
          nextLessonTitle: nextItem.lesson.title,
          nextLabel: `Next: ${nextItem.moduleTitle}`,
        });
      }
    } else {
      // Same module → next video
      setMainView({ type: "video" });
      setAutoAdvance({
        active: true,
        nextLessonId: nextItem.lesson._id,
        nextLessonTitle: nextItem.lesson.title,
        nextLabel: "Up Next",
      });
    }
  };

  const handleVideoEnded = () => advanceLesson(true);
  const handleNextLesson = () => advanceLesson(false);
  const handleMarkCompleteAndNext = () => advanceLesson(true);

  const handleAutoAdvanceProceed = () => {
    setAutoAdvance((p) => ({ ...p, active: false }));
    if (autoAdvance.nextLessonId) goToLesson(autoAdvance.nextLessonId);
  };

  const handleAutoAdvanceStop = () => {
    setAutoAdvance((p) => ({ ...p, active: false }));
  };

  const handleModuleTestPassed = (moduleId: string, nextLessonId?: string) => {
    setCompletedModuleTestIds((prev) =>
      prev.includes(moduleId) ? prev : [...prev, moduleId]
    );
    // Wait for confetti/celebration, then navigate
    setTimeout(() => {
      setMainView({ type: "video" });
      if (nextLessonId) goToLesson(nextLessonId);
    }, 4500);
  };

  const handleSkipModuleTest = (nextLessonId?: string) => {
    if (nextLessonId) {
      setMainView({ type: "video" });
      goToLesson(nextLessonId);
    } else {
      switchToVideoView();
    }
  };

  // ── Breadcrumb ───────────────────────────────────────────────────────────

  const customBreadcrumb = (
    <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
      <Link
        to="/courses"
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
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AuthGuard>
      <AppShell customBreadcrumb={customBreadcrumb} maxWidth="max-w-[1440px]">
        <div className="flex flex-col w-full gap-5">

          {/* ── Top Nav Bar ─────────────────────────────────────────── */}
          <div className="bg-surface-container-lowest border border-[#E5E7EB] rounded-xl px-5 py-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>All Courses</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[15px] text-secondary">layers</span>
                {course.category}
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
                    {completedCount}/{totalCount} videos ({percentage}%)
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
              >
                <span className="material-symbols-outlined text-[18px]">view_sidebar</span>
                <span>Outline</span>
              </button>
            </div>
          </div>

          {/* ── Two-Column Layout ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ── Left: Main Stage ──────────────────────────────────── */}
            <div className="lg:col-span-8 flex flex-col gap-5">

              {/* MODULE QUIZ VIEW */}
              {mainView.type === "module-quiz" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <button
                      onClick={switchToVideoView}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Back to Video
                    </button>
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-amber-600 text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        quiz
                      </span>
                      <div>
                        <p className="font-bold text-amber-900 text-sm">
                          {mainView.moduleNumber}: {mainView.moduleTitle}
                        </p>
                        <p className="text-xs text-amber-700">
                          Module Assessment
                        </p>
                      </div>
                    </div>
                  </div>

                  <ModuleQuizSection
                    courseId={course._id}
                    moduleId={mainView.moduleId}
                    moduleTitle={mainView.moduleTitle}
                    moduleNumber={mainView.moduleNumber}
                    nextModuleTitle={mainView.nextModuleTitle}
                    onAdvanceToNextModule={() => {
                      handleSkipModuleTest(mainView.nextLessonId);
                    }}
                    onQuizPassed={() =>
                      handleModuleTestPassed(mainView.moduleId, mainView.nextLessonId)
                    }
                    onSkip={() => handleSkipModuleTest(mainView.nextLessonId)}
                  />
                </div>
              )}

              {/* VIDEO VIEW */}
              {mainView.type === "video" && currentLesson && (
                <>
                  <VideoPlayer
                    lesson={currentLesson}
                    course={course}
                    moduleNumber={currentModuleNumber}
                    onVideoEnded={handleVideoEnded}
                    overlaySlot={
                      autoAdvance.active ? (
                        <VideoAutoAdvance
                          nextTitle={autoAdvance.nextLessonTitle}
                          nextLabel={autoAdvance.nextLabel}
                          countdownSeconds={5}
                          onProceed={handleAutoAdvanceProceed}
                          onStop={handleAutoAdvanceStop}
                        />
                      ) : undefined
                    }
                  />

                  {/* Lesson Info */}
                  <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border border-[#E5E7EB]">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[15px] text-secondary">play_circle</span>
                          {currentModuleNumber} · Lesson {currentLesson.lessonNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[15px] text-secondary">schedule</span>
                          {currentLesson.duration}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md font-label-sm text-label-sm font-bold ${
                        isCurrentCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-secondary/10 text-secondary"
                      }`}>
                        {isCurrentCompleted ? (
                          <><span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Completed</>
                        ) : "In Progress"}
                      </span>
                    </div>

                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                      {currentLesson.title}
                    </h1>

                    <div className="text-on-surface-variant font-body-md text-body-md space-y-3 leading-relaxed border-b border-surface-container pb-5 mb-5">
                      {currentLesson.overview?.map((p, i) => <p key={i}>{p}</p>)}
                    </div>

                    {currentLesson.takeaways?.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]">sticky_note_2</span>
                          <h3 className="font-headline-sm text-headline-sm text-primary font-bold text-base">Key Takeaways</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentLesson.takeaways?.map((t, i) => (
                            <div key={i} className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex items-start gap-2.5">
                              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                              </span>
                              <div className="flex flex-col text-sm">
                                <span className="font-semibold text-primary">{t.title}</span>
                                <span className="text-on-surface-variant text-xs mt-0.5">{t.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                      <button
                        onClick={handlePrevLesson}
                        disabled={currentLessonIndex === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Previous
                      </button>
                      <span className="font-caption text-caption text-on-surface-variant hidden sm:inline-block">
                        Lesson {currentLessonIndex + 1} of {allLessons.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      {!isCurrentCompleted ? (
                        <button
                          onClick={handleMarkCompleteAndNext}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm transition-all"
                        >
                          <span>Mark Complete & Continue</span>
                          <span className="material-symbols-outlined text-[18px]">done_all</span>
                        </button>
                      ) : (
                        !isLastLesson && (
                          <button
                            onClick={handleNextLesson}
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm transition-all"
                          >
                            <span>Next Lesson</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </button>
                        )
                      )}

                      {isLastLesson && isCurrentCompleted && (
                        <button
                          onClick={handleStartFinalTest}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm transition-all"
                        >
                          <span>Go to Final Test</span>
                          <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Next up preview */}
                  {currentLessonIndex < allLessons.length - 1 && (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-surface-container text-sm">
                      <div className="flex items-center gap-2.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[20px]">upcoming</span>
                        <span>
                          Next:{" "}
                          <strong className="text-primary font-semibold">
                            {allLessons[currentLessonIndex + 1].moduleNumber}:{" "}
                            {allLessons[currentLessonIndex + 1].lesson.title}
                          </strong>
                        </span>
                      </div>
                      {allLessons[currentLessonIndex + 1].moduleId !==
                        activeItem?.moduleId && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          New Module
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Empty state */}
              {mainView.type === "video" && !currentLesson && (
                <div className="aspect-video rounded-2xl bg-surface-container-lowest border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-[48px] text-outline">play_circle</span>
                  <p className="text-on-surface-variant font-semibold">Select a lesson to start learning</p>
                </div>
              )}
            </div>

            {/* ── Right: Curriculum Sidebar ─────────────────────────── */}
            <div
              className={`lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20 ${
                mobileDrawerOpen
                  ? "fixed inset-x-4 top-24 bottom-6 z-50 overflow-y-auto bg-surface p-4 rounded-2xl shadow-2xl border border-secondary"
                  : "hidden lg:flex"
              }`}
            >
              {mobileDrawerOpen && (
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] lg:hidden">
                  <span className="font-label-md text-label-md font-bold text-primary">Course Outline</span>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-primary hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              )}

              {!isLoadingTests ? (
                <CourseCurriculum
                  course={course}
                  currentLessonId={currentLesson?._id || ""}
                  completedLessonIds={completedLessonIds}
                  unlockedLessonIds={unlockedLessonIds}
                  completedModuleTestIds={completedModuleTestIds}
                  moduleTestMap={moduleTestMap}
                  allModulesFullyDone={allModulesFullyDone}
                  activeTestModuleId={activeTestModuleId}
                  onSelectLesson={handleSelectLesson}
                  onStartModuleTest={handleStartModuleTest}
                  onStartFinalTest={handleStartFinalTest}
                />
              ) : (
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="h-24 rounded-xl bg-surface-container-low border border-[#E5E7EB]" />
                  <div className="h-40 rounded-xl bg-surface-container-low border border-[#E5E7EB]" />
                  <div className="h-40 rounded-xl bg-surface-container-low border border-[#E5E7EB]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
};
