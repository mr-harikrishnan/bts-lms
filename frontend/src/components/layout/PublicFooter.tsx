import React from "react";
import Link from "next/link";
import Image from "next/image";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-stone-200 bg-white pt-12 pb-10">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-100">
          {/* Brand Col */}
          <div className="md:col-span-4 flex flex-col gap-3">
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
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              Practical Digital Skills. Structured, beginner-friendly online courses designed by <strong>Brainstorm Creators</strong> to help you build real job-ready capabilities.
            </p>
            <span className="text-xs text-stone-400">
              Coimbatore, Tamil Nadu, India
            </span>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
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

          {/* Legal & Policies */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Legal &amp; Policies
            </span>
            <div className="flex flex-col gap-2 text-sm text-stone-600">
              <Link href="/terms" className="hover:text-[#2D3536] transition-colors">
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" className="hover:text-[#2D3536] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/refund-policy" className="hover:text-[#2D3536] transition-colors">
                Refund &amp; Cancellation
              </Link>
            </div>
          </div>

          {/* Company & Support */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Company &amp; Support
            </span>
            <div className="flex flex-col gap-2 text-sm text-stone-600">
              <Link href="/about" className="hover:text-[#2D3536] transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-[#2D3536] transition-colors">
                Contact Us
              </Link>
              <a href="mailto:support@bstorm.edu" className="hover:text-[#2D3536] transition-colors">
                support@bstorm.edu
              </a>
              <a href="tel:+919488456789" className="hover:text-[#2D3536] transition-colors">
                +91 94884 56789
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 Brainstorm Creators. All rights reserved. BSTORM Academy.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:underline text-stone-500">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline text-stone-500">
              Terms
            </Link>
            <Link href="/refund-policy" className="hover:underline text-stone-500">
              Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
