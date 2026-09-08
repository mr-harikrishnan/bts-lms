"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { COURSE_TESTS } from "@/data/tests";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function FinalTestPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();
  const { courses, recordTestResult } = useBstorm();

  const course = courses.find((c) => c.id === courseId);
  const testData = course ? (COURSE_TESTS[course.id] || COURSE_TESTS["full-stack-web-dev"]) : null;

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(testData ? testData.timeLimitMinutes * 60 : 15 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = testData ? testData.questions.length : 0;

  const handleSubmit = (force = false) => {
    if (isSubmitting || !course || !testData) return;
    if (!force && answeredCount < totalQuestions) {
      setShowWarning(true);
      return;
    }
    setIsSubmitting(true);
    setShowWarning(false);

    // Calculate score
    let correctCount = 0;
    testData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= testData.passingScore;

    setTimeout(() => {
      recordTestResult(course.id, scorePercentage, passed);
      router.replace(`/test/${course.id}/result?score=${scorePercentage}&passed=${passed}`);
    }, 600);
  };

  // Timer countdown
  useEffect(() => {
    if (!testData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testData]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  if (!course || !testData) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline">
              search_off
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Course Test Not Found
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              The test you are trying to access could not be found.
            </p>
            <Link
              href="/courses"
              className="mt-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
            >
              Browse Courses
            </Link>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIdx];

  const customBreadcrumb = (
    <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
      <Link href={`/courses/${course.id}/learn`} className="hover:text-primary transition-colors flex items-center gap-1">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Learning Workspace</span>
      </Link>
      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
      <span className="text-primary font-semibold">Final Course Test</span>
    </div>
  );

  return (
    <AuthGuard>
      <AppShell customBreadcrumb={customBreadcrumb}>
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Test Header Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
                  Final Test
                </span>
                <span className="font-caption text-caption text-outline">
                  Passing Score: {testData.passingScore}%
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {testData.title}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Answer the questions below. Score 70% or higher to receive your verified completion certificate.
              </p>
            </div>

            {/* Live Timer Card */}
            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl border border-surface-container shrink-0 self-end md:self-auto">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                timer
              </span>
              <div className="flex flex-col">
                <span className="font-caption text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
                  Time Remaining
                </span>
                <span className="font-mono text-lg font-bold text-primary">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#E5E7EB] p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-label-md text-label-md text-primary font-semibold">
                Question {currentQuestionIdx + 1} of {totalQuestions}
              </span>
              <span className="text-on-surface-variant">
                {answeredCount} of {totalQuestions} Answered
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
            {/* Question Quick Jump Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-surface-container">
              {testData.questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = idx === currentQuestionIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-primary text-on-primary ring-2 ring-primary/30"
                        : isAnswered
                        ? "bg-secondary-container text-on-secondary-fixed font-bold"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unanswered Questions Warning Modal / Banner */}
          {showWarning && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-700 text-[22px]">
                  warning
                </span>
                <span className="text-sm font-medium">
                  You have only answered {answeredCount} of {totalQuestions} questions. Are you sure you want to finish?
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowWarning(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg hover:bg-amber-100/50"
                >
                  Review Questions
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-700 text-white rounded-lg hover:bg-amber-800"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          )}

          {/* Active Question Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-secondary-container text-on-secondary-fixed font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                Q{currentQuestionIdx + 1}
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-caption text-caption text-secondary font-semibold uppercase tracking-wider">
                  Select the best practical answer
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>

            {/* Answer Options Radio Group */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                return (
                  <label
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                    className={`p-4 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-secondary-container/30 border-secondary ring-1 ring-secondary"
                        : "bg-surface-container-low border-[#E5E7EB] hover:bg-surface-container"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-secondary bg-secondary text-on-secondary"
                          : "border-outline bg-surface-container-lowest"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-on-secondary" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        isSelected
                          ? "font-semibold text-primary"
                          : "text-on-surface"
                      }`}
                    >
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Stepper Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                disabled={currentQuestionIdx === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                <span>Previous</span>
              </button>

              {currentQuestionIdx < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestionIdx((p) =>
                      Math.min(totalQuestions - 1, p + 1)
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
                >
                  <span>Next Question</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        sync
                      </span>
                      <span>Grading Assessment...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Test</span>
                      <span className="material-symbols-outlined text-[18px]">
                        verified
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
