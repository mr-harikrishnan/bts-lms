"use client";

import React, { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Course Inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Presence validation
    if (!name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }
    if (!message.trim()) {
      setFormError("Please enter your query or message.");
      return;
    }

    // 2. Format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate submission delay for instant user feedback
      await new Promise((res) => setTimeout(res, 800));
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      console.error("Contact Form submission error:", err);
      setFormError("Unable to submit query at this moment. Please email contact@bstorm.edu directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                CONTACT &amp; SUPPORT
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3536] tracking-tight leading-[1.18] mb-4">
                We are here to help. <span className="text-[#697C70]">Reach out anytime.</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
                Whether you have questions about our course tracks, payment verification, student grant options, or technical queries, our support team is available.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info & Interactive Form */}
        <section className="py-14 sm:py-20">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Direct Business Contact Details */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#2D3536]">Brainstorm Creators</h2>
                      <p className="text-xs text-stone-500">BSTORM Online Learning Platform</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#98A897]/20 text-[#697C70] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-sm">
                      <strong className="text-[#2D3536] font-semibold">Registered Office Address</strong>
                      <p className="text-stone-600 mt-1 leading-relaxed">
                        142/1, Avinashi Road, Peelamedu,<br />
                        Coimbatore, Tamil Nadu 641004,<br />
                        India.
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#98A897]/20 text-[#697C70] flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-sm">
                      <strong className="text-[#2D3536] font-semibold">Official Support Email</strong>
                      <a
                        href="mailto:support@bstorm.edu"
                        className="text-stone-600 hover:text-[#697C70] transition-colors mt-1"
                      >
                        support@bstorm.edu
                      </a>
                      <a
                        href="mailto:contact@bstorm.edu"
                        className="text-stone-500 hover:text-[#697C70] transition-colors text-xs mt-0.5"
                      >
                        contact@bstorm.edu
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#98A897]/20 text-[#697C70] flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-sm">
                      <strong className="text-[#2D3536] font-semibold">Telephone &amp; WhatsApp</strong>
                      <a
                        href="tel:+919488456789"
                        className="text-stone-600 hover:text-[#697C70] transition-colors mt-1"
                      >
                        +91 94884 56789
                      </a>
                      <span className="text-xs text-stone-400 mt-0.5">Direct student inquiry desk</span>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-3.5 pt-2 border-t border-stone-100">
                    <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-sm">
                      <strong className="text-[#2D3536] font-semibold">Operating Hours</strong>
                      <span className="text-stone-600 mt-1">
                        Monday – Saturday: 9:00 AM – 6:00 PM IST
                      </span>
                      <span className="text-xs text-stone-400 mt-0.5">
                        Sunday: Closed (Inquiries answered on next business day)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resolution Guarantee */}
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/70 text-xs text-stone-600 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#697C70] shrink-0" />
                  <span>
                    Typical email response time is under <strong>24 business hours</strong>.
                  </span>
                </div>
              </div>

              {/* Right Column: Contact Inquiry Form */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-bold text-[#2D3536] mb-1">Send Us a Message</h2>
                <p className="text-sm text-stone-500 mb-6">
                  Fill out the form below and an academic advisor will get back to you promptly.
                </p>

                {isSubmitted ? (
                  <div className="p-8 rounded-xl bg-[#98A897]/15 border border-[#98A897]/30 text-center flex flex-col items-center gap-3 my-4">
                    <CheckCircle2 className="w-12 h-12 text-[#697C70]" />
                    <h3 className="text-lg font-bold text-[#2D3536]">Message Received</h3>
                    <p className="text-sm text-stone-600 max-w-md">
                      Thank you for contacting BSTORM Academy. We have received your query and will reply to your email address within 24 to 48 business hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-2 text-xs font-semibold text-[#697C70] hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {formError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Hari Prasath"
                          className="w-full h-11 px-3.5 rounded-xl bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm border border-stone-200 focus:border-[#697C70] focus:ring-4 focus:ring-[#98A897]/15 focus:outline-none transition-all placeholder:text-stone-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hari@gmail.com"
                          className="w-full h-11 px-3.5 rounded-xl bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm border border-stone-200 focus:border-[#697C70] focus:ring-4 focus:ring-[#98A897]/15 focus:outline-none transition-all placeholder:text-stone-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full h-11 px-3.5 rounded-xl bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm border border-stone-200 focus:border-[#697C70] focus:ring-4 focus:ring-[#98A897]/15 focus:outline-none transition-all placeholder:text-stone-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                          Subject *
                        </label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm border border-stone-200 focus:border-[#697C70] focus:ring-4 focus:ring-[#98A897]/15 focus:outline-none transition-all"
                        >
                          <option value="Course Inquiry">Course Curriculum Inquiry</option>
                          <option value="Payment & Billing">Payment &amp; Billing Assistance</option>
                          <option value="Refund Request">Refund &amp; Cancellation Request</option>
                          <option value="Academic Support">Academic Doubt Support</option>
                          <option value="Corporate / College Grant">College / Corporate Grant</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Your Query / Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please describe how we can help you with your learning track or payment..."
                        className="w-full p-3.5 rounded-xl bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm border border-stone-200 focus:border-[#697C70] focus:ring-4 focus:ring-[#98A897]/15 focus:outline-none transition-all placeholder:text-stone-400 resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 h-11 rounded-xl bg-[#2D3536] hover:bg-stone-800 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Sending Message...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Query</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
