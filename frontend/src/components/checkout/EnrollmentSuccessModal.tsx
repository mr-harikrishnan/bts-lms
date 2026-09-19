"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Check, Copy, Sparkles, ArrowRight, BookOpen, CheckCircle2, ShieldCheck, PartyPopper } from "lucide-react";

export interface EnrollmentSuccessData {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  orderId?: string;
  receipt?: string;
  paymentId?: string;
  isFree?: boolean;
  couponCode?: string;
  amount?: number;
  userEmail?: string;
}

interface EnrollmentSuccessModalProps {
  isOpen: boolean;
  data: EnrollmentSuccessData;
  onClose?: () => void;
}

export const fireConfettiBlast = () => {
  try {
    // 1. Center explosion
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors: ["#006A4E", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"],
      disableForReducedMotion: true,
    });

    // 2. Left angled cannon
    setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.65 },
        colors: ["#10B981", "#34D399", "#FBBF24", "#60A5FA", "#F472B6"],
        disableForReducedMotion: true,
      });
    }, 200);

    // 3. Right angled cannon
    setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.65 },
        colors: ["#006A4E", "#10B981", "#F59E0B", "#3B82F6", "#A78BFA"],
        disableForReducedMotion: true,
      });
    }, 400);

    // 4. Star & golden shimmer finisher
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        decay: 0.92,
        scalar: 0.9,
        origin: { y: 0.45 },
        colors: ["#FFD700", "#FFA500", "#10B981", "#60A5FA"],
        disableForReducedMotion: true,
      });
    }, 700);
  } catch (err) {
    console.warn("Canvas confetti error:", err);
  }
};

export const EnrollmentSuccessModal: React.FC<EnrollmentSuccessModalProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fireConfettiBlast();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayRef = data.receipt || data.orderId || data.paymentId || `ORD-${Date.now().toString(36).toUpperCase()}`;

  const handleCopyRef = () => {
    if (!displayRef) return;
    navigator.clipboard.writeText(displayRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartLearning = () => {
    if (onClose) onClose();
    navigate(`/courses/${data.courseId}/learn`, { replace: true });
  };

  const handleViewMyCourses = () => {
    if (onClose) onClose();
    navigate("/my-courses");
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto animate-in zoom-in-95 duration-300">
        {/* Top Celebration Gradient Accent */}
        <div className="h-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 w-full" />

        {/* Header Ribbon / Burst Badge */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/70 shadow-sm">
              <PartyPopper className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md">
              <Sparkles className="w-4 h-4 fill-amber-950" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {data.isFree ? "100% Free Enrollment Activated" : "Payment & Enrollment Verified"}
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {data.isFree ? "🎉 You're Enrolled!" : "🎉 Payment Successful!"}
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 max-w-sm">
            Welcome to the course! Your enrollment has been verified and permanently stored in your account.
          </p>

          {/* Course Details Card */}
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mt-6 text-left flex items-center gap-3.5 shadow-sm">
            {data.courseThumbnail ? (
              <img
                src={data.courseThumbnail}
                alt={data.courseTitle}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-7 h-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Active Curriculum
              </span>
              <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">
                {data.courseTitle}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Full Lifetime Access • All Lessons Unlocked
              </p>
            </div>
          </div>

          {/* Database Storage & Audit Status Card */}
          <div className="w-full mt-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Database Storage &amp; Audit Trail
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Database Record</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Saved (`Enrollment` active)
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Order Reference</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-mono font-medium text-slate-800 truncate max-w-[120px]">
                    {displayRef}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    title="Copy Order Reference"
                    className="p-1 hover:bg-emerald-200/60 rounded text-emerald-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Payment Mode</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {data.isFree
                    ? `100% Free ${data.couponCode ? `(Coupon: ${data.couponCode})` : "Course"}`
                    : "Razorpay Secure Gateway"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Amount Charged</span>
                <span className="font-semibold text-emerald-800 mt-0.5 block">
                  {data.isFree || data.amount === 0 ? "₹0 (Free)" : `₹${data.amount?.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex flex-col gap-2.5 mt-6">
            <button
              type="button"
              onClick={handleStartLearning}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg shadow-emerald-700/20"
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleViewMyCourses}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-semibold text-xs sm:text-sm transition-all border border-slate-200"
              >
                Go to My Courses
              </button>

              <button
                type="button"
                onClick={fireConfettiBlast}
                title="Celebrate again!"
                className="px-4 py-3 rounded-xl bg-amber-100/70 hover:bg-amber-100 text-amber-900 font-semibold text-xs sm:text-sm transition-all border border-amber-200 flex items-center justify-center gap-1.5"
              >
                <span>🎉 Re-Pop!</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
