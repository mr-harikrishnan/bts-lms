import React from "react";
import Link from "next/link";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="pt-12 pb-8 border-t border-[#E5E7EB] flex flex-col gap-10 bg-surface">
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Col 1: Brand & Thesis */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="BSTORM Logo"
                className="h-8 w-8 rounded-lg object-contain"
                src="/logo.png"
              />
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-primary tracking-tight leading-none">
                  BSTORM
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium tracking-wider uppercase mt-0.5">
                  by Brainstorm Creators
                </span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Practical, career-focused digital skills. We help college students,
              beginners, and creators master high-demand tech skills through hands-on
              practice projects and self-paced video lessons.
            </p>
            <div className="flex items-center gap-3 text-on-surface-variant pt-2">
              <span className="material-symbols-outlined text-[20px] hover:text-primary cursor-pointer transition-colors">
                public
              </span>
              <span className="material-symbols-outlined text-[20px] hover:text-primary cursor-pointer transition-colors">
                code
              </span>
              <span className="material-symbols-outlined text-[20px] hover:text-primary cursor-pointer transition-colors">
                hub
              </span>
              <span className="material-symbols-outlined text-[20px] hover:text-primary cursor-pointer transition-colors">
                mail
              </span>
            </div>
          </div>

          {/* Col 2: Learning Tracks */}
          <div className="flex flex-col gap-3">
            <span className="font-label-md text-label-md text-primary font-semibold">
              Specializations
            </span>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/courses"
            >
              Digital Marketing
            </Link>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/courses"
            >
              Content Creation
            </Link>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/courses"
            >
              Full Stack Engineering
            </Link>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/courses"
            >
              Brand Architecture
            </Link>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/courses"
            >
              React 19 Masterclass
            </Link>
          </div>

          {/* Col 3: Platform */}
          <div className="flex flex-col gap-3">
            <span className="font-label-md text-label-md text-primary font-semibold">
              Platform
            </span>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="#methodology"
            >
              Our Methodology
            </a>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/courses"
            >
              Course Catalog
            </Link>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/dashboard"
            >
              Student Terminal
            </Link>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/certificates"
            >
              Verify Certificate
            </Link>
            <Link
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
              href="/my-courses"
            >
              Placement Network
            </Link>
          </div>

          {/* Col 4: Institutional & Legal */}
          <div className="flex flex-col gap-3">
            <span className="font-label-md text-label-md text-primary font-semibold">
              Institution
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              Enterprise Training
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              Academic Advisory
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              Privacy Charter
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              Student Honor Code
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              Refund Policies
            </span>
          </div>
        </div>

        {/* Bottom Attribution & Compliance */}
        <div className="pt-8 mt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4 font-caption text-caption text-on-surface-variant">
          <p>© 2025 BSTORM. Provided by Brainstorm Creators. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <span className="hover:text-primary cursor-pointer transition-colors">
              ISO 9001:2015 Accredited
            </span>
            <span className="hover:text-primary cursor-pointer transition-colors">
              Encrypted TLS 1.3
            </span>
            <span className="hover:text-primary cursor-pointer transition-colors">
              System Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
