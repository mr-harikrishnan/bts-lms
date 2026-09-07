"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { COURSE_TESTS } from "@/data/tests";

export default function FinalTestPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();
  const { courses, recordTestResult } = useBstorm();

  const course = courses.find((c) => c.id === courseId) || courses[0];
  const testData = COURSE_TESTS[course.id] || COURSE_TESTS["full-stack-web-dev"];

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(testData.timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = testData.questions.length;
  const currentQuestion = testData.questions[currentQuestionIdx];

  const handleSubmit = () => {
    setIsSubmitting(true);

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
      router.push(`/test/${course.id}/result?score=${scorePercentage}&passed=${passed}`);
    }, 600);
  };

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
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-primary">
              Question {currentQuestionIdx + 1} of {totalQuestions}
            </span>
            <span className="text-secondary">
              {answeredCount} of {totalQuestions} Answered
            </span>
          </div>

          {/* Stepper dots */}
          <div className="grid grid-cols-5 gap-2">
            {testData.questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIdx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`h-2 rounded-full transition-all ${
                    isCurrent
                      ? "bg-secondary ring-2 ring-secondary-container"
                      : isAnswered
                      ? "bg-secondary"
                      : "bg-surface-container-high"
                  }`}
                  title={`Go to question ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Question Container Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
              Question {currentQuestionIdx + 1}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? "bg-secondary-container/40 border-secondary ring-1 ring-secondary shadow-sm"
                      : "bg-surface-container-low border-[#E5E7EB] hover:bg-surface-container"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-secondary text-on-secondary"
                        : "bg-surface-container text-on-surface-variant border border-outline-variant"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span
                    className={`font-body-md text-body-md flex-1 ${
                      isSelected ? "text-primary font-semibold" : "text-on-surface"
                    }`}
                  >
                    {opt}
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stepper Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-container mt-2">
            <button
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-low text-primary font-label-md text-label-md border border-[#E5E7EB] hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              <span>Previous</span>
            </button>

            {currentQuestionIdx < totalQuestions - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestionIdx((prev) =>
                    Math.min(totalQuestions - 1, prev + 1)
                  )
                }
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
              >
                <span>Next Question</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary/90 transition-all shadow-md"
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
  );
}
