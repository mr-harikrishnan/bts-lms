"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { PaymentGateway } from "@/components/checkout/PaymentGateway";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { courseService } from "@/services/apiClient";
import { Course } from "@/types";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const { courses, user, isEnrolled, isLoading: isContextLoading } = useBstorm();

  const [apiCourse, setApiCourse] = useState<Course | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  const contextCourse = courses.find((c) => c._id === courseId);
  const course = contextCourse || apiCourse;

  useEffect(() => {
    let isMounted = true;
    if (contextCourse) {
      setIsLoadingApi(false);
      return;
    }

    async function loadCourse() {
      setIsLoadingApi(true);
      try {
        const data = await courseService.getById(courseId);
        if (isMounted) {
          setApiCourse(data);
        }
      } catch (err) {
        console.error("Failed to load course for checkout:", err);
      } finally {
        if (isMounted) {
          setIsLoadingApi(false);
        }
      }
    }
    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId, contextCourse]);

  const customBreadcrumb = (
    <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
      <Link href="/courses" className="hover:text-primary transition-colors flex items-center gap-1">
        <span className="material-symbols-outlined text-[18px]">auto_stories</span>
        <span>Courses</span>
      </Link>
      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
      <span className="text-on-surface-variant">Enrollment</span>
      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
      <span className="text-primary font-semibold">Checkout & Verification</span>
    </div>
  );

  if (isContextLoading || isLoadingApi) {
    return (
      <AuthGuard>
        <AppShell customBreadcrumb={customBreadcrumb}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-8 h-96 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
            <div className="lg:col-span-4 h-96 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  if (!course) {
    return (
      <AuthGuard>
        <AppShell customBreadcrumb={customBreadcrumb}>
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline">
              search_off
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Course Not Found
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              The course you are attempting to enroll in could not be located in the BSTORM curriculum.
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


  const alreadyEnrolled = isEnrolled(course._id);

  return (
    <AuthGuard>
      <AppShell customBreadcrumb={customBreadcrumb}>
        <div className="flex flex-col gap-6">
          {/* Top Context & Active Learner Session Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Verified Enrollment Portal
              </span>
            </div>

            {/* Active Learner Session Pill */}
            <div className="flex items-center gap-3 bg-surface-container-lowest px-3.5 py-1.5 rounded-full shadow-sm border border-[#E5E7EB]">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Learner Avatar"
                  className="w-6 h-6 rounded-full object-cover"
                  src={user.avatar}
                />
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                {user.name || "Hari"}
              </span>
              <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-medium">
                {user.grantName || "PSG Tech Academic Grant"}
              </span>
            </div>
          </div>

          {/* Already Enrolled Guard Card vs Payment Gateway */}
          {alreadyEnrolled ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-secondary/30 p-8 sm:p-12 shadow-sm flex flex-col items-center text-center gap-5 max-w-xl mx-auto my-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center ring-8 ring-secondary-container/30">
                <span className="material-symbols-outlined text-[36px]">
                  verified
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                  Active Enrollment
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  You are already enrolled in {course.title}
                </h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your learning workspace is active. You do not need to purchase this course again. Continue where you left off.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-3">
                <Link
                  href={`/courses/${course._id}/learn`}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-secondary text-on-secondary text-sm font-semibold hover:bg-secondary/90 transition-all shadow-sm text-center flex items-center justify-center gap-2"
                >
                  <span>Continue Learning</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link
                  href="/my-courses"
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-surface-container-low text-primary text-sm font-semibold hover:bg-surface-container border border-[#E5E7EB] transition-all text-center"
                >
                  View My Courses
                </Link>
              </div>
            </div>
          ) : (
            /* Main 2-Column Checkout Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Payment Methods (7 Cols) */}
              <div className="lg:col-span-7">
                <PaymentGateway course={course} />
              </div>

              {/* Right: Order Summary (5 Cols) */}
              <div className="lg:col-span-5">
                <OrderSummary course={course} />
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
