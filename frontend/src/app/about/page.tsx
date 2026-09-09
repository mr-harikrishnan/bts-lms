import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  CheckCircle2,
  Compass,
  Layers,
  GraduationCap,
  ArrowRight,
  Building2,
  Target,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "About Us | BSTORM Academy",
  description: "Learn about BSTORM by Brainstorm Creators — practical, career-focused digital skills training for college students and beginners.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF9F6] font-sans text-[#2D3536] min-h-screen flex flex-col selection:bg-[#E2ECE5] selection:text-[#2D3536]">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-stone-200/70 overflow-hidden">
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#F2EFE2]/60 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#98A897]/15 border border-[#98A897]/30 text-[#697C70] text-xs font-semibold uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#697C70]" />
                ABOUT BSTORM
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D3536] tracking-tight leading-[1.18] mb-5">
                Bridging Academic Learning and <span className="text-[#697C70]">Real-World Industry Skills.</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
                BSTORM is an educational initiative by <strong>Brainstorm Creators</strong>, created to equip college students and early-career professionals with practical, job-ready digital capabilities through structured, project-driven learning tracks.
              </p>
            </div>
          </div>
        </section>

        {/* Core Mission & Vision */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#98A897]/20 text-[#697C70] flex items-center justify-center mb-4">
                    <Target className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-[#2D3536] mb-3">Our Mission</h2>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    To democratize access to industry-grade training in Performance Marketing, Content Creation, and Modern Web Development. We believe every ambitious student deserves hands-on guidance, realistic capstone projects, and clear career trajectories without astronomical tuition costs.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#98A897]/20 text-[#697C70] flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-[#2D3536] mb-3">The BSTORM Philosophy</h2>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Learning happens by building, not passive watching. Every course curriculum is carefully designed around real industry deliverables: client pitches, content strategies, full-stack applications, and verifiable portfolio pieces.
                  </p>
                </div>
              </div>

              {/* Company & Organization Details */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/80 p-8 shadow-xs flex flex-col gap-6">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2D3536]">Brainstorm Creators</h3>
                    <p className="text-xs text-stone-500">Registered Educational &amp; Digital Services Provider</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-sm text-stone-600">
                  <p className="leading-relaxed">
                    Operating out of Tamil Nadu, India, <strong>Brainstorm Creators</strong> manages the BSTORM learning management system, course creation, curriculum reviews, student support operations, and corporate partnerships.
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                      <span className="text-2xl font-bold text-[#2D3536] block">1,200+</span>
                      <span className="text-xs text-stone-500 font-medium">Active Learners</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                      <span className="text-2xl font-bold text-[#2D3536] block">100%</span>
                      <span className="text-xs text-stone-500 font-medium">Practical Capstones</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex flex-col gap-2 text-xs text-stone-500">
                    <div>
                      <strong className="text-stone-700">Operational Headquarters:</strong> Coimbatore, Tamil Nadu, India.
                    </div>
                    <div>
                      <strong className="text-stone-700">Official Contact:</strong> contact@bstorm.edu
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars Section */}
        <section className="py-16 bg-white border-y border-stone-200/80">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#697C70] block mb-2">
                OUR METHODOLOGY
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3536] tracking-tight mb-3">
                Why Students Trust BSTORM
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200/70">
                <CheckCircle2 className="w-6 h-6 text-[#697C70] mb-3" />
                <h3 className="text-base font-bold text-[#2D3536] mb-2">Hands-on Sprints</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  No empty theory. Each lesson couples concept explanations with immediately actionable work files and code repositories.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200/70">
                <Compass className="w-6 h-6 text-[#697C70] mb-3" />
                <h3 className="text-base font-bold text-[#2D3536] mb-2">Guided Roadmaps</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Clear step-by-step progress tracking from beginner setup through production-ready implementations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200/70">
                <Layers className="w-6 h-6 text-[#697C70] mb-3" />
                <h3 className="text-base font-bold text-[#2D3536] mb-2">Verifiable Capstones</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Every track culminates in a full-fledged capstone project reviewed against real workplace evaluation benchmarks.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200/70">
                <GraduationCap className="w-6 h-6 text-[#697C70] mb-3" />
                <h3 className="text-base font-bold text-[#2D3536] mb-2">Industry Credentials</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Earn digital completion certificates verifiable with unique credentials for your resume and LinkedIn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-14 sm:py-18">
          <div className="max-w-[1240px] mx-auto px-5 sm:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3536] mb-3">
              Have Questions or Need Guidance?
            </h2>
            <p className="text-stone-600 max-w-lg mx-auto mb-6 text-sm sm:text-base">
              Our academic advising team is available Monday through Saturday to answer questions about tracks, enrollment, and student assistance.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D3536] text-white text-sm font-semibold hover:bg-stone-800 transition-colors shadow-sm"
              >
                <span>Contact Academic Support</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-stone-800 text-sm font-semibold border border-stone-300 hover:bg-stone-50 transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
