"use client";

import React, { useState, useEffect } from "react";
import { Course, User } from "@/types";
import { useRouter } from "next/navigation";
import { useBstorm } from "@/context/BstormContext";

interface PaymentGatewayProps {
  course: Course;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ course }) => {
  const router = useRouter();
  const { enrollCourse, user } = useBstorm();

  const [activeTab, setActiveTab] = useState<"upi" | "apps" | "card" | "netbanking">("upi");
  const [countdownSeconds, setCountdownSeconds] = useState(8 * 60 + 45); // 08:45
  const [useUniBilling, setUseUniBilling] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedApp, setSelectedApp] = useState("gpay");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCompletePayment = () => {
    setIsProcessing(true);
    // Simulate instant payment gateway success
    setTimeout(() => {
      enrollCourse(course.id);
      router.push(`/courses/${course.id}/learn`);
    }, 800);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-5 sm:p-8 flex flex-col gap-6 border border-[#E5E7EB]">
      {/* Header with 256-bit SSL Security Marker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div>
          <div className="font-caption text-caption text-secondary font-semibold uppercase tracking-wider mb-1">
            Step 2 of 2 • Secure Processing
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Select Payment Method
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-secondary font-label-sm text-label-sm">
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            encrypted
          </span>
          <span className="font-semibold text-primary">256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-low p-1.5 rounded-xl"
        role="tablist"
      >
        <button
          onClick={() => setActiveTab("upi")}
          type="button"
          className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg font-label-md text-label-md font-semibold transition-all duration-200 ${
            activeTab === "upi"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mb-1 ${
              activeTab === "upi" ? "text-secondary" : "text-outline"
            }`}
          >
            qr_code_scanner
          </span>
          <span>UPI / QR</span>
        </button>

        <button
          onClick={() => setActiveTab("apps")}
          type="button"
          className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg font-label-md text-label-md font-semibold transition-all duration-200 ${
            activeTab === "apps"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mb-1 ${
              activeTab === "apps" ? "text-secondary" : "text-outline"
            }`}
          >
            bolt
          </span>
          <span>Quick Apps</span>
        </button>

        <button
          onClick={() => setActiveTab("card")}
          type="button"
          className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg font-label-md text-label-md font-semibold transition-all duration-200 ${
            activeTab === "card"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mb-1 ${
              activeTab === "card" ? "text-secondary" : "text-outline"
            }`}
          >
            credit_card
          </span>
          <span>Cards</span>
        </button>

        <button
          onClick={() => setActiveTab("netbanking")}
          type="button"
          className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg font-label-md text-label-md font-semibold transition-all duration-200 ${
            activeTab === "netbanking"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] mb-1 ${
              activeTab === "netbanking" ? "text-secondary" : "text-outline"
            }`}
          >
            account_balance
          </span>
          <span>Net Banking</span>
        </button>
      </div>

      {/* TAB CONTENT 1: UPI & Dynamic QR Code */}
      {activeTab === "upi" && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-low p-5 sm:p-6 rounded-xl flex flex-col sm:flex-row items-center gap-6 border border-surface-container">
            {/* QR Box Canvas */}
            <div className="relative bg-surface-container-lowest p-3.5 rounded-xl shadow-md flex flex-col items-center shrink-0">
              <div className="w-36 h-36 bg-surface-container-lowest relative flex items-center justify-center p-1 rounded-lg">
                <svg
                  className="w-full h-full text-primary"
                  fill="currentColor"
                  viewBox="0 0 100 100"
                >
                  {/* Corner Frames */}
                  <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="12" y="12" width="14" height="14" rx="1" fill="currentColor" />
                  <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="74" y="12" width="14" height="14" rx="1" fill="currentColor" />
                  <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="12" y="74" width="14" height="14" rx="1" fill="currentColor" />
                  {/* Pattern clusters */}
                  <rect x="38" y="8" width="6" height="6" fill="currentColor" />
                  <rect x="48" y="8" width="8" height="6" fill="currentColor" />
                  <rect x="42" y="20" width="14" height="6" fill="currentColor" />
                  <rect x="38" y="32" width="8" height="8" fill="currentColor" />
                  <rect x="10" y="42" width="8" height="8" fill="currentColor" />
                  <rect x="24" y="46" width="6" height="6" fill="currentColor" />
                  <rect x="48" y="42" width="10" height="10" fill="currentColor" />
                  <rect x="66" y="38" width="8" height="8" fill="currentColor" />
                  <rect x="80" y="42" width="12" height="6" fill="currentColor" />
                  <rect x="72" y="54" width="6" height="12" fill="currentColor" />
                  <rect x="40" y="60" width="8" height="14" fill="currentColor" />
                  <rect x="56" y="64" width="12" height="6" fill="currentColor" />
                  <rect x="48" y="76" width="8" height="8" fill="currentColor" />
                  <rect x="62" y="78" width="14" height="6" fill="currentColor" />
                  <rect x="84" y="72" width="8" height="16" fill="currentColor" />
                </svg>
                {/* Centered Platform Badge */}
                <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shadow-sm">
                  <span
                    className="material-symbols-outlined text-[16px] text-on-secondary-fixed"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    school
                  </span>
                </div>
              </div>

              {/* Expiry Countdown */}
              <div className="mt-2.5 flex items-center gap-1.5 font-label-sm text-label-sm text-secondary font-semibold bg-secondary-container/50 px-3 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span>QR expires in {formatTimer(countdownSeconds)}</span>
              </div>
            </div>

            {/* QR Instructions */}
            <div className="flex flex-col gap-3 min-w-0 flex-1 text-center sm:text-left">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary leading-snug font-bold">
                  Scan with any verified UPI App
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Open GPay, PhonePe, Paytm, CRED, or BHIM to pay instantly without entering bank credentials.
                </p>
              </div>

              {/* UPI Brand Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                <span className="px-2.5 py-1 bg-surface-container-lowest rounded-md text-[11px] font-semibold text-primary shadow-sm border border-[#E5E7EB]">
                  Google Pay
                </span>
                <span className="px-2.5 py-1 bg-surface-container-lowest rounded-md text-[11px] font-semibold text-primary shadow-sm border border-[#E5E7EB]">
                  PhonePe
                </span>
                <span className="px-2.5 py-1 bg-surface-container-lowest rounded-md text-[11px] font-semibold text-primary shadow-sm border border-[#E5E7EB]">
                  Paytm UPI
                </span>
                <span className="px-2.5 py-1 bg-surface-container-lowest rounded-md text-[11px] font-semibold text-primary shadow-sm border border-[#E5E7EB]">
                  CRED Pay
                </span>
              </div>

              <div className="flex items-center gap-2 font-caption text-caption text-secondary">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Zero transaction surcharge & auto-enrollment activation</span>
              </div>
            </div>
          </div>

          {/* VPA Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-surface-container-highest" />
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Or enter Virtual Payment Address (VPA)
            </span>
            <div className="flex-1 h-[1px] bg-surface-container-highest" />
          </div>

          {/* Manual UPI Input Form */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                defaultValue="hari.p@oksbi"
                placeholder="e.g. yourname@okhdfcbank"
                className="w-full h-[46px] px-4 rounded-lg bg-surface-container-lowest text-primary font-body-md text-body-md focus:outline-none shadow-sm border border-[#E5E7EB] focus:border-secondary transition-all"
              />
              <span className="material-symbols-outlined absolute right-3 top-3 text-[20px] text-secondary">
                check_circle
              </span>
            </div>
            <button
              type="button"
              onClick={handleCompletePayment}
              className="h-[46px] px-6 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary/90 transition-all shadow-sm shrink-0 flex items-center justify-center gap-2 font-semibold"
            >
              <span>Verify & Pay</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Quick Mobile Apps */}
      {activeTab === "apps" && (
        <div className="flex flex-col gap-4">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Authorize directly using your installed smartphone wallet. A push notification will be triggered immediately.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              onClick={() => setSelectedApp("gpay")}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all shadow-sm border ${
                selectedApp === "gpay"
                  ? "bg-secondary-container/40 border-secondary"
                  : "bg-surface-container-low border-[#E5E7EB] hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center font-bold text-primary text-xs shadow-sm">
                  GP
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary font-semibold">
                    Google Pay
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Instant Intent
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="quick_app"
                checked={selectedApp === "gpay"}
                onChange={() => setSelectedApp("gpay")}
                className="w-4 h-4 accent-secondary"
              />
            </label>

            <label
              onClick={() => setSelectedApp("phonepe")}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all shadow-sm border ${
                selectedApp === "phonepe"
                  ? "bg-secondary-container/40 border-secondary"
                  : "bg-surface-container-low border-[#E5E7EB] hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center font-bold text-primary text-xs shadow-sm">
                  PP
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary font-semibold">
                    PhonePe
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Direct UPI
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="quick_app"
                checked={selectedApp === "phonepe"}
                onChange={() => setSelectedApp("phonepe")}
                className="w-4 h-4 accent-secondary"
              />
            </label>

            <label
              onClick={() => setSelectedApp("paytm")}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all shadow-sm border ${
                selectedApp === "paytm"
                  ? "bg-secondary-container/40 border-secondary"
                  : "bg-surface-container-low border-[#E5E7EB] hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center font-bold text-primary text-xs shadow-sm">
                  PT
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary font-semibold">
                    Paytm Wallet
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    UPI & Postpaid
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="quick_app"
                checked={selectedApp === "paytm"}
                onChange={() => setSelectedApp("paytm")}
                className="w-4 h-4 accent-secondary"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Credit / Debit Cards */}
      {activeTab === "card" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1">
            <span className="font-label-md text-label-md text-primary font-semibold">
              Card Details
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-container-low font-caption text-caption font-bold text-on-surface-variant border border-[#E5E7EB]">
                VISA
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container-low font-caption text-caption font-bold text-on-surface-variant border border-[#E5E7EB]">
                Mastercard
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container-low font-caption text-caption font-bold text-on-surface-variant border border-[#E5E7EB]">
                RuPay
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  defaultValue="4532 9012 3456 8821"
                  className="w-full h-[44px] px-4 rounded-lg bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary"
                />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-secondary text-[20px]">
                  credit_card
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="text"
                  defaultValue="09 / 28"
                  className="w-full h-[44px] px-4 rounded-lg bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5">
                  Card CVV / CVC
                </label>
                <input
                  type="password"
                  maxLength={4}
                  defaultValue="782"
                  className="w-full h-[44px] px-4 rounded-lg bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5">
                Cardholder Name
              </label>
              <input
                type="text"
                defaultValue={user.name ? `${user.name.toUpperCase()} V` : "HARI PRASATH V"}
                className="w-full h-[44px] px-4 rounded-lg bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Net Banking */}
      {activeTab === "netbanking" && (
        <div className="flex flex-col gap-4">
          <span className="font-label-md text-label-md text-primary font-semibold">
            Popular Indian Banking Portals
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"].map(
              (bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => setSelectedBank(bank)}
                  className={`p-3 rounded-xl text-center transition-colors border ${
                    selectedBank === bank
                      ? "bg-secondary-container/50 border-secondary"
                      : "bg-surface-container-low border-[#E5E7EB] hover:bg-surface-container"
                  }`}
                >
                  <span className="font-label-md text-label-md font-bold text-primary block">
                    {bank}
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Direct Net
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Billing Info Toggle Checkbox */}
      <div className="p-4 bg-surface-container-low rounded-xl flex items-start gap-3 border border-surface-container">
        <input
          id="university-billing-check"
          type="checkbox"
          checked={useUniBilling}
          onChange={(e) => setUseUniBilling(e.target.checked)}
          className="mt-1 w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
        />
        <label
          htmlFor="university-billing-check"
          className="flex flex-col cursor-pointer"
        >
          <span className="font-label-md text-label-md text-primary font-semibold">
            Use registered university billing details
          </span>
          <span className="font-caption text-caption text-on-surface-variant mt-0.5">
            {user.college || "PSG College of Technology"}, Coimbatore, {user.state || "Tamil Nadu"} (Roll: {user.rollNumber || "21BBA048"})
          </span>
        </label>
      </div>

      {/* Primary CTA Button */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleCompletePayment}
          className="w-full py-4 px-6 rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-md active:scale-[0.99] font-bold"
        >
          {isProcessing ? (
            <>
              <span className="material-symbols-outlined text-[22px] animate-spin">
                sync
              </span>
              <span>Confirming Enrollment...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px]">lock</span>
              <span>Complete Payment • ₹{course.price.toLocaleString()}</span>
            </>
          )}
        </button>
        <div className="text-center">
          <span className="font-caption text-caption text-outline">
            By completing payment, you agree to BSTORM Academic Honor Code and Terms of Learning.
          </span>
        </div>
      </div>

      {/* Verified Trust Badges Footer */}
      <div className="grid grid-cols-3 gap-2 pt-4 bg-surface-container-low/60 p-3.5 rounded-xl border border-surface-container">
        <div className="flex items-center gap-2 justify-center text-center">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            verified_user
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            100% Secure Checkout
          </span>
        </div>
        <div className="flex items-center gap-2 justify-center text-center">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            verified
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            7-Day Refund Window
          </span>
        </div>
        <div className="flex items-center gap-2 justify-center text-center">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            school
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            Academic Grant Vetted
          </span>
        </div>
      </div>
    </div>
  );
};
