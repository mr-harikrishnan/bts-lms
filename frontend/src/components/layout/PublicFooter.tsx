import React from "react";
import Link from "next/link";
import Image from "next/image";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-stone-200 bg-white pt-12 pb-10">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-100">
          {/* Brand Col */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 p-1">
                <Image
                  alt="BSTORM Logo"
                  className="object-contain"
                  src="/logo.png"
                  width={24}
                  height={24}
                />
              </div>
              <span className="font-sans text-lg font-bold text-[#2D3536] tracking-tight">
                BSTORM
              </span>
            </Link>
            <p className="text-sm text-stone-500 max-w-sm leading-relaxed">
              Practical Digital Skills. Structured, beginner-friendly online courses designed to help you build real job-ready capabilities.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Navigation
            </span>
            <div className="flex flex-col gap-2 text-sm text-stone-600">
              <Link href="/courses" className="hover:text-[#2D3536] transition-colors">
                Courses
              </Link>
              <a href="#why-bstorm" className="hover:text-[#2D3536] transition-colors">
                Why BSTORM
              </a>
              <a href="#curriculum" className="hover:text-[#2D3536] transition-colors">
                Curriculum
              </a>
              <Link href="/login" className="hover:text-[#2D3536] transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          {/* Support Links */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Support
            </span>
            <div className="flex flex-col gap-2 text-sm text-stone-600">
              <a href="mailto:contact@bstorm.edu" className="hover:text-[#2D3536] transition-colors">
                Contact
              </a>
              <Link href="/courses" className="hover:text-[#2D3536] transition-colors">
                Help & FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 BSTORM. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-stone-400">Practical Online Learning</span>
            <span className="text-stone-400">Project-Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
