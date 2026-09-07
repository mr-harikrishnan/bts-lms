"use client";

import React, { use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { PaymentGateway } from "@/components/checkout/PaymentGateway";
import { OrderSummary } from "@/components/checkout/OrderSummary";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const { courses, user } = useBstorm();

  const course = courses.find((c) => c.id === courseId) || courses[0];

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

  return (
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

        {/* Main 2-Column Checkout Layout */}
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
      </div>
    </AppShell>
  );
}
