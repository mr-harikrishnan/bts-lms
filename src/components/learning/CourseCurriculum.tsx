"use client";

import React, { useState } from "react";
import { Course, Lesson } from "@/types";

interface CourseCurriculumProps {
  course: Course;
  currentLessonId: string;
  completedLessonIds: string[];
  onSelectLesson: (lessonId: string) => void;
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
  course,
  currentLessonId,
  completedLessonIds,
  onSelectLesson,
}) => {
  // Determine which module contains currentLessonId
  const initialOpenModules: Record<string, boolean> = {};
  course.modules.forEach((mod) => {
    const hasCurrent = mod.lessons.some((l) => l.id === currentLessonId);
    initialOpenModules[mod.id] = hasCurrent;
  });

  const [openModules, setOpenModules] = useState<Record<string, boolean>>(initialOpenModules);
  const [filterQuery, setFilterQuery] = useState("");

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleExpandCollapseAll = () => {
    const allOpen = Object.values(openModules).every(Boolean);
    const updated: Record<string, boolean> = {};
    course.modules.forEach((mod) => {
      updated[mod.id] = !allOpen;
    });
    setOpenModules(updated);
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = completedLessonIds.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Curriculum Header & Filter Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                menu_book
              </span>
              Course Curriculum
            </h3>
            <span className="font-caption text-caption text-secondary font-semibold">
              {progressPercent}% Completed ({completedCount}/{totalLessons} Lessons)
            </span>
          </div>

          <button
            onClick={handleExpandCollapseAll}
            className="font-label-sm text-label-sm text-secondary font-semibold hover:underline"
          >
            {Object.values(openModules).every(Boolean) ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative mt-3">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search lessons or topics..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:ring-1 focus:ring-secondary text-primary placeholder:text-on-surface-variant"
          />
        </div>
      </div>

      {/* Modules List */}
      <div className="flex flex-col gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
        {course.modules.map((module, modIdx) => {
          const isModuleActive = module.lessons.some((l) => l.id === currentLessonId);
          const completedInModule = module.lessons.filter((l) =>
            completedLessonIds.includes(l.id)
          ).length;
          const isModuleCompleted = completedInModule === module.lessons.length;
          const isLocked = modIdx > 0 && !isModuleCompleted && !isModuleActive && completedInModule === 0 && completedCount < 3;
          const isOpen = openModules[module.id] ?? false;

          // Filter lessons if search query present
          const filteredLessons = module.lessons.filter((l) =>
            l.title.toLowerCase().includes(filterQuery.toLowerCase())
          );

          if (filterQuery && filteredLessons.length === 0) return null;

          return (
            <div
              key={module.id}
              className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm transition-all border ${
                isModuleActive
                  ? "border-2 border-secondary shadow-md"
                  : isLocked
                  ? "border-[#E5E7EB] opacity-75"
                  : "border-[#E5E7EB]"
              }`}
            >
              {/* Module Header Accordion Trigger */}
              <button
                onClick={() => toggleModule(module.id)}
                className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                  isModuleActive
                    ? "bg-secondary-container/40"
                    : "bg-surface-container-low hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isModuleCompleted ? (
                    <span
                      className="material-symbols-outlined text-secondary text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : isModuleActive ? (
                    <span className="material-symbols-outlined text-secondary text-[20px] animate-spin">
                      sync
                    </span>
                  ) : isLocked ? (
                    <span className="material-symbols-outlined text-outline text-[20px]">
                      lock
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[20px]">
                      radio_button_unchecked
                    </span>
                  )}

                  <div className="flex flex-col">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isModuleActive
                          ? "text-secondary"
                          : isLocked
                          ? "text-on-surface-variant"
                          : "text-secondary"
                      }`}
                    >
                      {module.moduleNumber} {isModuleActive && "• Current Focus"}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isModuleActive ? "text-primary font-bold" : "text-primary"
                      }`}
                    >
                      {module.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isModuleCompleted ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                      {module.lessons.length}/{module.lessons.length} ✓
                    </span>
                  ) : isModuleActive ? (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-semibold">
                      Active
                    </span>
                  ) : isLocked ? (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                      Locked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {completedInModule}/{module.lessons.length}
                    </span>
                  )}

                  <span
                    className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {/* Module Lessons List */}
              {isOpen && (
                <div className="p-2 flex flex-col gap-1 border-t border-surface-container bg-surface-container-lowest">
                  {filteredLessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const isLessonDone = completedLessonIds.includes(lesson.id);

                    if (isCurrent) {
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-secondary-container/60 border border-secondary/30 text-xs shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="material-symbols-outlined text-secondary text-[18px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              play_circle
                            </span>
                            <div className="flex flex-col">
                              <span className="text-primary font-bold">
                                {lesson.lessonNumber}: {lesson.title}
                              </span>
                              <span className="text-[10px] text-secondary font-medium">
                                Now Playing • {lesson.duration}
                              </span>
                            </div>
                          </div>

                          {/* Playing visualizer bars */}
                          <div className="flex items-end gap-0.5 h-3.5">
                            <span className="w-1 bg-secondary rounded-full animate-bounce h-2" />
                            <span className="w-1 bg-secondary rounded-full animate-bounce h-3.5 delay-100" />
                            <span className="w-1 bg-secondary rounded-full animate-bounce h-2.5 delay-200" />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs group transition-colors text-left ${
                          isLessonDone
                            ? "hover:bg-surface-container-low text-on-surface-variant"
                            : "hover:bg-surface-container-low text-on-surface font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {isLessonDone ? (
                            <span
                              className="material-symbols-outlined text-secondary text-[16px] shrink-0"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-outline text-[16px] shrink-0">
                              play_circle
                            </span>
                          )}
                          <span
                            className={`truncate ${
                              isLessonDone
                                ? "text-on-surface-variant group-hover:text-primary"
                                : "text-primary"
                            }`}
                          >
                            {lesson.lessonNumber}: {lesson.title}
                          </span>
                        </div>

                        <span
                          className={`font-mono text-[11px] shrink-0 ${
                            isLessonDone ? "text-secondary font-medium" : "text-on-surface-variant"
                          }`}
                        >
                          {lesson.duration} {isLessonDone && "✓"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
