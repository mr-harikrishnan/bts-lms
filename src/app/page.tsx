import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Circle,
  Compass,
  Layers,
  GraduationCap,
  BookOpen,
  Sparkles,
  Award,
  Video,
  Code2,
  TrendingUp,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function LandingPage() {
  return (
    <div className="bg-[#FAF9F6] font-sans text-[#2D3536] min-h-screen flex flex-col selection:bg-[#E2ECE5] selection:text-[#2D3536]">
      {/* 1. PUBLIC HEADER */}
      <PublicHeader />

      <main className="flex-grow">
        {/* 2. HERO SECTION */}
        <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-18 border-b border-stone-200/70 overflow-hidden">
          {/* Subtle warm accent ambient glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F2EFE2]/60 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#B3C9D6]/15 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-6 flex flex-col items-start text-left">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#98A897]/15 border border-[#98A897]/30 text-[#697C70] text-xs font-semibold uppercase tracking-widest mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#697C70]" />
                  PRACTICAL DIGITAL SKILLS
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#2D3536] tracking-tight leading-[1.15] mb-5">
                  Master the Digital Skills That Build{" "}
                  <span className="text-[#697C70]">Real Careers.</span>
                </h1>

                {/* Supporting Text */}
                <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl mb-8">
                  Learn practical, job-ready skills in Digital Marketing, Content
                  Creation, and Web Development through structured, beginner-friendly
                  courses.
                </p>

                {/* CTA Group */}
                <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D3536] text-white text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm hover:shadow-md group"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/courses"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-[#2D3536] text-sm font-semibold border border-stone-300/80 hover:bg-stone-50 transition-colors shadow-2xs"
                  >
                    Explore Courses
                  </Link>
                </div>
              </div>

              {/* Right Column: Realistic EdTech Course Visual */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="w-full max-w-[520px] bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-[0_12px_36px_-8px_rgba(45,53,54,0.08)]">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#697C70]" />
                      <span className="text-xs font-semibold text-[#697C70] uppercase tracking-wider">
                        Digital Marketing
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      Self-Paced Track
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-lg font-bold text-[#2D3536] leading-snug mb-3">
                    Performance Marketing Fundamentals
                  </h3>

                  {/* Course Video Preview Thumbnail */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-stone-900 mb-4 group">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE_ClTyI4HQkfnWMUuJxQpwls3wLIx0mj4JZ8fiPSfoLBvbRgUKoawKPwSI4IS4p_fDXkek49N1TfE1Hp12znkeYosvQdR4HopfmRJx0OvtSyCBIw3zxWZTnrd23umvfpNdbUsw4KfzSFwaAN3xStg70zfIcvhUFTFntXUi-3r6LWU8i8wJwxKLmDk7Syk-MPNbSQs3scrURXI1gkjDE4161MOAXtUiWEuf3lLeqWQdNzRQ8LZBJqx"
                      alt="Performance Marketing Workspace"
                      fill
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="object-cover opacity-90 group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2D3536]/80 via-transparent to-black/20" />

                    {/* Lesson Overlay Info */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="self-start px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-[#2D3536]">
                        Lesson 1.2 • 40m
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <span className="text-[11px] text-stone-300 font-medium uppercase tracking-wide block">
                            Now Playing
                          </span>
                          <span className="text-sm font-semibold text-white leading-tight block">
                            Understanding Digital Marketing Funnels
                          </span>
                        </div>

                        {/* Subtle Play Button */}
                        <div className="w-10 h-10 rounded-full bg-white text-[#2D3536] flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Progress Section */}
                  <div className="bg-[#FAF9F6] rounded-xl p-3.5 border border-stone-200/70 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-stone-700">Course Progress</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500 font-medium">4 / 12 lessons</span>
                        <span className="text-[#697C70]">• 33% Complete</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                      <div className="h-full rounded-full bg-[#697C70] w-[33%]" />
                    </div>
                  </div>

                  {/* Realistic Learning Continuum */}
                  <div className="flex items-center justify-between px-1 pt-1 text-xs text-stone-600 font-medium border-t border-stone-100">
                    <div className="flex items-center gap-1.5 text-[#697C70] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Lessons</span>
                    </div>
                    <span className="text-stone-300">→</span>
                    <div className="flex items-center gap-1.5 text-[#697C70] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Projects</span>
                    </div>
                    <span className="text-stone-300">→</span>
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <Circle className="w-3.5 h-3.5" />
                      <span>Final Assessment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TRUST / VALUE STRIP */}
        <section className="bg-white border-b border-stone-200/80 py-6">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-stone-200">
              <div className="flex items-center gap-3 pt-3 md:pt-0 sm:px-3 first:pt-0 first:pl-0">
                <div className="w-8 h-8 rounded-lg bg-[#98A897]/15 text-[#697C70] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D3536] leading-tight">
                    100% Practical
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Hands-on exercises</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 md:pt-0 sm:px-4">
                <div className="w-8 h-8 rounded-lg bg-[#98A897]/15 text-[#697C70] flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D3536] leading-tight">
                    Beginner Friendly
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Clear step-by-step guidance</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 md:pt-0 sm:px-4">
                <div className="w-8 h-8 rounded-lg bg-[#98A897]/15 text-[#697C70] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D3536] leading-tight">
                    Real Projects
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Work you can showcase</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 md:pt-0 sm:px-4 last:pr-0">
                <div className="w-8 h-8 rounded-lg bg-[#98A897]/15 text-[#697C70] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D3536] leading-tight">
                    Career Focused
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Skills employers need</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COURSE CATEGORIES SECTION */}
        <section className="py-16 sm:py-20" id="curriculum">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            {/* Section Header */}
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                Course Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3536] tracking-tight mb-3">
                Learn Skills That Move Your Career Forward
              </h2>
              <p className="text-base text-stone-600 leading-relaxed">
                Start with practical courses designed around real-world digital skills.
              </p>
            </div>

            {/* Exactly 3 Primary Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Category 1: Digital Marketing */}
              <article className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzNSmHQgtxzyYSwX_j_Nw9cV0CnIajPs_B5HzUav6bLjFKQ39SCrSfyXRlZPvP2XK2I2Eb4uYpj07_tF4eaM3ozOZ60nha1ZMzUoq_EPaek2WFJDHZ8lqpL0GvfGZ3AfHA4eGzxl0VkVFcMycfePkMn8M_4YipwWb-iG-BHv_QmQvAy5oipVZ_josPjXLI6Bqm75Akk3XehTsehoFOgouic4kqm7mBsNB_lIJZGyCU94rnvLoapBr8"
                    alt="Digital Marketing Analytics Dashboard"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-xs font-semibold text-[#697C70] shadow-xs flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Digital Marketing</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#2D3536] group-hover:text-[#697C70] transition-colors mb-2 leading-snug">
                      Performance Marketing & Growth Systems
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                      Master Meta Ads Manager, Google Search ads, conversion tracking, and campaign budgeting to drive real ROI.
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 font-medium py-3 border-y border-stone-100">
                      <span>10 Lessons • 6 Projects</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span>14 Weeks</span>
                    </div>
                  </div>

                  <div className="pt-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-400 block">Tuition</span>
                      <span className="text-lg font-bold text-[#2D3536]">₹2,499</span>
                    </div>
                    <Link
                      href="/checkout/performance-marketing"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D3536] text-white text-xs sm:text-sm font-medium hover:bg-stone-800 transition-colors shadow-xs"
                    >
                      <span>Enroll Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>

              {/* Category 2: Content Creation */}
              <article className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIgAUTxz_lmURMIDfE6NW0gn5w1beNTNliIZZpJBSzTsGnVLlnPKN4_7OPkeRFe6WSykNMaRRHKS20xdXxtxmxS1TwKbVt3MmjlofuAQ5VBB4Z8AVquFwR0iZt8-EPMxyF_WVDuh_tRM-uOvL0RO3ukpENrxAcsyeomFIw27hjvojEnLLQt4OOXP5aasDQvp3Res0lxHSNHsdv2sa8kZg0UYLSsUzDYtQI1ELLWDCxHFEW0sjrE51A"
                    alt="Content Creation & Video Production Studio"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-xs font-semibold text-[#697C70] shadow-xs flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" />
                    <span>Content Creation</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#2D3536] group-hover:text-[#697C70] transition-colors mb-2 leading-snug">
                      Commercial Video & Social Storytelling
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                      Learn camera lighting, video shooting, Premiere Pro & DaVinci editing, and short-form storytelling for YouTube & Reels.
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 font-medium py-3 border-y border-stone-100">
                      <span>8 Lessons • 4 Projects</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span>10 Weeks</span>
                    </div>
                  </div>

                  <div className="pt-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-400 block">Tuition</span>
                      <span className="text-lg font-bold text-[#2D3536]">₹2,199</span>
                    </div>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-100 text-[#2D3536] text-xs sm:text-sm font-medium hover:bg-stone-200 transition-colors"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>

              {/* Category 3: Web Development */}
              <article className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgFZ_j0XbOEi8BsaYJ7yne4y1Ws4qC8ARomJcHIhfYTT4S-wJgsugDQSA5udzqVEDdO5zESAhdQBXM2vYA-UjIZkULD4Emhv_V7fLDK696FEJdb26H_DkPE3ChIoA_dAdn15alAboS-22_0MCE3NmAUssuHyo5Mshb99p0zEQVrMMOvGrE8Su9_Ddr5CDNf-9WNVIGD-bpViPbEbvmPf2GSbP2jLZLwthzr-cxHqvG6vvxMc6wuDt1"
                    alt="Web Development Code Workspace"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-xs font-semibold text-[#697C70] shadow-xs flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Web Development</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#2D3536] group-hover:text-[#697C70] transition-colors mb-2 leading-snug">
                      Full-Stack Web Development
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                      Build modern web applications from scratch with HTML, CSS, JavaScript, React, Node.js, and database fundamentals.
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 font-medium py-3 border-y border-stone-100">
                      <span>12 Lessons • 5 Projects</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span>16 Weeks</span>
                    </div>
                  </div>

                  <div className="pt-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-400 block">Tuition</span>
                      <span className="text-lg font-bold text-[#2D3536]">₹2,999</span>
                    </div>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-100 text-[#2D3536] text-xs sm:text-sm font-medium hover:bg-stone-200 transition-colors"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 5. WHY BSTORM SECTION */}
        <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80" id="why-bstorm">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            {/* Section Header */}
            <div className="max-w-2xl mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                Why BSTORM
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3536] tracking-tight mb-3">
                Learn by Doing, Not Just Watching.
              </h2>
              <p className="text-base text-stone-600 leading-relaxed">
                Traditional tutorials focus on memorizing concepts. BSTORM focuses on building real-world practical ability.
              </p>
            </div>

            {/* 4 Strong Principles — Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Principle 1 */}
              <div className="flex flex-col border-l-2 border-[#697C70] pl-5 py-1">
                <span className="text-xs font-mono font-semibold text-[#697C70] mb-2 block">
                  01 / CURRICULUM
                </span>
                <h3 className="text-lg font-bold text-[#2D3536] mb-2">
                  Practical Curriculum
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Learn skills through real-world examples, actual industry tools, and step-by-step case studies without confusing jargon.
                </p>
              </div>

              {/* Principle 2 */}
              <div className="flex flex-col border-l-2 border-[#697C70] pl-5 py-1">
                <span className="text-xs font-mono font-semibold text-[#697C70] mb-2 block">
                  02 / STRUCTURE
                </span>
                <h3 className="text-lg font-bold text-[#2D3536] mb-2">
                  Structured Learning
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Follow a clear step-by-step learning path. Every lesson builds systematically on the previous one to avoid overwhelm.
                </p>
              </div>

              {/* Principle 3 */}
              <div className="flex flex-col border-l-2 border-[#697C70] pl-5 py-1">
                <span className="text-xs font-mono font-semibold text-[#697C70] mb-2 block">
                  03 / PORTFOLIO
                </span>
                <h3 className="text-lg font-bold text-[#2D3536] mb-2">
                  Projects That Matter
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Build practical work you can actually show. Walk away with tangible assets to highlight on your resume and LinkedIn.
                </p>
              </div>

              {/* Principle 4 */}
              <div className="flex flex-col border-l-2 border-[#697C70] pl-5 py-1">
                <span className="text-xs font-mono font-semibold text-[#697C70] mb-2 block">
                  04 / CREDENTIAL
                </span>
                <h3 className="text-lg font-bold text-[#2D3536] mb-2">
                  Completion Certificate
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Earn a professional certificate after completing the course and assessment, verifiable online anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. LEARNING FLOW SECTION */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3536] tracking-tight mb-3">
                Your Learning Journey
              </h2>
              <p className="text-base text-stone-600">
                A structured, outcome-driven process from start to certification.
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
                  Pick a skill track aligned with your career goals and interest.
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
                  Learn Through Videos
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Watch structured, bite-sized lessons taught by industry practitioners.
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
                  Complete Lessons
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Practice hands-on exercises and build real resume-ready projects.
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
                  Take the Final Test
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Evaluate your retention and demonstrate mastery through a final assessment.
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
                  Earn Your Certificate
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Receive an authenticated credential you can share on LinkedIn and resumes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CALL TO ACTION */}
        <section className="py-16 sm:py-20 bg-[#2D3536] text-white">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#98A897] block mb-3">
                Ready to begin?
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Start Building Skills That Matter.
              </h2>
              <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8 max-w-xl">
                Choose your learning path and start building practical digital skills today.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#2D3536] text-sm font-semibold hover:bg-[#F2EFE2] transition-colors shadow-md group"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. PUBLIC FOOTER */}
      <PublicFooter />
    </div>
  );
}
