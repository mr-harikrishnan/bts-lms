import React from "react";
import { Course } from "@/types";

interface OrderSummaryProps {
  course: Course;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ course }) => {
  const discount = course.originalPrice - course.price;

  return (
    <div className="flex flex-col gap-6">
      {/* Order Summary Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 sm:p-7 flex flex-col gap-6 border border-[#E5E7EB]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
            Order Summary
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            1 Course Enrollment
          </span>
        </div>

        {/* Course Details Preview */}
        <div className="flex gap-4 items-start bg-surface-container-low p-4 rounded-xl border border-surface-container">
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-highest">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full h-full object-cover"
              src={course.thumbnail}
              alt={course.title}
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 bg-secondary-container/60 text-on-secondary-fixed rounded text-[11px] font-semibold">
                {course.category}
              </span>
              <span className="font-caption text-caption text-outline">
                • {course.duration}
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary line-clamp-2 leading-snug text-base font-semibold">
              {course.title}
            </h3>
            <span className="font-caption text-caption text-on-surface-variant mt-1">
              Track: 2025 Self-Paced Certificate Course
            </span>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center font-body-sm text-body-sm text-on-surface-variant">
            <span>Course Fee</span>
            <span className="text-primary font-medium">
              ₹{course.originalPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center font-body-sm text-body-sm text-secondary">
            <div className="flex items-center gap-1.5">
              <span>College Student Launch Discount</span>
              <span className="material-symbols-outlined text-[15px]">info</span>
            </div>
            <span className="font-semibold">-₹{discount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span>Tax / GST</span>
              <span className="text-[11px] bg-secondary-container text-on-secondary-fixed px-1.5 py-0.5 rounded font-semibold">
                Student Grant
              </span>
            </div>
            <span className="text-secondary font-medium">₹0 (Waived)</span>
          </div>

          <div className="h-[1px] bg-surface-container-highest my-1" />

          <div className="flex justify-between items-baseline pt-1">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                Total Payable
              </span>
              <span className="font-caption text-caption text-outline">
                Instant lifetime access upon payment
              </span>
            </div>
            <span className="font-display text-display text-primary font-bold">
              ₹{course.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="p-3.5 bg-surface-container-low rounded-xl flex items-center justify-between gap-3 border border-surface-container">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              local_offer
            </span>
            <div className="flex flex-col truncate">
              <span className="font-label-md text-label-md text-primary font-bold tracking-wide">
                STUDENT2025
              </span>
              <span className="font-caption text-caption text-secondary">
                Verified Student Discount Applied
              </span>
            </div>
          </div>
          <span className="font-label-sm text-label-sm px-2.5 py-1 bg-surface-container-lowest text-secondary font-semibold rounded-md shadow-sm border border-[#E5E7EB]">
            Applied
          </span>
        </div>

        {/* What's Included Tier Checklist */}
        <div className="flex flex-col gap-3 pt-2">
          <span className="font-label-md text-label-md text-primary font-semibold">
            What is included in this course:
          </span>
          <ul className="flex flex-col gap-2.5">
            <li className="flex items-start gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>
                {course.modules.length} Step-by-Step Modules + Hands-on Practice Projects
              </span>
            </li>
            <li className="flex items-start gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>Dedicated Doubt Support & Project Feedback</span>
            </li>
            <li className="flex items-start gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>Verified Shareable Certificate upon passing the course</span>
            </li>
            <li className="flex items-start gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>Resume Preparation & Internship / Job Guidance</span>
            </li>
          </ul>
        </div>

        {/* Post-Payment Instant Redirection Banner */}
        <div className="p-3.5 bg-secondary-container/40 rounded-xl flex items-center gap-3 border border-secondary/20">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
            play_circle
          </span>
          <p className="font-caption text-caption text-on-surface leading-relaxed">
            <strong className="text-primary font-semibold">Immediate access:</strong> You
            will be instantly redirected to Lesson 1 upon confirmation.
          </p>
        </div>
      </div>

      {/* Academic Assistance Box */}
      <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between gap-4 border border-surface-container">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[22px]">
            support_agent
          </span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-primary font-semibold">
              Need assistance?
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              Student support active 9am - 9pm IST
            </span>
          </div>
        </div>
        <span className="font-label-sm text-label-sm text-secondary font-semibold hover:underline cursor-pointer">
          Chat Support
        </span>
      </div>
    </div>
  );
};
