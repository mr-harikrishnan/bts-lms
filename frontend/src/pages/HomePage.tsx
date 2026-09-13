import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  BookOpen,
  Layers,
  Sparkles,
  Award,
  Clock,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Zap,
  Check,
  Compass,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const HomePage: React.FC = () => {
  return (
    <div className="bg-[#FAF9F6] font-sans text-[#2D3536] min-h-screen flex flex-col selection:bg-[#E2ECE5] selection:text-[#2D3536]">
      {/* 1. PUBLIC HEADER */}
      <PublicHeader />

      <main className="flex-grow">
        {/* 2. HERO SECTION — LMS PLATFORM FOCUS */}
        <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-18 border-b border-stone-200/70 overflow-hidden">
          {/* Subtle warm accent ambient glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F2EFE2]/70 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#B3C9D6]/15 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: LMS Value Proposition */}
              <div className="lg:col-span-6 flex flex-col items-start text-left">
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#98A897]/15 border border-[#98A897]/30 text-[#697C70] text-xs font-semibold uppercase tracking-widest mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#697C70]" />
                  <span>MODERN LEARNING MANAGEMENT SYSTEM</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#2D3536] tracking-tight leading-[1.14] mb-5">
                  Learn. Grow. Achieve.
                  <span className="block text-[#697C70] mt-1 font-semibold text-2xl sm:text-3xl lg:text-[38px]">
                    Your Complete Learning Experience.
                  </span>
                </h1>

                {/* Supporting Text */}
                <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl mb-8">
                  A modern learning platform that brings structured courses, high-definition video lessons, hands-on assessments, and verified credentials together in one simple, intuitive interface.
                </p>

                {/* CTA Group */}
                <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto mb-8">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D3536] text-white text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm hover:shadow-md group"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-[#2D3536] text-sm font-semibold border border-stone-300/80 hover:bg-stone-50 transition-colors shadow-2xs"
                  >
                    Explore Learning
                  </Link>
                </div>

                {/* Platform Trust & Capabilities Strip */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-500 pt-3 border-t border-stone-200/60 w-full">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#697C70]" />
                    <span>Self-Paced Video Lessons</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#697C70]" />
                    <span>Automatic Progress Bookmarks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#697C70]" />
                    <span>Authenticated Digital Certificates</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform Visual & Creator Framing */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end items-end relative -mb-12 sm:-mb-16 lg:-mb-18 pt-4 lg:pt-0">
                <div className="relative w-full max-w-[380px] sm:max-w-[460px] md:max-w-[500px] lg:max-w-[560px] xl:max-w-[620px] flex justify-center lg:justify-end">
                  <img
                    src="/diwakar.png"
                    alt="DLABS Learning Management Platform"
                    className="w-full h-auto object-contain max-h-[500px] sm:max-h-[560px] lg:max-h-[620px] xl:max-h-[680px] select-none [mask-image:linear-gradient(to_bottom,black_65%,transparent_98%)] [-webkit-mask-image:linear-gradient(to_bottom,black_65%,transparent_98%)]"
                    loading="eager"
                  />
                  {/* Soft bottom blend overlay matching section background */}
                  <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/70 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. VALUE PROPOSITION STRIP */}
        <section className="border-b border-stone-200/80 bg-white/70 backdrop-blur-xs py-7">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-stone-200/80">
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2D3536] tracking-tight">
                  100%
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5">
                  Self-Paced Learning
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2D3536] tracking-tight">
                  HD
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5">
                  Distraction-Free Video Lessons
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2D3536] tracking-tight">
                  Real-Time
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5">
                  Progress Tracking
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2D3536] tracking-tight">
                  Online
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5">
                  Verifiable Credentials
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. EVERYTHING YOU NEED TO LEARN (LMS CAPABILITIES) */}
        <section className="py-16 sm:py-20" id="curriculum">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            {/* Section Header */}
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                LMS Platform Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3536] tracking-tight mb-3">
                Everything You Need to Learn
              </h2>
              <p className="text-base text-stone-600 leading-relaxed">
                Our learning management system gives students a focused, distraction-free environment equipped with every tool needed to build practical competency.
              </p>
            </div>

            {/* 4 Core LMS Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: Structured Courses */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#98A897]/15 text-[#697C70] flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2D3536] mb-2">
                    Structured Courses
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">
                    Lessons are logically partitioned into structured modules that build progressively from fundamentals to advanced execution.
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-stone-500">
                  <Check className="w-3.5 h-3.5 text-[#697C70]" />
                  <span>Sequential module progression</span>
                </div>
              </div>

              {/* Feature 2: High-Quality Video Lessons */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#98A897]/15 text-[#697C70] flex items-center justify-center mb-4">
                    <Play className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2D3536] mb-2">
                    Video Lessons
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">
                    Watch bite-sized, high-definition streaming lessons with variable playback speeds, full-screen mode, and zero external ads.
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-stone-500">
                  <Check className="w-3.5 h-3.5 text-[#697C70]" />
                  <span>Distraction-free player</span>
                </div>
              </div>

              {/* Feature 3: Quizzes and Assessments */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#98A897]/15 text-[#697C70] flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2D3536] mb-2">
                    Quizzes &amp; Assessments
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">
                    Evaluate your comprehension with knowledge checks and comprehensive final assessments that validate mastery before certificate issuance.
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-stone-500">
                  <Check className="w-3.5 h-3.5 text-[#697C70]" />
                  <span>Instant retention feedback</span>
                </div>
              </div>

              {/* Feature 4: Learning Materials & Resources */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#98A897]/15 text-[#697C70] flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2D3536] mb-2">
                    Learning Materials
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">
                    Direct access to supplementary exercises, code repositories, downloadable guides, and project templates for every lesson.
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-stone-500">
                  <Check className="w-3.5 h-3.5 text-[#697C70]" />
                  <span>Ready-to-use work assets</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LEARN AT YOUR OWN PACE */}
        <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80" id="self-paced">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Descriptive Benefits */}
              <div className="lg:col-span-6 flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                  Flexible Education
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3536] tracking-tight mb-4">
                  Learn at Your Own Pace, On Your Own Schedule
                </h2>
                <p className="text-base text-stone-600 leading-relaxed mb-6">
                  Education shouldn&apos;t be rigid or stressful. DLABS is built for self-paced learning that seamlessly fits your college or work schedule.
                </p>

                {/* 4 Feature Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#98A897]/20 text-[#697C70] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2D3536]">Progress Tracking</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Automatic completion meters and visual checks show your exact milestone progress.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#98A897]/20 text-[#697C70] flex items-center justify-center shrink-0 mt-0.5">
                      <Play className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2D3536]">Continue Where You Left</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Return anytime and resume your video lessons precisely at the last watched second.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#98A897]/20 text-[#697C70] flex items-center justify-center shrink-0 mt-0.5">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2D3536]">Step-by-Step Flow</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Bite-sized lesson chunks prevent cognitive fatigue and make retention effortless.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#98A897]/20 text-[#697C70] flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2D3536]">Self-Paced Access</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        No mandatory deadlines or countdown clocks. Learn fast or review thoroughly as needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform UI Preview Card */}
              <div className="lg:col-span-6 bg-[#FAF9F6] rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-200/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    <span className="text-xs font-mono text-stone-500 ml-2">dlabs.edu/learning</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#98A897]/20 text-[#697C70]">
                    In Progress
                  </span>
                </div>

                {/* Progress Visual */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-stone-200/70">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#2D3536] mb-1.5">
                      <span>Overall Learning Milestone</span>
                      <span className="text-[#697C70]">78% Complete</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#697C70] h-full rounded-full transition-all" style={{ width: "78%" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200/70 text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#697C70]" />
                        <span className="font-semibold text-[#2D3536]">Module 01: Core Architecture</span>
                      </div>
                      <span className="text-stone-400">Completed</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#E2ECE5]/50 border border-[#98A897]/40 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Play className="w-4 h-4 text-[#697C70]" />
                        <span className="font-bold text-[#2D3536]">Module 02: Hands-On Project Build</span>
                      </div>
                      <span className="font-semibold text-[#697C70]">Active Lesson</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200/70 text-xs text-stone-400">
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full border border-stone-300" />
                        <span>Module 03: Final Skill Assessment</span>
                      </div>
                      <span>Locked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. A SMARTER LEARNING EXPERIENCE */}
        <section className="py-16 sm:py-20" id="experience">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                Platform Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3536] tracking-tight mb-3">
                A Smarter Learning Experience
              </h2>
              <p className="text-base text-stone-600">
                Engineered with modern web standards to provide a lightweight, distraction-free environment centered entirely on student success.
              </p>
            </div>

            {/* 3 Pillar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Simple Dashboard */}
              <div className="bg-white rounded-2xl p-7 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#98A897]/15 text-[#697C70] flex items-center justify-center mb-5">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2D3536] mb-3">
                    Simple Learner Dashboard
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    View active course enrollments, hours logged, completed lessons, and earned certifications in a unified, uncluttered student portal.
                  </p>
                </div>
                <div className="pt-5 border-t border-stone-100 mt-6 text-xs text-stone-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#697C70]" />
                  <span>One-click access to all active courses</span>
                </div>
              </div>

              {/* Card 2: Organized Learning Content */}
              <div className="bg-white rounded-2xl p-7 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#98A897]/15 text-[#697C70] flex items-center justify-center mb-5">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2D3536] mb-3">
                    Organized Learning Content
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Syllabi are clearly partitioned into modules, lessons, and assignments with clear visual progress meters and instant navigation.
                  </p>
                </div>
                <div className="pt-5 border-t border-stone-100 mt-6 text-xs text-stone-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#697C70]" />
                  <span>Intuitive lesson sidebar navigation</span>
                </div>
              </div>

              {/* Card 3: Personalized Learning Journey */}
              <div className="bg-white rounded-2xl p-7 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#98A897]/15 text-[#697C70] flex items-center justify-center mb-5">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2D3536] mb-3">
                    Personalized Journey &amp; Credentials
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Track your growth from day one. Finish courses and final evaluations to unlock verifiable certificates to add to resumes and LinkedIn.
                  </p>
                </div>
                <div className="pt-5 border-t border-stone-100 mt-6 text-xs text-stone-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#697C70]" />
                  <span>Cryptographically verified credentials</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CREATOR / OWNER SECTION — SECONDARY CREDIBILITY */}
        <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80" id="vision">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="max-w-4xl mx-auto bg-[#FAF9F6] rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#697C70] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#697C70]">
                    About The Platform
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#2D3536] tracking-tight">
                    Built with a Vision for Better Learning
                  </h3>
                </div>
              </div>

              <p className="text-base text-stone-600 leading-relaxed mb-6">
                DLABS was founded by <strong>Diwakar</strong> and the team at <strong>Brainstorm Creators</strong> with a clear vision: to make digital learning simpler, structured, and accessible for college students and beginners. Traditional learning often suffers from confusing interfaces, scattered materials, and theoretical clutter. We built this LMS platform from the ground up to give learners a clean, distraction-free environment that prioritizes hands-on practical skill development.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200/70 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#697C70]" />
                  <span>Student-first platform architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#697C70]" />
                  <span>Practical curriculum benchmarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#697C70]" />
                  <span>Dedicated student support desk</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. HOW IT WORKS (THE 5-STEP LEARNING FLOW) */}
        <section className="py-16 sm:py-20" id="why-dlabs">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                Platform Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3536] tracking-tight mb-3">
                Your Learning Journey
              </h2>
              <p className="text-base text-stone-600">
                A structured, step-by-step process from course enrollment to verifiable certification.
              </p>
            </div>

            {/* 5-Step Linear Journey */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#697C70] px-2 py-0.5 rounded bg-[#98A897]/15">
                    01
                  </span>
                  <BookOpen className="w-4 h-4 text-stone-400" />
                </div>
                <h4 className="text-base font-bold text-[#2D3536] mb-1.5">
                  Choose a Course
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Select a skill curriculum aligned with your goals from our course catalog.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#697C70] px-2 py-0.5 rounded bg-[#98A897]/15">
                    02
                  </span>
                  <Play className="w-4 h-4 text-stone-400" />
                </div>
                <h4 className="text-base font-bold text-[#2D3536] mb-1.5">
                  Stream Lessons
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Watch structured, bite-sized lessons with distraction-free playback controls.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#697C70] px-2 py-0.5 rounded bg-[#98A897]/15">
                    03
                  </span>
                  <Layers className="w-4 h-4 text-stone-400" />
                </div>
                <h4 className="text-base font-bold text-[#2D3536] mb-1.5">
                  Practice Hands-on
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Work through exercises and build practical projects using attached resources.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#697C70] px-2 py-0.5 rounded bg-[#98A897]/15">
                    04
                  </span>
                  <Sparkles className="w-4 h-4 text-stone-400" />
                </div>
                <h4 className="text-base font-bold text-[#2D3536] mb-1.5">
                  Take the Assessment
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Validate your comprehension and demonstrate subject mastery via final evaluations.
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#697C70] px-2 py-0.5 rounded bg-[#98A897]/15">
                    05
                  </span>
                  <Award className="w-4 h-4 text-stone-400" />
                </div>
                <h4 className="text-base font-bold text-[#2D3536] mb-1.5">
                  Earn Certificate
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Receive an authenticated credential you can verify online and share anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FINAL CALL TO ACTION */}
        <section className="py-16 sm:py-20 bg-[#2D3536] text-white">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#98A897] block mb-3">
                Ready to begin?
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Experience a Smarter Way to Learn.
              </h2>
              <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8 max-w-xl">
                Create your learner account today and explore structured courses designed for real-world digital skills.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#2D3536] text-sm font-semibold hover:bg-[#F2EFE2] transition-colors shadow-md group"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-transparent border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  <span>Browse Courses</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 10. PUBLIC FOOTER */}
      <PublicFooter />
    </div>
  );
};
