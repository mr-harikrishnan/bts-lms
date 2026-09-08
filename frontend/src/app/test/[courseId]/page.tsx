"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { courseService } from "@/services/apiClient";
import { PublicCourseTest } from "@/types";
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

  const course = courses.find((c) => c._id === courseId);
  const [testData, setTestData] = useState<PublicCourseTest | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  // Load test from API
  useEffect(() => {
    let isMounted = true;
    async function loadTest() {
      setIsLoadingTest(true);
      setLoadError("");
      try {
        const data = await courseService.getTest(courseId);
        if (isMounted) {
          setTestData(data);
          setTimeLeft(data.timeLimitMinutes * 60);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Test loading error:", err);
          setLoadError("Unable to load test assessment. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingTest(false);
        }
      }
    }
    loadTest();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = testData ? testData.questions.length : 0;

  const handleSubmit = async (force = false) => {
    if (isSubmitting || !course || !testData) return;
    if (!force && answeredCount < totalQuestions) {
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);
    setShowWarning(false);
    setSubmissionError("");

    try {
      const result = await courseService.submitTest(course._id, selectedAnswers);
      recordTestResult(course._id, result.score, result.passed, result.certificate);
      router.replace(
        `/test/${course._id}/result?score=${result.score}&passed=${result.passed}`
      );
    } catch (err: unknown) {
      console.error("Test submission failed:", err);
      setSubmissionError("Unable to submit test. Please check your connection and try again.");
      setIsSubmitting(false);
    }
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

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const customBreadcrumb = (
    <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
      <Link
        href={`/courses/${courseId}/learn`}
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Learning Workspace</span>
      </Link>
      <span className="material-symbols-outlined text-[16px] text-outline">
        chevron_right
      </span>
      <span className="text-primary font-semibold">Final Course Test</span>
    </div>
  );

  if (isLoadingTest) {
    return (
      <AuthGuard>
        <AppShell customBreadcrumb={customBreadcrumb}>
          <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-pulse">
            <div className="h-28 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
            <div className="h-96 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  if (!course || !testData || loadError) {
    return (
      <AuthGuard>
        <AppShell customBreadcrumb={customBreadcrumb}>
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline">
              search_off
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Course Test Not Found
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              {loadError || "The assessment you are trying to access could not be located."}
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
              <h1 className="text-xl font-bold text-primary tracking-tight">
                {testData.title}
              </h1>
              <p className="text-xs text-on-surface-variant">
                {course.title} • {totalQuestions} Questions
              </p>
            </div>

            {/* Timer & Progress pill */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm ${
                  timeLeft < 300
                    ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                    : "bg-surface-container-low text-primary border-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <span>{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface-variant">
                <span>
                  {answeredCount} of {totalQuestions} answered
                </span>
              </div>
            </div>
          </div>

          {/* Submission Error Alert */}
          {submissionError && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{submissionError}</span>
            </div>
          )}

          {/* Question Navigation Bubbles */}
          <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-4 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              {testData.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = selectedAnswers[q._id] !== undefined;
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-9 h-9 rounded-xl font-label-md text-xs font-bold transition-all shrink-0 ${
                      isCurrent
                        ? "bg-primary text-on-primary ring-2 ring-primary/40 shadow-sm"
                        : isAnswered
                        ? "bg-secondary text-on-secondary"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-surface-container bg-surface-container-lowest text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 transition-all"
              >
                Prev
              </button>
              <button
                disabled={currentQuestionIdx === totalQuestions - 1}
                onClick={() =>
                  setCurrentQuestionIdx((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
                className="px-3 py-1.5 rounded-lg border border-surface-container bg-surface-container-lowest text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 transition-all"
              >
                Next
              </button>
            </div>
          </div>

          {/* Question Content Box */}
          {currentQuestion && (
            <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between gap-2 border-b border-surface-container pb-4">
                <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wider">
                  Question {currentQuestionIdx + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-outline font-medium">Multiple Choice</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-primary leading-relaxed">
                {currentQuestion.question}
              </h2>

              {currentQuestion.codeSnippet && (
                <div className="rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre>{currentQuestion.codeSnippet}</pre>
                </div>
              )}

              {/* Options */}
              <div className="flex flex-col gap-3 pt-2">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestion._id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion._id, optIdx)}
                      className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                        isSelected
                          ? "bg-secondary-container/40 border-secondary text-primary font-medium ring-1 ring-secondary/50"
                          : "bg-surface-container-lowest border-surface-container hover:border-outline-variant hover:bg-surface-container-low/50 text-on-surface"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? "border-secondary bg-secondary text-on-secondary"
                            : "border-outline group-hover:border-primary"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-body-md text-sm leading-relaxed">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation & Submit Bar */}
              <div className="pt-6 border-t border-surface-container flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-surface-container bg-surface-container-lowest text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_back
                    </span>
                    <span>Previous Question</span>
                  </button>
                  {currentQuestionIdx < totalQuestions - 1 && (
                    <button
                      onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-primary transition-all flex items-center gap-1"
                    >
                      <span>Next Question</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {showWarning && answeredCount < totalQuestions && (
                    <span className="text-xs text-amber-700 font-medium">
                      You have unanswered questions ({totalQuestions - answeredCount} left).
                    </span>
                  )}
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSubmit(false)}
                    className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-sm font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        <span>Grading Test...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">
                          check_circle
                        </span>
                        <span>Submit Final Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
