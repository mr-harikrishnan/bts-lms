import React, { useState } from "react";
import { Course, CouponValidationResult } from "@/types";
import { couponService } from "@/services/apiClient";

interface OrderSummaryProps {
  course: Course;
  appliedCoupon: CouponValidationResult | null;
  onApplyCoupon: (coupon: CouponValidationResult | null) => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  course,
  appliedCoupon,
  onApplyCoupon,
}) => {
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const originalPrice = course.originalPrice || course.price || 0;
  const currentPrice = course.price || 0;
  const baseDiscount = originalPrice > currentPrice ? originalPrice - currentPrice : 0;
  const finalPrice = appliedCoupon ? appliedCoupon.finalPrice : currentPrice;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    setIsValidating(true);
    setCouponError(null);
    try {
      const res = await couponService.validate(cleanCode, course._id);
      onApplyCoupon(res);
      setCouponCodeInput("");
    } catch (err: any) {
      setCouponError(err?.message || "Invalid coupon code for this course.");
      onApplyCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    setCouponError(null);
  };

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

          {baseDiscount > 0 && (
            <div className="flex justify-between items-center font-body-sm text-body-sm text-secondary">
              <div className="flex items-center gap-1.5">
                <span>College Student Launch Discount</span>
                <span className="material-symbols-outlined text-[15px]">info</span>
              </div>
              <span className="font-semibold">-₹{baseDiscount.toLocaleString()}</span>
            </div>
          )}

          {appliedCoupon && (
            <div className="flex justify-between items-center font-body-sm text-body-sm text-emerald-700 bg-emerald-50/70 px-2.5 py-1.5 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">
                  sell
                </span>
                <span className="font-medium">Coupon Discount ({appliedCoupon.code || appliedCoupon.coupon?.code})</span>
              </div>
              <span className="font-bold text-emerald-800">
                -₹{appliedCoupon.discountAmount.toLocaleString()}
              </span>
            </div>
          )}

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
                {finalPrice === 0
                  ? "100% Free - Instant direct enrollment"
                  : "Instant lifetime access upon payment"}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`font-display text-display font-bold ${
                  finalPrice === 0 ? "text-emerald-700" : "text-primary"
                }`}
              >
                ₹{finalPrice.toLocaleString()}
              </span>
              {finalPrice === 0 && (
                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                  Free Enrollment
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Coupon Code Section */}
        {appliedCoupon ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-emerald-700 text-[22px] shrink-0">
                task_alt
              </span>
              <div className="flex flex-col truncate">
                <span className="font-mono text-xs font-bold text-emerald-900 tracking-wider">
                  {appliedCoupon.code || appliedCoupon.coupon?.code}
                </span>
                <span className="text-[11px] text-emerald-700 leading-tight">
                  {appliedCoupon.message}
                </span>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs font-semibold text-stone-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-white/80 transition-colors shrink-0"
              title="Remove Coupon"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                  sell
                </span>
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  placeholder="Have a coupon code? (e.g. DSYHC)"
                  className="w-full pl-9 pr-3 py-2 text-xs uppercase font-mono tracking-wider bg-surface-container-low border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                />
              </div>
              <button
                type="submit"
                disabled={isValidating || !couponCodeInput.trim()}
                className="px-4 py-2 text-xs font-semibold bg-[#2D3536] text-white hover:bg-stone-800 disabled:opacity-40 rounded-xl transition-colors shadow-xs shrink-0"
              >
                {isValidating ? "Checking..." : "Apply"}
              </button>
            </form>
            {couponError && (
              <p className="text-[11px] text-red-600 font-medium px-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span>{couponError}</span>
              </p>
            )}
          </div>
        )}

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
                {course.modules?.length ? `${course.modules.length} Step-by-Step Modules + ` : ""}Hands-on Practice Projects
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
