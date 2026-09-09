import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata = {
  title: "Terms and Conditions | BSTORM Academy",
  description: "Terms and Conditions governing enrollment, course access, and payments on BSTORM by Brainstorm Creators.",
};

export default function TermsPage() {
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
                LEGAL AGREEMENT
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3536] tracking-tight leading-[1.18] mb-3">
                Terms and Conditions
              </h1>
              <p className="text-sm text-stone-500 font-medium">
                Last Updated: January 15, 2026 • Effective Immediately
              </p>
            </div>
          </div>
        </section>

        {/* Main Document Content */}
        <section className="py-14 sm:py-18">
          <div className="max-w-[960px] mx-auto px-5 sm:px-8">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 shadow-xs flex flex-col gap-10 text-stone-700 leading-relaxed text-sm sm:text-base">
              {/* Introduction */}
              <div>
                <p className="mb-4">
                  Welcome to <strong>BSTORM</strong> (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), an online educational learning management service owned and operated by <strong>Brainstorm Creators</strong>, having its registered operational office at 142/1, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004, India.
                </p>
                <p>
                  By accessing, browsing, registering for an account, or purchasing any course on BSTORM, you (&quot;User&quot;, &quot;Student&quot;, &quot;Learner&quot;, or &quot;you&quot;) agree to be bound by these Terms and Conditions, our{" "}
                  <Link href="/privacy" className="text-[#697C70] font-semibold underline hover:text-[#2D3536]">
                    Privacy Policy
                  </Link>
                  , and our{" "}
                  <Link href="/refund-policy" className="text-[#697C70] font-semibold underline hover:text-[#2D3536]">
                    Refund &amp; Cancellation Policy
                  </Link>
                  . If you do not agree to these terms, you must not use our website or purchase our educational services.
                </p>
              </div>

              {/* 1. Eligibility & Account Registration */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  1. Eligibility &amp; User Accounts
                </h2>
                <p className="mb-3">
                  1.1. You must be at least 16 years of age or possess legal parental/guardian consent to enroll in courses and execute transactions on this platform.
                </p>
                <p className="mb-3">
                  1.2. When registering an account, you agree to provide true, accurate, current, and complete information, including your legal name, functional email address, and geographical region.
                </p>
                <p>
                  1.3. You are solely responsible for safeguarding your login credentials (email and password). Any activity conducted through your authenticated account is presumed to have been authorized by you. You must immediately notify our support desk at{" "}
                  <a href="mailto:support@bstorm.edu" className="text-[#697C70] underline">
                    support@bstorm.edu
                  </a>{" "}
                  of any unauthorized use.
                </p>
              </div>

              {/* 2. Course Access & Intellectual Property */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  2. Course Access &amp; Intellectual Property
                </h2>
                <p className="mb-3">
                  2.1. <strong>Limited License:</strong> Upon verified payment confirmation, Brainstorm Creators grants you a non-exclusive, non-transferable, revocable, personal license to view the streaming video lessons, download provided course project assets, and complete evaluations.
                </p>
                <p className="mb-3">
                  2.2. <strong>Ownership:</strong> All course content, including but not limited to instructional videos, curriculum roadmaps, project briefs, assessment rubrics, branding graphics, logos, and platform software code, is the exclusive intellectual property of Brainstorm Creators.
                </p>
                <p>
                  2.3. <strong>Prohibitions:</strong> You may not record, scrape, rip, re-upload, distribute, resell, license, broadcast, or publicly display any video materials or learning files without prior written consent from Brainstorm Creators. Account sharing among multiple learners is strictly prohibited and constitutes grounds for immediate account suspension without refund.
                </p>
              </div>

              {/* 3. Pricing, Payments & Razorpay Gateway */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  3. Pricing, Payments &amp; Gateway Transactions
                </h2>
                <p className="mb-3">
                  3.1. <strong>Currency:</strong> All course prices are quoted and charged in Indian Rupees (INR, ₹).
                </p>
                <p className="mb-3">
                  3.2. <strong>Secure Payment Processing:</strong> Online transactions are handled through our authorized payment aggregator partner, <strong>Razorpay</strong> (Razorpay Software Private Limited). When you initiate payment, your transaction is processed across encrypted 256-bit SSL connections conforming to PCI-DSS Level 1 compliance standards.
                </p>
                <p className="mb-3">
                  3.3. <strong>Card/UPI Security:</strong> Brainstorm Creators never receives, stores, or processes your confidential credit card numbers, debit card details, CVVs, or UPI PINs. All financial credential exchanges occur strictly within Razorpay&apos;s secured processing iframe.
                </p>
                <p>
                  3.4. <strong>Order Confirmation:</strong> Course access is unlocked strictly following programmatic cryptographic HMAC signature verification returned by Razorpay to our backend servers.
                </p>
              </div>

              {/* 4. Refund & Cancellation */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  4. Refund &amp; Cancellation Policy
                </h2>
                <p>
                  We provide a transparent <strong>7-day money-back guarantee</strong> for our paid self-paced courses, subject to terms specified in our dedicated{" "}
                  <Link href="/refund-policy" className="text-[#697C70] font-semibold underline hover:text-[#2D3536]">
                    Refund and Cancellation Policy
                  </Link>
                  . Approved refunds are credited directly back to the original source of payment within 5 to 7 business days via Razorpay.
                </p>
              </div>

              {/* 5. Academic Integrity & Certificates */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  5. Academic Integrity &amp; Certification
                </h2>
                <p className="mb-3">
                  5.1. Course completion certificates are awarded to students who successfully finish all curriculum lessons, submit genuine capstone project work, and achieve passing criteria on assessments.
                </p>
                <p>
                  5.2. Brainstorm Creators reserves the right to revoke any certificate if it is determined that submitted work was plagiarized, forged, or completed via automated exploitation.
                </p>
              </div>

              {/* 6. Limitation of Liability */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  6. Disclaimers &amp; Limitation of Liability
                </h2>
                <p className="mb-3">
                  6.1. The educational content, project examples, and career guidance provided on BSTORM are intended for skill development. We do not guarantee specific employment offers, salary figures, or promotional placements upon completion.
                </p>
                <p>
                  6.2. To the maximum extent permitted under applicable law, Brainstorm Creators shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from platform downtime, service interruptions, or third-party network issues. Our total liability for any claim arising out of your course purchase shall not exceed the actual amount paid by you for the applicable course.
                </p>
              </div>

              {/* 7. Governing Law & Jurisdiction */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  7. Governing Law &amp; Dispute Resolution
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, controversy, or claim arising out of or relating to these terms or your use of BSTORM shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>Coimbatore, Tamil Nadu, India</strong>.
                </p>
              </div>

              {/* 8. Contact Information */}
              <div className="pt-6 border-t border-stone-100">
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  8. Contact &amp; Grievance Redressal
                </h2>
                <p className="mb-2">
                  For questions regarding these Terms and Conditions or institutional licensing, please contact:
                </p>
                <div className="p-5 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-sm">
                  <p className="font-semibold text-[#2D3536]">Brainstorm Creators (BSTORM Academy)</p>
                  <p className="text-stone-600 mt-1">142/1, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004, India</p>
                  <p className="text-stone-600 mt-1">
                    Email:{" "}
                    <a href="mailto:support@bstorm.edu" className="text-[#697C70] underline">
                      support@bstorm.edu
                    </a>{" "}
                    /{" "}
                    <a href="mailto:contact@bstorm.edu" className="text-[#697C70] underline">
                      contact@bstorm.edu
                    </a>
                  </p>
                  <p className="text-stone-600 mt-1">Telephone: +91 94884 56789 (Mon–Sat, 9 AM – 6 PM IST)</p>
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
