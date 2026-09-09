import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata = {
  title: "Privacy Policy | BSTORM Academy",
  description: "Privacy Policy explaining data collection, protection standards, and zero-payment storage guarantee on BSTORM by Brainstorm Creators.",
};

export default function PrivacyPage() {
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
                DATA PROTECTION
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3536] tracking-tight leading-[1.18] mb-3">
                Privacy Policy
              </h1>
              <p className="text-sm text-stone-500 font-medium">
                Last Updated: January 15, 2026 • Effective Immediately
              </p>
            </div>
          </div>
        </section>

        {/* Main Privacy Policy Body */}
        <section className="py-14 sm:py-18">
          <div className="max-w-[960px] mx-auto px-5 sm:px-8">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 shadow-xs flex flex-col gap-10 text-stone-700 leading-relaxed text-sm sm:text-base">
              {/* Introduction */}
              <div>
                <p className="mb-4">
                  <strong>Brainstorm Creators</strong> (&quot;BSTORM&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting the personal privacy and data security of learners, educators, and visitors who interact with our learning management platform at <strong>bstorm.edu</strong>.
                </p>
                <p>
                  This Privacy Policy outlines the types of information we collect, how it is used, how transactions are securely processed, and the measures we employ to safeguard your personal data in compliance with the Information Technology Act, 2000 and applicable data protection regulations in India.
                </p>
              </div>

              {/* 1. Information We Collect */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  1. Information We Collect
                </h2>
                <p className="mb-3">
                  We collect information that you directly provide when registering an account, enrolling in courses, submitting assignments, or contacting customer support:
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-stone-600">
                  <li>
                    <strong>Account Information:</strong> Full legal name, email address, chosen password (stored as high-security salted bcrypt hashes), phone number, college/institution name, and state/region.
                  </li>
                  <li>
                    <strong>Academic &amp; Learning Records:</strong> Course progress metrics, video completion timestamps, capstone project submissions, quiz/assessment scores, and generated completion certificates.
                  </li>
                  <li>
                    <strong>Inquiries &amp; Communications:</strong> Messages, support inquiries, and feedback submitted via our contact forms or email channels.
                  </li>
                </ul>
              </div>

              {/* 2. Critical Payment Data Storage Disclosure */}
              <div className="p-6 rounded-2xl bg-[#FAF9F6] border-2 border-[#98A897]/40">
                <h2 className="text-xl font-bold text-[#2D3536] mb-2 flex items-center gap-2">
                  <span>2. Payment Information Handling &amp; Security</span>
                </h2>
                <p className="mb-3 text-stone-700">
                  <strong>Important Guarantee:</strong> BSTORM and Brainstorm Creators <strong>DO NOT</strong> collect, store, view, or process sensitive credit card numbers, debit card details, CVV security codes, net banking credentials, or UPI PINs on our servers.
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  All payment transactions are handled directly through <strong>Razorpay Software Private Limited</strong>, an RBI-authorized payment aggregator adhering to the highest global payment industry standard: <strong>PCI-DSS (Payment Card Industry Data Security Standard) Level 1</strong>. When you make a purchase, your financial data is transmitted directly to Razorpay over an encrypted 256-bit SSL connection. We retain only non-sensitive order metadata returned by Razorpay (e.g., Razorpay Order ID, Razorpay Payment ID, transaction timestamp, amount in INR, and payment status) for audit and course access provisioning.
                </p>
              </div>

              {/* 3. How We Use Your Information */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  3. How We Use Collected Information
                </h2>
                <p className="mb-3">Your information is used strictly for legitimate educational purposes:</p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-stone-600">
                  <li>To grant verified access to purchased courses and video curriculum.</li>
                  <li>To track learning milestones and issue verifiable completion certificates.</li>
                  <li>To send transactional emails (order confirmations, enrollment receipts, password reset links).</li>
                  <li>To prevent unauthorized access, account sharing, and fraudulent transactions.</li>
                  <li>To provide personalized doubt resolution and academic feedback on project work.</li>
                </ul>
              </div>

              {/* 4. Third-Party Service Providers */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  4. Third-Party Service Providers
                </h2>
                <p className="mb-3">
                  We never sell, rent, or trade your personal data to advertisers or unrelated third parties. We share data only with trusted infrastructure providers essential to our operations:
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-stone-600">
                  <li>
                    <strong>Razorpay:</strong> To process secure payment transactions and verify payment signatures.
                  </li>
                  <li>
                    <strong>EmailJS / Transactional Mail:</strong> To deliver system-generated emails including password resets and course enrollment confirmations.
                  </li>
                  <li>
                    <strong>Cloud Infrastructure:</strong> High-security, encrypted cloud servers hosting our database and application runtime.
                  </li>
                </ul>
              </div>

              {/* 5. Cookies & Local Storage */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  5. Cookies &amp; Authentication Storage
                </h2>
                <p>
                  We use essential session cookies and browser local storage strictly to keep you authenticated during your learning session, maintain course playback progress, and remember interface preferences. We do not use intrusive third-party cross-site tracking cookies.
                </p>
              </div>

              {/* 6. Data Security & Retention */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  6. Data Security Measures
                </h2>
                <p className="mb-3">
                  We implement robust technical and organizational safeguards to protect your personal data against unauthorized access, loss, alteration, or disclosure:
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-stone-600">
                  <li>All traffic is encrypted in transit using 256-bit Transport Layer Security (TLS/SSL).</li>
                  <li>Passkeys and passwords are encrypted using multi-round salted bcrypt hashing.</li>
                  <li>Cryptographic HMAC SHA-256 signature verification protects all financial callbacks.</li>
                  <li>Server-side rate limiting safeguards against brute-force authentication attacks.</li>
                </ul>
              </div>

              {/* 7. Student Rights */}
              <div>
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  7. Your Data Rights
                </h2>
                <p className="mb-3">
                  You have the right to access, review, update, or request the deletion of your personal account information at any time. You may update your profile details directly from the Student Settings page or request an account deletion by emailing{" "}
                  <a href="mailto:support@bstorm.edu" className="text-[#697C70] underline">
                    support@bstorm.edu
                  </a>
                  .
                </p>
              </div>

              {/* 8. Grievance Officer & Contact */}
              <div className="pt-6 border-t border-stone-100">
                <h2 className="text-xl font-bold text-[#2D3536] mb-3">
                  8. Grievance Officer &amp; Contact Details
                </h2>
                <p className="mb-3">
                  In accordance with the Information Technology Act, 2000 and rules made thereunder, the contact details of the Grievance Officer for data protection matters are:
                </p>
                <div className="p-5 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-sm">
                  <p className="font-semibold text-[#2D3536]">Grievance Officer — Brainstorm Creators</p>
                  <p className="text-stone-600 mt-1">142/1, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004, India</p>
                  <p className="text-stone-600 mt-1">
                    Email:{" "}
                    <a href="mailto:privacy@bstorm.edu" className="text-[#697C70] underline">
                      privacy@bstorm.edu
                    </a>{" "}
                    /{" "}
                    <a href="mailto:contact@bstorm.edu" className="text-[#697C70] underline">
                      contact@bstorm.edu
                    </a>
                  </p>
                  <p className="text-stone-600 mt-1">Telephone: +91 94884 56789</p>
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
