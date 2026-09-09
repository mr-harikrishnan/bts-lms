import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Refund and Cancellation Policy | BSTORM Academy",
  description: "Transparent 7-day money-back guarantee and cancellation policy for courses on BSTORM by Brainstorm Creators.",
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] font-sans text-[#2D3536] min-h-screen flex flex-col selection:bg-[#E2ECE5] selection:text-[#2D3536]">
      <PublicHeader />

      <main className="flex-grow">
        {/* Header Strip */}
        <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-18 border-b border-stone-200/70 overflow-hidden">
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#F2EFE2]/60 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#98A897]/15 border border-[#98A897]/30 text-[#697C70] text-xs font-semibold uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#697C70]" />
                TRANSPARENCY &amp; GUARANTEE
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3536] tracking-tight leading-[1.18] mb-3">
                Refund &amp; Cancellation Policy
              </h1>
              <p className="text-sm text-stone-500 font-medium">
                Last Updated: January 15, 2026 • 7-Day Money-Back Guarantee
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Body */}
        <section className="py-14 sm:py-18">
          <div className="max-w-[960px] mx-auto px-5 sm:px-8">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 shadow-xs flex flex-col gap-10 text-stone-700 leading-relaxed text-sm sm:text-base">
              {/* Introduction & Guarantee Banner */}
              <div>
                <p className="mb-4">
                  At <strong>BSTORM</strong> (operated by <strong>Brainstorm Creators</strong>), we strive to deliver high-quality, practical digital skills education. We stand behind our curriculum and offer a transparent <strong>7-Day Money-Back Guarantee</strong> on all self-paced course enrollments to ensure complete student confidence.
                </p>

                <div className="p-6 rounded-2xl bg-[#98A897]/15 border border-[#98A897]/30 flex flex-col sm:flex-row items-start sm:items-center gap-4 my-4">
                  <div className="w-12 h-12 rounded-xl bg-[#697C70] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2D3536]">
                      100% Risk-Free 7-Day Trial Window
                    </h3>
                    <p className="text-sm text-stone-600 mt-0.5">
                      Explore your purchased course, watch the initial modules, and start exercises. If you find the course is not the right fit for your career goals, you can request a 100% full refund within 7 calendar days.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Eligibility Criteria */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  1. Refund Eligibility Criteria
                </h2>
                <p className="mb-3">
                  To prevent abuse while ensuring fairness for genuine learners, a full refund will be granted if all of the following conditions are met:
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                    <CheckCircle2 className="w-5 h-5 text-[#697C70] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2D3536] text-sm">7-Day Timeframe:</strong>
                      <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                        Your refund request must be submitted via email within <strong>7 calendar days</strong> from the exact date and time of successful transaction confirmation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                    <CheckCircle2 className="w-5 h-5 text-[#697C70] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2D3536] text-sm">Course Progress Under 25%:</strong>
                      <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                        You must have completed less than <strong>25% of total course lessons</strong> as recorded automatically by our learning management tracking system.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                    <CheckCircle2 className="w-5 h-5 text-[#697C70] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2D3536] text-sm">No Certificate Issued:</strong>
                      <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                        The course completion certificate must not have been claimed, generated, or downloaded.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Non-Refundable Situations */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  2. Non-Refundable Situations
                </h2>
                <p className="mb-3">Refunds cannot be issued under the following circumstances:</p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-stone-600">
                  <li>Requests submitted after the 7-day refund window has elapsed.</li>
                  <li>Courses where more than 25% of lessons have been marked as completed.</li>
                  <li>Accounts found in violation of our Terms of Service (e.g., account sharing, scraping video files, or plagiarism).</li>
                  <li>Special corporate grant enrollments or institutional bundle sponsorships marked as non-refundable.</li>
                </ul>
              </div>

              {/* 3. Course Cancellation Policy */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  3. Cancellation Policy
                </h2>
                <p className="mb-3">
                  3.1. <strong>Self-Paced Courses:</strong> Since our courses provide lifetime or extended access upon single payment, cancellation of enrollment revokes access to course lessons, capstones, and doubt assistance. If cancelled within 7 days meeting eligibility, a full refund is processed.
                </p>
                <p>
                  3.2. <strong>Account Cancellation:</strong> You may cancel your user account at any time by contacting our support team. Cancelling your account does not automatically initiate a refund for previously consumed courses outside the 7-day guarantee window.
                </p>
              </div>

              {/* 4. Refund Processing Timeline (Razorpay Requirement) */}
              <div className="p-6 rounded-2xl bg-[#FAF9F6] border-2 border-stone-200">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-[#697C70]" />
                  <h2 className="text-xl font-bold text-[#2D3536]">
                    4. Refund Processing Timeline
                  </h2>
                </div>
                <p className="mb-3 text-stone-700">
                  Once your refund request is received and verified by our academic audit desk:
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-stone-600 text-sm">
                  <li>
                    <strong>Review &amp; Approval:</strong> Refund verification is completed within <strong>24 to 48 business hours</strong>.
                  </li>
                  <li>
                    <strong>Gateway Credit Timeline:</strong> Once approved, the refund is initiated programmatically through our payment partner, <strong>Razorpay</strong>. The refunded amount will be credited back directly to your <strong>original payment method</strong> (bank account, debit card, credit card, or UPI VPA) within <strong>5 to 7 business days</strong>, depending on your bank&apos;s processing cycle.
                  </li>
                  <li>
                    <strong>No Hidden Charges:</strong> 100% of the course fee paid by you will be returned without deduction of gateway handling fees.
                  </li>
                </ul>
              </div>

              {/* 5. How to Request a Refund */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  5. How to Request a Refund
                </h2>
                <p className="mb-3">
                  To initiate a refund, please send an email from your registered BSTORM account email to:
                </p>
                <div className="p-5 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-sm">
                  <p className="font-bold text-[#2D3536]">Email: support@bstorm.edu</p>
                  <p className="text-stone-600 mt-1"><strong>Subject:</strong> Refund Request — [Course Title]</p>
                  <p className="text-stone-600 mt-2"><strong>Please include:</strong></p>
                  <ul className="list-disc pl-5 mt-1 text-stone-600 flex flex-col gap-1 text-xs sm:text-sm">
                    <li>Your Full Name and Registered Email Address</li>
                    <li>Course Name</li>
                    <li>Razorpay Payment ID / Order ID (found on your payment receipt)</li>
                    <li>Brief reason for cancellation (helps us improve our curriculum)</li>
                  </ul>
                </div>
              </div>

              {/* 6. Contact Information */}
              <div className="pt-6 border-t border-stone-100 flex flex-col gap-3">
                <h2 className="text-xl font-bold text-[#2D3536]">
                  6. Contact Academic &amp; Billing Support
                </h2>
                <p className="text-stone-600 text-sm">
                  If you have any questions about this Refund &amp; Cancellation Policy, please contact:
                </p>
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/70 text-xs sm:text-sm text-stone-600">
                  <p className="font-semibold text-[#2D3536]">Brainstorm Creators — BSTORM Support Desk</p>
                  <p className="mt-1">142/1, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004, India</p>
                  <p className="mt-1">Email: support@bstorm.edu | Telephone: +91 94884 56789</p>
                  <p className="mt-1 text-stone-400">Operating Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
