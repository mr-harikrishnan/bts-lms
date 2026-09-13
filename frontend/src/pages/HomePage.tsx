import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Compass,
  Layers,
  GraduationCap,
  BookOpen,
  Sparkles,
  Award,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { FeaturedCoursesGrid } from "@/components/courses/FeaturedCoursesGrid";

export const HomePage: React.FC = () => {
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

          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
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
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D3536] text-white text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm hover:shadow-md group"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-[#2D3536] text-sm font-semibold border border-stone-300/80 hover:bg-stone-50 transition-colors shadow-2xs"
                  >
                    Explore Courses
                  </Link>
                </div>
              </div>

              {/* Right Column: Founder & Lead Instructor Visual */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end items-end relative -mb-12 sm:-mb-16 lg:-mb-18 pt-4 lg:pt-0">
                <div className="relative w-full max-w-[380px] sm:max-w-[460px] md:max-w-[500px] lg:max-w-[560px] xl:max-w-[620px] flex justify-center lg:justify-end">
                  <img
                    src="/diwakar.png"
                    alt="Diwakar - Founder, DLABS Academy"
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

        {/* 3. TRUST / VALUE STRIP */}
        <section className="border-b border-stone-200/80 bg-white/70 backdrop-blur-xs py-7">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-stone-200/80">
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2D3536] tracking-tight">
                  100%
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5">
                  Hands-on Practical
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2D3536] tracking-tight">
                  12+
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5">
                  Real Industry Projects
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
              <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2D3536] tracking-tight">
                  Direct
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5">
                  College-to-Career Fit
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURED COURSES SECTION */}
        <section className="py-16 sm:py-20" id="courses">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
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

            {/* Dynamic 3 Primary Categories Grid */}
            <FeaturedCoursesGrid />
          </div>
        </section>

        {/* 5. WHY DLABS SECTION */}
        <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80" id="why-dlabs">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            {/* Section Header */}
            <div className="max-w-2xl mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                Why DLABS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3536] tracking-tight mb-3">
                Learn by Doing, Not Just Watching.
              </h2>
              <p className="text-base text-stone-600 leading-relaxed">
                Traditional tutorials focus on memorizing concepts. DLABS focuses on building real-world practical ability.
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
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
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
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
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
                to="/signup"
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
};
