import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { PublicCourseTest, TestSubmissionResult } from "@/types";
import { courseService } from "@/services/apiClient";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Award,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SkipForward,
} from "lucide-react";

interface ModuleQuizSectionProps {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  moduleNumber: string;
  nextModuleTitle?: string;
  onAdvanceToNextModule: () => void;
  onQuizPassed?: () => void; // called immediately when quiz result is "passed"
  onSkip?: () => void; // only available if isOptional
}

export const ModuleQuizSection: React.FC<ModuleQuizSectionProps> = ({
  courseId,
  moduleId,
  moduleTitle,
  moduleNumber,
  nextModuleTitle,
  onAdvanceToNextModule,
  onQuizPassed,
  onSkip,
}) => {
  const [quiz, setQuiz] = useState<PublicCourseTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | number[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<TestSubmissionResult | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  // Fetch quiz on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    async function fetchQuiz() {
      try {
        const data = await courseService.getModuleTest(courseId, moduleId);
        if (isMounted) setQuiz(data);
      } catch (err: any) {
        if (isMounted) setLoadError(err?.message || "No assessment for this module.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchQuiz();
    return () => { isMounted = false; };
  }, [courseId, moduleId]);

  // Auto-advance countdown after passing
  useEffect(() => {
    if (autoAdvanceCountdown === null) return;
    if (autoAdvanceCountdown <= 0) {
      onAdvanceToNextModule();
      return;
    }
    const t = setTimeout(() => setAutoAdvanceCountdown((p) => (p !== null ? p - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [autoAdvanceCountdown, onAdvanceToNextModule]);

  const handleSelectAnswer = (qId: string, optIdx: number, isMsq: boolean) => {
    if (result) return;
    if (isMsq) {
      const current = (selectedAnswers[qId] as number[]) || [];
      const updated = current.includes(optIdx)
        ? current.filter((i) => i !== optIdx)
        : [...current, optIdx];
      setSelectedAnswers((prev) => ({ ...prev, [qId]: updated }));
    } else {
      setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    }
  };

  const isAnswered = (qId: string) => {
    const val = selectedAnswers[qId];
    if (val === undefined) return false;
    if (Array.isArray(val)) return val.length > 0;
    return typeof val === "number";
  };

  const handleSubmit = async () => {
    if (!quiz || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await courseService.submitModuleTest(courseId, moduleId, selectedAnswers);
      setResult(res);
      if (res.passed) {
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
          setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }), 250);
          setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 400);
        } catch {/* ignore */}
        onQuizPassed?.(); // notify parent immediately that test is passed
        if (nextModuleTitle) {
          setAutoAdvanceCountdown(5);
        }
      }
    } catch (err: any) {
      alert(err?.message || "Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setAutoAdvanceCountdown(null);
  };

  // ─── LOADING STATE ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-surface-container-lowest p-10 flex flex-col items-center justify-center gap-3 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <p className="text-sm font-semibold text-on-surface-variant">Loading module assessment...</p>
      </div>
    );
  }

  // ─── NO QUIZ / ERROR (no test for this module) ────────────────────
  if (loadError || !quiz) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">{moduleNumber} Complete</p>
            <h3 className="text-base font-bold text-white">{moduleTitle}</h3>
          </div>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">
            All lessons in this module are done. No assessment required.
          </p>
          <button
            onClick={onAdvanceToNextModule}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary text-sm font-semibold hover:opacity-90 shadow-sm transition-all"
          >
            <span>{nextModuleTitle ? `Start: ${nextModuleTitle}` : "Finish Course"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx];
  const totalQ = questions.length;
  const isLastQ = currentIdx === totalQ - 1;
  const allAnswered = questions.every((q) => isAnswered(q._id));
  const isMsq = currentQ?.type === "msq";
  const currentAnswer = currentQ ? selectedAnswers[currentQ._id] : undefined;
  const answeredCount = questions.filter((q) => isAnswered(q._id)).length;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-surface-container-lowest overflow-hidden shadow-sm">
      {/* ─── HEADER ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-[#1a2744] px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              {moduleNumber} · Module Assessment
            </p>
            <h3 className="text-base font-bold text-white leading-tight">{quiz.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
            Pass: {quiz.passingScore}%
          </span>
          {quiz.isOptional && onSkip && !result && (
            <button
              onClick={onSkip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 text-white/70 text-xs font-semibold hover:bg-white/10 transition-all"
              title="Skip this assessment (it's optional)"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── RESULT STATE ─────────────────────────────────────────── */}
      {result ? (
        <div className="p-6 flex flex-col gap-5">
          {/* Score Banner */}
          <div className={`rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            result.passed
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-rose-50 border border-rose-200"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                result.passed ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              }`}>
                {result.passed
                  ? <Sparkles className="w-8 h-8" />
                  : <AlertCircle className="w-8 h-8" />}
              </div>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  result.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {result.passed ? "Assessment Passed 🎉" : "Not Passed"}
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1">{result.score}%</p>
                <p className="text-sm text-slate-500">
                  {result.correctCount} / {result.totalQuestions} correct · Required {result.passingScore}%
                </p>
              </div>
            </div>

            {/* Pass: Next Module Banner */}
            {result.passed && nextModuleTitle && (
              <div className="flex flex-col items-end gap-2">
                {autoAdvanceCountdown !== null && autoAdvanceCountdown > 0 && (
                  <p className="text-xs text-slate-500">
                    Auto-advancing in <strong className="text-emerald-700">{autoAdvanceCountdown}s</strong>...
                  </p>
                )}
                <button
                  onClick={() => {
                    setAutoAdvanceCountdown(null);
                    onAdvanceToNextModule();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-md"
                >
                  <span>{nextModuleTitle ? `Next: ${nextModuleTitle}` : "Finish"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {result.passed && !nextModuleTitle && (
              <button
                onClick={onAdvanceToNextModule}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-md"
              >
                <span>Course Complete!</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Fail: retry or review */}
          {!result.passed && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Review the explanations below, then retry. You must score at least {result.passingScore}% to proceed.</span>
              </div>
              <div className="flex items-center gap-2">
                {quiz.isOptional && onSkip && (
                  <button
                    onClick={onSkip}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip (Optional)</span>
                  </button>
                )}
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}

          {/* Question Review */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Question Review
            </h4>
            {result.feedback?.map((fb, idx) => {
              const q = questions.find((item) => item._id === fb.questionId);
              if (!q) return null;
              return (
                <div
                  key={fb.questionId}
                  className={`p-4 rounded-xl border text-sm flex flex-col gap-2 ${
                    fb.correct
                      ? "bg-emerald-50/60 border-emerald-200"
                      : "bg-rose-50/60 border-rose-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-slate-800">
                      {idx + 1}. {q.question}
                    </span>
                    {fb.correct ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs shrink-0">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>
                  {fb.explanation && (
                    <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                      <strong>Explanation:</strong> {fb.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ─── ACTIVE QUIZ ─────────────────────────────────────────── */
        <div className="p-6 flex flex-col gap-5">
          {/* Question progress row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-on-surface-variant">
                Question <strong className="text-primary">{currentIdx + 1}</strong> of {totalQ}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                isMsq ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}>
                {isMsq ? "Multiple Select" : "Single Choice"}
              </span>
            </div>
            <span className="text-xs text-on-surface-variant">
              {answeredCount}/{totalQ} answered
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
            />
          </div>

          {/* Question dots */}
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, idx) => (
              <button
                key={q._id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  idx === currentIdx
                    ? "bg-secondary text-on-secondary shadow-sm"
                    : isAnswered(q._id)
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-surface-container text-on-surface-variant border border-surface-container-high"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-primary leading-snug">
              {currentQ?.question}
            </h3>
            {isMsq && (
              <p className="text-xs text-purple-700 font-medium flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Select all correct options that apply.
              </p>
            )}
            {currentQ?.codeSnippet && (
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {currentQ?.options.map((opt, optIdx) => {
              const isChecked = isMsq
                ? Array.isArray(currentAnswer) && currentAnswer.includes(optIdx)
                : currentAnswer === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectAnswer(currentQ._id, optIdx, isMsq)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 group ${
                    isChecked
                      ? "bg-secondary/8 border-secondary ring-2 ring-secondary/20 shadow-xs"
                      : "bg-surface border-[#E5E7EB] hover:border-slate-300 hover:bg-surface-container-lowest"
                  }`}
                >
                  <div className={`w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                    isMsq
                      ? isChecked
                        ? "bg-secondary text-on-secondary rounded-md"
                        : "border-2 border-slate-300 rounded-md group-hover:border-slate-400"
                      : isChecked
                      ? "border-[6px] border-secondary bg-white rounded-full"
                      : "border-2 border-slate-300 rounded-full group-hover:border-slate-400"
                  }`}>
                    {isMsq && isChecked && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm leading-relaxed ${isChecked ? "font-semibold text-primary" : "text-on-surface-variant"}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {quiz.isOptional && onSkip && (
                <button
                  onClick={onSkip}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Skip
                </button>
              )}

              {!isLastQ ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(totalQ - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-xs transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-on-secondary text-sm font-bold hover:opacity-90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Quiz</span>
                      <Award className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
