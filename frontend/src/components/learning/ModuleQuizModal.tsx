import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface ModuleQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  moduleNumber: string;
  nextModuleTitle?: string;
  onAdvanceToNextModule: () => void;
}

export const ModuleQuizModal: React.FC<ModuleQuizModalProps> = ({
  isOpen,
  onClose,
  courseId,
  moduleId,
  moduleTitle,
  moduleNumber,
  nextModuleTitle,
  onAdvanceToNextModule,
}) => {
  const [quiz, setQuiz] = useState<PublicCourseTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  // Store selected answers: for MCQ a number, for MSQ an array of numbers
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | number[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<TestSubmissionResult | null>(null);

  // Countdown timer for auto-advancing to next module
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !courseId || !moduleId) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    setResult(null);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setCountdown(null);

    async function fetchQuiz() {
      try {
        const data = await courseService.getModuleTest(courseId, moduleId);
        if (isMounted) {
          setQuiz(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err?.message || "Assessment not found for this module.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchQuiz();
    return () => {
      isMounted = false;
    };
  }, [isOpen, courseId, moduleId]);

  // Handle countdown when quiz is passed
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      onAdvanceToNextModule();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, onAdvanceToNextModule]);

  if (!isOpen) return null;

  const handleSelectAnswer = (qId: string, optIdx: number, isMsq: boolean) => {
    if (result) return; // Locked once submitted

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
        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        // Start 4-second auto-advance countdown if next module exists
        if (nextModuleTitle) {
          setCountdown(4);
        }
      }
    } catch (err: any) {
      alert(err?.message || "Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setCountdown(null);
  };

  // If no quiz exists for this module, show a clean skip/transition screen
  if (loadError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {moduleNumber} Completed
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {moduleTitle}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              You finished all lessons in this module. Ready to advance to the next step?
            </p>
          </div>

          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Stay Here
            </button>
            <button
              onClick={onAdvanceToNextModule}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Next Module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !quiz) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700">Loading module assessment...</p>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx];
  const totalQ = questions.length;
  const isLastQ = currentIdx === totalQ - 1;
  const allAnswered = questions.every((q) => isAnswered(q._id));

  // Current question properties
  const isMsq = currentQ?.type === "msq";
  const currentAnswer = currentQ ? selectedAnswers[currentQ._id] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  {moduleNumber} Assessment
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-[10px] font-semibold text-slate-600">
                  Passing: {quiz.passingScore}%
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {quiz.title}
              </h2>
            </div>
          </div>

          {!result && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              title="Close and resume video"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STATE 1: RESULT SCREEN */}
          {result ? (
            <div className="flex flex-col items-center text-center gap-6 py-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                  result.passed
                    ? "bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50"
                    : "bg-rose-100 text-rose-600 ring-8 ring-rose-50"
                }`}
              >
                {result.passed ? (
                  <Sparkles className="w-10 h-10" />
                ) : (
                  <AlertCircle className="w-10 h-10" />
                )}
              </div>

              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    result.passed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {result.passed ? "Assessment Passed 🎉" : "Assessment Not Passed"}
                </span>

                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  {result.score}% Score
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  You got {result.correctCount} of {result.totalQuestions} questions correct.
                  (Required: {result.passingScore}%)
                </p>
              </div>

              {/* Udemy-Style Next Module Auto-Advance Banner */}
              {result.passed ? (
                <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 text-left shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Module Complete!
                    </span>
                    <span className="text-base font-bold">
                      {nextModuleTitle ? `Next: ${nextModuleTitle}` : "Final Module Finished!"}
                    </span>
                    {countdown !== null && countdown > 0 && nextModuleTitle && (
                      <span className="text-xs text-slate-300">
                        Loading next module in <strong className="text-emerald-300">{countdown}s</strong>...
                      </span>
                    )}
                  </div>

                  <button
                    onClick={onAdvanceToNextModule}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Continue to Next Module</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    Review the question explanations below, then retry the assessment or revisit the lessons to master the concepts.
                  </div>
                </div>
              )}

              {/* Question by Question Review */}
              <div className="w-full text-left flex flex-col gap-3 mt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-rose-50/50 border-rose-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-slate-800">
                          {idx + 1}. {q.question}
                        </span>
                        {fb.correct ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs shrink-0">
                            <XCircle className="w-4 h-4" />
                            Incorrect
                          </span>
                        )}
                      </div>

                      {/* Explanation */}
                      {fb.explanation && (
                        <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                          <strong>Explanation:</strong> {fb.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons for Failure */}
              {!result.passed && (
                <div className="flex items-center gap-3 w-full mt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Review Lessons</span>
                  </button>
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retry Assessment</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STATE 2: ACTIVE QUIZ QUESTIONS */
            <div className="flex flex-col gap-5">
              {/* Question Progress Tracker */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Question <strong className="text-slate-900">{currentIdx + 1}</strong> of {totalQ}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                    isMsq
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {isMsq ? "Multiple Select (MSQ)" : "Single Choice (MCQ)"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
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

              {/* Options List */}
              <div className="flex flex-col gap-2.5 pt-1">
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
                          ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Checkbox / Radio Visual */}
                      <div
                        className={`w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                          isMsq
                            ? isChecked
                              ? "bg-emerald-600 text-white rounded-md"
                              : "border-2 border-slate-300 rounded-md group-hover:border-slate-400"
                            : isChecked
                            ? "border-[6px] border-emerald-600 bg-white rounded-full"
                            : "border-2 border-slate-300 rounded-full group-hover:border-slate-400"
                        }`}
                      >
                        {isMsq && isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <span
                        className={`text-sm leading-relaxed ${
                          isChecked ? "font-semibold text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!result && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/70 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {!isLastQ ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(totalQ - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Module Quiz</span>
                      <Award className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
