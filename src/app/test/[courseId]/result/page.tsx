"use client";

import React, { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";

export default function TestResultPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const searchParams = useSearchParams();

  const { courses, getCertificateByCourseId, user } = useBstorm();
  const course = courses.find((c) => c.id === courseId) || courses[0];

  const score = searchParams.get("score") ? Number(searchParams.get("score")) : 94;
  const passed = searchParams.get("passed") !== null ? searchParams.get("passed") === "true" : score >= 70;

  const certificate = getCertificateByCourseId(course.id);

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center py-6 max-w-2xl mx-auto">
        <div className="w-full bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-8 sm:p-10 shadow-sm flex flex-col items-center text-center gap-6">
          {/* Badge Icon */}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
              passed
                ? "bg-secondary-container text-on-secondary-fixed ring-4 ring-secondary-container/50"
                : "bg-error-container text-on-error-container ring-4 ring-error-container/50"
            }`}
          >
            <span
              className="material-symbols-outlined text-[48px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {passed ? "workspace_premium" : "sentiment_dissatisfied"}
            </span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1.5">
            <span
              className={`font-label-sm text-label-sm uppercase tracking-wider font-bold ${
                passed ? "text-secondary" : "text-error"
              }`}
            >
              {passed ? "Test Completed • Passed" : "Test Incomplete • Did Not Pass"}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {passed ? "Congratulations, " + (user.name || "Hari") + "!" : "Keep Pushing Forward!"}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              {passed
                ? `You have shown great practical understanding in ${course.title} and passed the final skills test!`
                : `You scored ${score}%. The minimum passing score is 70%. Review the video lessons and retry when ready.`}
            </p>
          </div>

          {/* Score breakdown metrics card */}
          <div className="w-full grid grid-cols-3 gap-3 bg-surface-container-low p-5 rounded-xl border border-surface-container">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-on-surface-variant">
                Your Score
              </span>
              <span
                className={`font-headline-md text-headline-md font-bold ${
                  passed ? "text-secondary" : "text-error"
                }`}
              >
                {score}%
              </span>
            </div>

            <div className="flex flex-col border-x border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant">
                Required
              </span>
              <span className="font-headline-md text-headline-md font-bold text-primary">
                70%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-caption text-caption text-on-surface-variant">
                Academic Grade
              </span>
              <span className="font-headline-md text-headline-md font-bold text-primary">
                {passed ? (score >= 90 ? "Honors" : "Pass") : "Needs Review"}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            {passed ? (
              <>
                <Link
                  href={certificate ? `/certificates/${certificate.id}` : "/certificates"}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary/90 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    workspace_premium
                  </span>
                  <span>View Certificate</span>
                </Link>

                <Link
                  href="/my-courses"
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-surface-container border border-[#E5E7EB] transition-all flex items-center justify-center gap-2"
                >
                  <span>Return to My Courses</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/test/${course.id}`}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    replay
                  </span>
                  <span>Retake Test</span>
                </Link>

                <Link
                  href={`/courses/${course.id}/learn`}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-surface-container-low text-primary font-label-md text-label-md font-semibold hover:bg-surface-container border border-[#E5E7EB] transition-all flex items-center justify-center gap-2"
                >
                  <span>Review Lessons</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
