import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { COURSES } from "@/data/courses";

export default function LandingPage() {
  const heroCourse =
    COURSES.find((c) => c.id === "performance-marketing") || COURSES[0];
  const heroLesson = heroCourse.modules[0]?.lessons[0];
  const heroVideoUrl = heroCourse.previewVideoUrl || heroLesson?.videoUrl || "";
  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col selection:bg-secondary-container selection:text-primary">
      {/* PUBLIC TOP HEADER */}
      <PublicHeader />

      {/* MAIN LANDING CONTENT */}
      <main className="relative bg-surface flex-grow">
        <div className="max-w-[1280px] mx-auto px-6 md:px-6 py-8 md:py-12">
          <div className="flex flex-col w-full">
            {/* Subtle Ambient Glow */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute -top-24 right-1/4 w-96 h-96 bg-secondary-container/40 rounded-full blur-3xl pointer-events-none -z-10" />
              <div className="absolute top-72 -left-20 w-80 h-80 bg-surface-container-high/60 rounded-full blur-2xl pointer-events-none -z-10" />

              {/* 1. HERO SECTION */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-2 pb-16">
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="self-start text-xs font-bold uppercase tracking-widest text-emerald-700">
                    <span>Practical Online Courses</span>
                  </div>

                  <h1 className="font-display tracking-tight font-bold max-w-xl text-3xl sm:text-4xl leading-tight text-slate-950">
                    Master Practical Digital Skills That Build{" "}
                    <span className="text-secondary underline decoration-secondary-fixed-dim decoration-4 underline-offset-8">
                      Real Careers
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                    Simple, beginner-friendly online courses designed for college students to master high-demand digital skills step-by-step.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm hover:shadow-md active:scale-[0.99] group"
                      href="/checkout/performance-marketing"
                    >
                      <span>Explore Digital Marketing</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </Link>

                    <Link
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-800 text-sm font-semibold border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all"
                      href="/courses"
                    >
                      <span className="material-symbols-outlined text-[18px] text-emerald-700">
                        explore
                      </span>
                      <span>View All Courses</span>
                    </Link>
                  </div>
                </div>

                {/* Hero Visual: Static Player Frame (Non-clickable, no certificate badge) */}
                <div className="lg:col-span-5 relative">
                  <div className="bg-white/95 rounded-3xl p-6 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] flex flex-col gap-4 relative z-10 border border-slate-200/80 ring-1 ring-slate-900/5 backdrop-blur-xl">
                    {/* Window Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-400" />
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="ml-2 text-xs font-semibold text-slate-700">
                          BSTORM Studio Player
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Self-Paced
                      </span>
                    </div>

                    {/* Static Video Simulation Frame - Not Clickable */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 select-none pointer-events-none shadow-inner">
                      <video
                        className="w-full h-full object-cover"
                        src={heroVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-between p-4 sm:p-5">
                        <div className="flex justify-between items-center">
                          <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 text-xs font-semibold shadow-xs">
                            {heroCourse.modules[0]?.moduleNumber} • Lesson {heroLesson?.lessonNumber || "1.1"}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium">
                            {heroLesson?.duration || "40m"} Preview
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                              {heroLesson?.title || heroCourse.title}
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                              Instructor: {heroCourse.instructor.name}
                            </p>
                          </div>
                          <div className="w-11 h-11 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-[24px]">
                              play_arrow
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Module Progress Row */}
                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-200/70">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 font-semibold">
                          Course Progress: Module 1
                        </span>
                        <span className="text-emerald-700 font-bold">65% Completed</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-600 w-[65%]" />
                      </div>
                      <div className="flex justify-between items-center text-slate-500 text-xs pt-0.5">
                        <span>Next: Google Ads Search Campaign</span>
                        <span className="font-semibold text-slate-900">In Progress</span>
                      </div>
                    </div>

                    {/* Course Delivery Info */}
                    <div className="flex items-center justify-between pt-1 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>Self-paced practical curriculum</span>
                      </div>
                      <span className="material-symbols-outlined text-emerald-700 text-[20px]">
                        verified
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* METHODOLOGY TICKER */}
              <section className="py-8 my-4 border-y border-[#E5E7EB] flex flex-wrap items-center justify-around gap-6 text-on-surface-variant font-label-md text-label-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    terminal
                  </span>
                  <span>100% Practical & Beginner-Friendly</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    support_agent
                  </span>
                  <span>Dedicated Doubt Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    folder_special
                  </span>
                  <span>Real Resume-Ready Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    badge
                  </span>
                  <span>Career & Placement Guidance</span>
                </div>
              </section>

              {/* 2. CATEGORY EXPLORATION (3 CORE PILLARS) */}
              <section className="py-16 flex flex-col gap-10" id="tracks">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-col gap-2 max-w-xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                      Career Tracks
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      Practical Skills for Beginners
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      No boring theory. Learn high-demand digital skills step-by-step with real-world practice.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Digital Marketing Available Now
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pillar 1: Performance Marketing (Available Now) */}
                  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border-2 border-secondary/30 relative">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                          Available Now
                        </span>
                        <span className="font-caption text-caption text-on-surface-variant font-medium">
                          14 Weeks
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-primary font-bold group-hover:text-secondary transition-colors">
                          Performance Marketing & Growth
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                          Run real Meta and Google ad campaigns, measure ROI, and learn how to generate real customers online.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          Meta Ads Manager
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          Google Ads
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          Campaign Budgeting
                        </span>
                      </div>
                    </div>
                    <div className="pt-6 mt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-on-surface-variant">
                          38 Lessons • 6 Projects
                        </span>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">
                          ₹2,499
                        </span>
                      </div>
                      <Link
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                        href="/checkout/performance-marketing"
                      >
                        <span>Enroll Now</span>
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Pillar 2: Content Creation (Upcoming Soon) */}
                  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between group border border-[#E5E7EB] opacity-90">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                          Upcoming Track
                        </span>
                        <span className="font-caption text-caption text-on-surface-variant font-medium">
                          10 Weeks
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-primary font-bold">
                          Content Creation & Video Editing
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                          Learn storytelling, video editing for Instagram Reels & YouTube Shorts, and viral content formats.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          Premiere Pro
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          Reels & Shorts
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          Storytelling
                        </span>
                      </div>
                    </div>
                    <div className="pt-6 mt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-on-surface-variant">
                          Launching Soon
                        </span>
                        <span className="font-label-md text-label-md font-semibold text-amber-700">
                          In Production
                        </span>
                      </div>
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold cursor-not-allowed opacity-80"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>

                  {/* Pillar 3: Web Engineering (Upcoming Soon) */}
                  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between group border border-[#E5E7EB] opacity-90">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                          Upcoming Track
                        </span>
                        <span className="font-caption text-caption text-on-surface-variant font-medium">
                          16 Weeks
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-primary font-bold">
                          Full Stack Web Development
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                          Build responsive websites and web apps from scratch using HTML, CSS, JavaScript, and React.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          React
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          JavaScript
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                          Web Projects
                        </span>
                      </div>
                    </div>
                    <div className="pt-6 mt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-on-surface-variant">
                          Launching Soon
                        </span>
                        <span className="font-label-md text-label-md font-semibold text-amber-700">
                          In Production
                        </span>
                      </div>
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold cursor-not-allowed opacity-80"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. WHY BSTORM */}
              <section
                className="py-14 my-4 bg-surface-container-low rounded-3xl p-8 md:p-10 border border-[#E5E7EB]/70"
                id="methodology"
              >
                <div className="max-w-xl flex flex-col gap-2 mb-10">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                    Why Learn With Us
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Simple, Practical & Beginner-Friendly
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Designed specifically for college students to learn practical skills without complicated jargon.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-2.5 border border-[#E5E7EB]/50">
                    <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">
                        precision_manufacturing
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">
                      100% Practical
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Learn by doing real exercises and hands-on projects instead of memorizing slides.
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-2.5 border border-[#E5E7EB]/50">
                    <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">
                        play_lesson
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">
                      Bite-Sized Lessons
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Short, easy-to-follow video modules that you can learn comfortably at your own pace.
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-2.5 border border-[#E5E7EB]/50">
                    <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">
                        folder_special
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">
                      Portfolio Projects
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Build real-world projects that you can showcase on your resume and LinkedIn profile.
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-2.5 border border-[#E5E7EB]/50">
                    <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">
                        support_agent
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">
                      Doubt Support
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Get help from mentors whenever you get stuck on any exercise or lesson.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. CURATED INTENSIVE PROGRAMS */}
              <section className="py-16 flex flex-col gap-10" id="curriculum">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                      Featured Programs
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      Courses & Upcoming Tracks
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Digital marketing is ready for enrollment. Web dev & content creation are in production.
                    </p>
                  </div>
                  <Link
                    className="font-label-md text-label-md text-secondary font-semibold hover:underline inline-flex items-center gap-1"
                    href="/courses"
                  >
                    <span>View All Tracks</span>
                    <span className="material-symbols-outlined text-[16px]">
                      chevron_right
                    </span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Course 1: Digital Marketing (AVAILABLE NOW) */}
                  <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between border-2 border-secondary/20">
                    <div className="flex flex-col">
                      <div className="relative w-full aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzNSmHQgtxzyYSwX_j_Nw9cV0CnIajPs_B5HzUav6bLjFKQ39SCrSfyXRlZPvP2XK2I2Eb4uYpj07_tF4eaM3ozOZ60nha1ZMzUoq_EPaek2WFJDHZ8lqpL0GvfGZ3AfHA4eGzxl0VkVFcMycfePkMn8M_4YipwWb-iG-BHv_QmQvAy5oipVZ_josPjXLI6Bqm75Akk3XehTsehoFOgouic4kqm7mBsNB_lIJZGyCU94rnvLoapBr8"
                          alt="Digital Marketing Desk"
                        />
                      </div>
                      <div className="p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                            Live Course • 14 Weeks
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Enrolling Now
                          </span>
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-primary font-bold leading-tight">
                            Performance Marketing & Growth
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                            Learn Meta ads, Google ads, conversion tracking, and campaign budgeting step-by-step.
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="w-8 h-8 rounded-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2ad_e9BhVNbU6J6JNT9eOCqYRYC-sNDJa8VVnxyeAkxgDdT2eW91YxvFabYsMoR8CrIW8WEq5yHZgKxzRMX2xrn1cr5bmEcqYh1VwX1pVE0KcMCJeWkFWe-g3GgKxBFAsLZXioa8bUC9y8ddajZ_5Mhu7JuoVW5t1bfzlYJH5nY9Y_Kd7RWHvE91zzpDTBalnu7mU6Xey5M7hbti1WJ9yUwmgCjMrLr88IRldu2numv0tDPHPxVgi"
                            alt="Pooja Venkatesh"
                          />
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-primary font-semibold">
                              Pooja Venkatesh
                            </span>
                            <span className="font-caption text-caption text-on-surface-variant">
                              Ex-Growth Lead
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 pt-0 flex items-center justify-between border-t border-[#E5E7EB] mt-3 pt-4">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-on-surface-variant line-through">
                          ₹7,999
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-sm text-headline-sm text-primary font-bold">
                            ₹2,499
                          </span>
                          <span className="font-caption text-caption text-secondary font-semibold">
                            68% off
                          </span>
                        </div>
                      </div>
                      <Link
                        className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                        href="/checkout/performance-marketing"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>

                  {/* Course 2: Content Creation (UPCOMING SOON) */}
                  <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between border border-[#E5E7EB] opacity-90">
                    <div className="flex flex-col">
                      <div className="relative w-full aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIgAUTxz_lmURMIDfE6NW0gn5w1beNTNliIZZpJBSzTsGnVLlnPKN4_7OPkeRFe6WSykNMaRRHKS20xdXxtxmxS1TwKbVt3MmjlofuAQ5VBB4Z8AVquFwR0iZt8-EPMxyF_WVDuh_tRM-uOvL0RO3ukpENrxAcsyeomFIw27hjvojEnLLQt4OOXP5aasDQvp3Res0lxHSNHsdv2sa8kZg0UYLSsUzDYtQI1ELLWDCxHFEW0sjrE51A"
                          alt="Commercial Video Setup"
                        />
                      </div>
                      <div className="p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            Upcoming Track • 10 Weeks
                          </span>
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            In Production
                          </span>
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-primary font-bold leading-tight">
                            Commercial Content & Media Design
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                            Learn scriptwriting, video shooting, and editing for Instagram Reels & YouTube Shorts.
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="w-8 h-8 rounded-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWvRzPv4umPBs-EZvIRGoiO7_2N1t_15NqxOWD5wWrI_IceYxRho3H7p8vfVQBOOXT5SHMWSq15FnnqPukqePIasecXudzsvlHBSixC7yeiLg1QOYRYQV3Il61fsUeK1OPoLA8rAusN5DHf3I_zm90PgiHC7zTNsRM1GMSeoNaBQtSOkCTmtY2g7ux2xDKUIYUZ4yEmrQIovxdUporwkIFkiBN7N7e67Lm96rfI8Hr0e4WoEOklEII"
                            alt="Devang Nair"
                          />
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-primary font-semibold">
                              Devang Nair
                            </span>
                            <span className="font-caption text-caption text-on-surface-variant">
                              Video Creator
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 pt-0 flex items-center justify-between border-t border-[#E5E7EB] mt-3 pt-4">
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">
                          ₹2,199
                        </span>
                        <span className="font-caption text-caption text-amber-700 font-semibold">
                          Coming Soon
                        </span>
                      </div>
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold cursor-not-allowed opacity-80"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>

                  {/* Course 3: Web Development (UPCOMING SOON) */}
                  <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between border border-[#E5E7EB] opacity-90">
                    <div className="flex flex-col">
                      <div className="relative w-full aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgFZ_j0XbOEi8BsaYJ7yne4y1Ws4qC8ARomJcHIhfYTT4S-wJgsugDQSA5udzqVEDdO5zESAhdQBXM2vYA-UjIZkULD4Emhv_V7fLDK696FEJdb26H_DkPE3ChIoA_dAdn15alAboS-22_0MCE3NmAUssuHyo5Mshb99p0zEQVrMMOvGrE8Su9_Ddr5CDNf-9WNVIGD-bpViPbEbvmPf2GSbP2jLZLwthzr-cxHqvG6vvxMc6wuDt1"
                          alt="Web Development Desk"
                        />
                      </div>
                      <div className="p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            Upcoming Track • 16 Weeks
                          </span>
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            In Production
                          </span>
                        </div>
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-primary font-bold leading-tight">
                            Full Stack Web Development
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                            Build modern responsive web applications from scratch with HTML, CSS, JavaScript, and React.
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="w-8 h-8 rounded-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYW3Xt4-aqRgLDACjqHOORlHkXcnwXK28rhSwcyLkp0xzFTuDfri1PIp-BydGpclIJvb7SfgFCddAgOzTSMryb8qs35QowHf5LTFnUkRKg6Qe_UI_sPchjYylQnh34fuMAzK_WOrPD0K9ACuJAfPokPDepokI3RmhYDC8XrpTmR3m9vcZffbhwJHpOQlWTRDw42jmRaO2Mbjnd-SzhzXFEBlgFORulymCvKfPSgh_V9pZYSGzV70xf"
                            alt="Ananya Chawla"
                          />
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-primary font-semibold">
                              Ananya Chawla
                            </span>
                            <span className="font-caption text-caption text-on-surface-variant">
                              Senior Engineer
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 pt-0 flex items-center justify-between border-t border-[#E5E7EB] mt-3 pt-4">
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">
                          ₹2,999
                        </span>
                        <span className="font-caption text-caption text-amber-700 font-semibold">
                          Coming Soon
                        </span>
                      </div>
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold cursor-not-allowed opacity-80"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. STUDENT TESTIMONIAL (NO CERTIFICATE PREVIEW CARD) */}
              <section className="py-10 my-4 bg-surface-container-lowest rounded-3xl p-8 md:p-10 border border-[#E5E7EB] shadow-sm">
                <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">
                      format_quote
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold leading-snug">
                    &ldquo;BSTORM taught me practical digital marketing with simple step-by-step guidance.&rdquo;
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    &ldquo;The lessons were so beginner-friendly. I learned how to set up real ad campaigns and analyze metrics, which helped me land my first marketing job.&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">
                      RN
                    </div>
                    <div className="text-left">
                      <div className="font-label-md text-label-md text-primary font-bold">
                        Rohan Nambiar
                      </div>
                      <div className="font-caption text-caption text-on-surface-variant">
                        Growth Analyst • BSTORM Student
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. READY TO LEVEL UP CTA BANNER */}
              <section className="py-14 my-8 rounded-3xl bg-primary text-on-primary p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col gap-3 max-w-xl relative z-10">
                  <span className="font-label-sm text-label-sm text-secondary-fixed font-semibold uppercase tracking-wider">
                    Start Learning
                  </span>
                  <h2 className="font-display text-display font-bold leading-tight">
                    Start Learning Digital Marketing Today
                  </h2>
                  <p className="font-body-md text-body-md text-inverse-on-surface">
                    Start mastering practical ad campaigns, analytics, and growth strategies with step-by-step guidance.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
                  <Link
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold hover:bg-on-secondary transition-all text-center shadow-lg"
                    href="/checkout/performance-marketing"
                  >
                    Enroll in Digital Marketing
                  </Link>
                  <Link
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-surface-container-highest/20 transition-all text-center border border-[#E5E7EB]/20"
                    href="/courses"
                  >
                    Browse All Courses
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* COMPREHENSIVE PUBLIC FOOTER */}
      <PublicFooter />
    </div>
  );
}
