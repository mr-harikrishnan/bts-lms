"use client";

import React, { useState, useEffect } from "react";
import { Course, PublicCourseTest } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CourseCurriculumProps {
  course: Course;
  /** The lesson currently loaded in the video player */
  currentLessonId: string;
  /** Lesson IDs saved as completed in enrollment */
  completedLessonIds: string[];
  /** Lesson IDs the user is allowed to access (sequential unlock) */
  unlockedLessonIds: Set<string>;
  /** Module IDs whose test has been passed this session */
  completedModuleTestIds: string[];
  /** Map of moduleId → PublicCourseTest | null (null = no test configured) */
  moduleTestMap: Record<string, PublicCourseTest | null>;
  /** True when every module is fully done (videos + required tests) */
  allModulesFullyDone: boolean;
  /** If a module quiz is currently being taken, its moduleId */
  activeTestModuleId?: string | null;
  onSelectLesson: (lessonId: string) => void;
  onStartModuleTest: (moduleId: string) => void;
  onStartFinalTest: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
  course,
  currentLessonId,
  completedLessonIds,
  unlockedLessonIds,
  completedModuleTestIds,
  moduleTestMap,
  allModulesFullyDone,
  activeTestModuleId,
  onSelectLesson,
  onStartModuleTest,
  onStartFinalTest,
}) => {
  const modules = course.modules || [];

  // ── Accordion state ──────────────────────────────────────────────────────
  const initial: Record<string, boolean> = {};
  modules.forEach((mod, idx) => {
    const hasCurrent = (mod.lessons || []).some((l) => l._id === currentLessonId);
    initial[mod._id] = hasCurrent || idx === 0;
  });
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(initial);
  const [filterQuery, setFilterQuery] = useState("");

  // Auto-open when current lesson changes
  useEffect(() => {
    modules.forEach((mod) => {
      if ((mod.lessons || []).some((l) => l._id === currentLessonId)) {
        setOpenModules((p) => ({ ...p, [mod._id]: true }));
      }
    });
  }, [currentLessonId]);

  // Auto-open module with active test
  useEffect(() => {
    if (activeTestModuleId) {
      setOpenModules((p) => ({ ...p, [activeTestModuleId]: true }));
    }
  }, [activeTestModuleId]);

  const toggleModule = (id: string) =>
    setOpenModules((p) => ({ ...p, [id]: !p[id] }));

  const allOpen = modules.every((m) => openModules[m._id]);
  const handleExpandCollapseAll = () => {
    const next: Record<string, boolean> = {};
    modules.forEach((m) => { next[m._id] = !allOpen; });
    setOpenModules(next);
  };

  // ── Progress ─────────────────────────────────────────────────────────────
  const totalLessons = modules.reduce((a, m) => a + (m.lessons || []).length, 0);
  const completedCount = completedLessonIds.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // ── Module completion helpers ─────────────────────────────────────────────
  const isModuleVideosComplete = (mod: Course["modules"][0]) => {
    const lessons = mod.lessons || [];
    return lessons.length > 0 && lessons.every((l) => completedLessonIds.includes(l._id));
  };

  const moduleHasTest = (moduleId: string) => !!moduleTestMap[moduleId];
  const isTestPassed = (moduleId: string) =>
    completedModuleTestIds.includes(moduleId);
  const isTestOptional = (moduleId: string) =>
    moduleTestMap[moduleId]?.isOptional ?? false;

  /**
   * Module is fully done when all videos completed AND
   * (no test, OR test is optional, OR required test is passed)
   */
  const isModuleFullyDone = (mod: Course["modules"][0]) => {
    if (!isModuleVideosComplete(mod)) return false;
    if (!moduleHasTest(mod._id)) return true;
    if (isTestOptional(mod._id)) return true;
    return isTestPassed(mod._id);
  };

  /**
   * A module is accessible (unlocked) if:
   * - It's the first module, OR
   * - All previous modules are fully done
   */
  const isModuleUnlocked = (modIndex: number): boolean => {
    if (modIndex === 0) return true;
    return isModuleFullyDone(modules[modIndex - 1]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div>
            <h3 className="font-bold text-base text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">menu_book</span>
              Course Content
            </h3>
            <span className="text-xs font-semibold text-secondary">
              {progressPercent}% Complete · {completedCount}/{totalLessons} Videos
            </span>
          </div>
          <button
            onClick={handleExpandCollapseAll}
            className="text-xs font-semibold text-secondary hover:underline"
          >
            {allOpen ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search lessons..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:ring-1 focus:ring-secondary text-primary placeholder:text-on-surface-variant"
          />
        </div>
      </div>

      {/* ── Modules list ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 max-h-[calc(100vh-270px)] overflow-y-auto">
        {modules.map((module, modIdx) => {
          const lessons = module.lessons || [];
          const completedInModule = lessons.filter((l) =>
            completedLessonIds.includes(l._id)
          ).length;
          const modUnlocked = isModuleUnlocked(modIdx);
          const videosComplete = isModuleVideosComplete(module);
          const fullyDone = isModuleFullyDone(module);
          const hasTest = moduleHasTest(module._id);
          const testPassed = isTestPassed(module._id);
          const testOptional = isTestOptional(module._id);
          const isActive =
            lessons.some((l) => l._id === currentLessonId) ||
            activeTestModuleId === module._id;
          const isOpen = openModules[module._id] ?? false;

          const filteredLessons = filterQuery
            ? lessons.filter((l) =>
                l.title.toLowerCase().includes(filterQuery.toLowerCase())
              )
            : lessons;

          if (filterQuery && filteredLessons.length === 0) return null;

          return (
            <div
              key={module._id}
              className={`rounded-xl overflow-hidden border transition-all shadow-sm ${
                !modUnlocked
                  ? "border-[#E5E7EB] opacity-55"
                  : fullyDone
                  ? "border-emerald-200"
                  : isActive
                  ? "border-2 border-secondary shadow-md"
                  : "border-[#E5E7EB]"
              }`}
            >
              {/* ── Module Header ──────────────────────────────────── */}
              <button
                onClick={() => modUnlocked && toggleModule(module._id)}
                disabled={!modUnlocked}
                className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                  !modUnlocked
                    ? "bg-surface-container-low cursor-not-allowed"
                    : fullyDone
                    ? "bg-emerald-50/70 hover:bg-emerald-50"
                    : isActive
                    ? "bg-secondary-container/40"
                    : "bg-surface-container-low hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Status icon */}
                  {!modUnlocked ? (
                    <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                  ) : fullyDone ? (
                    <span
                      className="material-symbols-outlined text-emerald-600 text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : isActive ? (
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      radio_button_checked
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[20px]">
                      radio_button_unchecked
                    </span>
                  )}

                  <div className="flex flex-col">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      isActive ? "text-secondary" : "text-outline"
                    }`}>
                      {module.moduleNumber}
                    </span>
                    <span className={`text-sm font-semibold ${
                      !modUnlocked ? "text-on-surface-variant" : "text-primary"
                    }`}>
                      {module.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!modUnlocked ? (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[11px] font-medium">
                      Locked
                    </span>
                  ) : fullyDone ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      ✓ Done
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                      completedInModule === lessons.length
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {completedInModule}/{lessons.length}
                    </span>
                  )}
                  {modUnlocked && (
                    <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}>
                      expand_more
                    </span>
                  )}
                </div>
              </button>

              {/* ── Module Body (lessons + test) ───────────────────── */}
              {isOpen && modUnlocked && (
                <div className="flex flex-col border-t border-surface-container bg-surface-container-lowest">
                  {filteredLessons.map((lesson, lessonIdx) => {
                    const isPlaying = lesson._id === currentLessonId;
                    const isDone = completedLessonIds.includes(lesson._id);
                    const isUnlocked = unlockedLessonIds.has(lesson._id);

                    // ── Currently Playing ──────────────────────────
                    if (isPlaying) {
                      return (
                        <div
                          key={lesson._id}
                          className="flex items-center justify-between px-3 py-2.5 bg-secondary-container/50 border-b border-secondary/10"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="material-symbols-outlined text-secondary text-[16px] shrink-0"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              play_circle
                            </span>
                            <div className="flex flex-col">
                              <span className="text-primary font-bold text-xs">
                                {lesson.lessonNumber}: {lesson.title}
                              </span>
                              <span className="text-[10px] text-secondary font-medium">
                                ▶ Now Playing · {lesson.duration}
                              </span>
                            </div>
                          </div>
                          {/* Audio visualizer bars */}
                          <div className="flex items-end gap-[2px] h-3.5 shrink-0">
                            <span className="w-[3px] bg-secondary rounded-full animate-bounce" style={{ height: 8 }} />
                            <span className="w-[3px] bg-secondary rounded-full animate-bounce" style={{ height: 14, animationDelay: "0.1s" }} />
                            <span className="w-[3px] bg-secondary rounded-full animate-bounce" style={{ height: 10, animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      );
                    }

                    // ── Completed Lesson ───────────────────────────
                    if (isDone) {
                      return (
                        <button
                          key={lesson._id}
                          onClick={() => onSelectLesson(lesson._id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 border-b border-surface-container/60 hover:bg-emerald-50/40 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span
                              className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            <span className="text-xs text-on-surface-variant group-hover:text-primary truncate">
                              {lesson.lessonNumber}: {lesson.title}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 shrink-0 font-mono">
                            {lesson.duration} ✓
                          </span>
                        </button>
                      );
                    }

                    // ── Unlocked, Not Yet Completed ────────────────
                    if (isUnlocked) {
                      return (
                        <button
                          key={lesson._id}
                          onClick={() => onSelectLesson(lesson._id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 border-b border-surface-container/60 hover:bg-surface-container-low transition-colors text-left group"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="material-symbols-outlined text-outline text-[16px] shrink-0">
                              play_circle
                            </span>
                            <span className="text-xs text-primary font-medium truncate">
                              {lesson.lessonNumber}: {lesson.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant shrink-0 font-mono">
                            {lesson.duration}
                          </span>
                        </button>
                      );
                    }

                    // ── Locked ─────────────────────────────────────
                    return (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between px-3 py-2.5 border-b border-surface-container/40 opacity-45"
                        title="Complete the previous video to unlock"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="material-symbols-outlined text-outline text-[16px] shrink-0">
                            lock
                          </span>
                          <span className="text-xs text-on-surface-variant truncate">
                            {lesson.lessonNumber}: {lesson.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-outline shrink-0 font-mono">
                          {lesson.duration}
                        </span>
                      </div>
                    );
                  })}

                  {/* ── Module Assessment Row ──────────────────────────── */}
                  {/* Only shown if this module actually has a test configured */}
                  {!filterQuery && hasTest && (() => {
                    const testLocked = !videosComplete;
                    const isActiveTest = activeTestModuleId === module._id;

                    // Currently taking this test
                    if (isActiveTest) {
                      return (
                        <div className="flex items-center justify-between px-3 py-2.5 bg-amber-50 border-t-2 border-amber-400">
                          <div className="flex items-center gap-2">
                            <span
                              className="material-symbols-outlined text-amber-600 text-[16px] shrink-0"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              quiz
                            </span>
                            <div className="flex flex-col">
                              <span className="text-amber-900 font-bold text-xs">
                                Module Assessment
                                {testOptional && (
                                  <span className="ml-1.5 text-[10px] font-normal bg-amber-200 text-amber-800 rounded px-1 py-0.5">
                                    Optional
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-amber-700 font-medium animate-pulse">
                                ▶ In Progress…
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Test passed
                    if (testPassed) {
                      return (
                        <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 border-t border-emerald-100">
                          <div className="flex items-center gap-2">
                            <span
                              className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              task_alt
                            </span>
                            <span className="text-xs font-semibold text-emerald-800">
                              Module Assessment
                              {testOptional && (
                                <span className="ml-1.5 text-[10px] font-normal bg-emerald-200 text-emerald-800 rounded px-1 py-0.5">
                                  Optional
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700">
                            Passed ✓
                          </span>
                        </div>
                      );
                    }

                    // Locked (videos not all done)
                    if (testLocked) {
                      const remaining = lessons.length - completedInModule;
                      return (
                        <div className="flex items-center justify-between px-3 py-2.5 border-t border-surface-container/60 opacity-45">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-outline text-[16px] shrink-0">
                              lock
                            </span>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-on-surface-variant">
                                Module Assessment
                                {testOptional && (
                                  <span className="ml-1.5 text-[10px] font-normal bg-slate-200 text-slate-600 rounded px-1 py-0.5">
                                    Optional
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-outline">
                                Complete {remaining} more video{remaining !== 1 ? "s" : ""} to unlock
                              </span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-outline text-[16px] shrink-0">
                            lock
                          </span>
                        </div>
                      );
                    }

                    // Unlocked — ready to take
                    return (
                      <button
                        onClick={() => onStartModuleTest(module._id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 border-t-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="material-symbols-outlined text-amber-600 text-[16px] shrink-0"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            quiz
                          </span>
                          <div className="flex flex-col text-left">
                            <span className="text-amber-900 font-bold text-xs">
                              Module Assessment
                              {testOptional && (
                                <span className="ml-1.5 text-[10px] font-normal bg-amber-200 text-amber-800 rounded px-1 py-0.5">
                                  Optional
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-amber-700">
                              🔓 Unlocked — tap to start the quiz
                            </span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-amber-600 text-[18px] group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Final Test ───────────────────────────────────────────── */}
        {!filterQuery && (() => {
          // Count how many modules actually have tests in this course
          const totalModulesWithTests = modules.filter((m) =>
            moduleHasTest(m._id)
          ).length;

          if (allModulesFullyDone) {
            // Unlocked
            return (
              <button
                onClick={onStartFinalTest}
                className="w-full rounded-xl border-2 border-secondary bg-gradient-to-br from-slate-900 to-[#1a2744] overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.01] transition-all group"
              >
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                      <span
                        className="material-symbols-outlined text-secondary text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        workspace_premium
                      </span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Final Test · Unlocked 🎉
                      </span>
                      <span className="text-sm font-bold text-white leading-tight">
                        {course.title}
                      </span>
                      <span className="text-[10px] text-white/60 mt-0.5">
                        Score 70%+ to earn your certificate
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[22px] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </button>
            );
          }

          // Locked
          return (
            <div className="rounded-xl border border-[#E5E7EB] bg-surface-container-lowest overflow-hidden opacity-55 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-outline text-[22px]">
                    workspace_premium
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      Final Test
                    </span>
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {course.title}
                    </span>
                    <span className="text-[10px] text-outline mt-0.5">
                      Complete all modules to unlock
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
