"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { userService } from "@/services/apiClient";
import { Certificate } from "@/types";

export default function CertificateViewPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const resolvedParams = use(params);
  const certificateId = resolvedParams.certificateId;
  const { certificates, getCertificateById, user, isLoading: isContextLoading } = useBstorm();

  const [apiCert, setApiCert] = useState<Certificate | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  const contextCert =
    getCertificateById(certificateId) ||
    certificates.find((c) => c._id === certificateId || c.credentialId === certificateId);
  const cert = contextCert || apiCert;

  useEffect(() => {
    let isMounted = true;
    if (contextCert) {
      setIsLoadingApi(false);
      return;
    }

    async function loadCert() {
      setIsLoadingApi(true);
      try {
        const data = await userService.getCertificateById(certificateId);
        if (isMounted) {
          setApiCert(data);
        }
      } catch (err) {
        console.error("Failed to load certificate from API:", err);
      } finally {
        if (isMounted) {
          setIsLoadingApi(false);
        }
      }
    }
    loadCert();
    return () => {
      isMounted = false;
    };
  }, [certificateId, contextCert]);

  if (isContextLoading || isLoadingApi) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="max-w-4xl mx-auto h-[500px] bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] animate-pulse" />
        </AppShell>
      </AuthGuard>
    );
  }

  if (!cert) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3 max-w-lg mx-auto my-8">
            <span className="material-symbols-outlined text-[48px] text-outline">
              search_off
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Certificate Not Found
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              The requested credential could not be found or has not been issued to your account.
            </p>
            <Link
              href="/certificates"
              className="mt-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
            >
              View My Certificates
            </Link>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }


  const handlePrint = () => {
    window.print();
  };

  const customBreadcrumb = (
    <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
      <Link href="/certificates" className="hover:text-primary transition-colors flex items-center gap-1">
        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
        <span>Certificates</span>
      </Link>
      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
      <span className="text-primary font-semibold">{cert.credentialId}</span>
    </div>
  );

  return (
    <AuthGuard>
      <AppShell customBreadcrumb={customBreadcrumb} maxWidth="max-w-[1100px]">
        <div className="flex flex-col gap-6">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <Link
              href="/certificates"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>All Certificates</span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
              Status: Verified & Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download Certificate</span>
            </button>
          </div>
        </div>

        {/* Certificate Canvas Document (Editorial Academic Style) */}
        <div className="bg-surface-container-lowest border-4 border-double border-[#697C70]/40 rounded-2xl p-8 sm:p-14 shadow-xl flex flex-col items-center justify-between min-h-[640px] text-center relative overflow-hidden print:m-0 print:border-none">
          {/* Subtle Corner Ornaments */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-secondary/40" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-secondary/40" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-secondary/40" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-secondary/40" />

          {/* Top Branding */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="BSTORM Logo"
                className="h-10 w-10 rounded-xl object-contain shadow-xs"
                src="/logo.png"
              />
              <div className="flex flex-col items-start">
                <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight leading-none">
                  BSTORM
                </span>
                <span className="text-[11px] text-on-surface-variant font-semibold tracking-wider uppercase mt-0.5">
                  by Brainstorm Creators
                </span>
              </div>
            </div>
            <span className="font-caption text-caption uppercase tracking-[0.2em] text-secondary font-bold text-xs mt-1">
              Certificate of Skill Completion
            </span>
          </div>

          {/* Certificate Title */}
          <div className="flex flex-col items-center gap-3 my-6">
            <h1 className="font-display text-3xl sm:text-4xl text-primary font-bold tracking-tight">
              Certificate of Completion & Mastery
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
              This credential certifies that
            </p>

            {/* Student Name */}
            <div className="py-2 border-b-2 border-primary/20 min-w-[280px] sm:min-w-[380px]">
              <span className="font-display text-3xl sm:text-4xl text-primary font-bold tracking-wide">
                {cert ? cert.studentName : user.name || "Hari"}
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-2 leading-relaxed">
              has successfully completed all lessons, hands-on practice projects, and the final assessment for
            </p>

            {/* Course Title */}
            <h2 className="font-headline-md text-2xl sm:text-3xl text-secondary font-bold max-w-2xl px-4">
              {cert ? cert.courseTitle : "Full-Stack Web Development"}
            </h2>

            <div className="inline-flex items-center gap-3 mt-1">
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-bold">
                Graduated with {cert ? cert.grade : "Honors"} ({cert ? cert.score : 96.4}%)
              </span>
              <span className="text-on-surface-variant font-caption text-xs">
                Issued on {cert ? cert.issueDate : "Feb 2025"}
              </span>
            </div>
          </div>

          {/* Signatures & Seal Bottom Row */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-8 mt-4 border-t border-surface-container">
            {/* Lead Instructor */}
            <div className="flex flex-col items-center">
              <span className="font-serif italic text-lg text-primary mb-1">
                {cert ? cert.instructorName : "Rohit Sen"}
              </span>
              <div className="w-44 h-[1px] bg-primary/30 my-1" />
              <span className="font-caption text-xs font-semibold text-primary">
                {cert ? cert.instructorName : "Rohit Sen"}
              </span>
              <span className="font-caption text-[11px] text-on-surface-variant">
                Lead Principal Instructor
              </span>
            </div>

            {/* Certified Gold/Moss Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-secondary/70 bg-secondary-container/30 flex flex-col items-center justify-center shadow-inner relative">
                <span
                  className="material-symbols-outlined text-secondary text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="font-caption text-[9px] font-bold text-secondary tracking-widest uppercase">
                  VERIFIED
                </span>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant mt-1.5">
                ISO 9001:2015
              </span>
            </div>

            {/* Academic Director */}
            <div className="flex flex-col items-center">
              <span className="font-serif italic text-lg text-primary mb-1">
                {cert ? cert.directorName : "Dr. Arvind Swaminathan"}
              </span>
              <div className="w-44 h-[1px] bg-primary/30 my-1" />
              <span className="font-caption text-xs font-semibold text-primary">
                {cert ? cert.directorName : "Dr. Arvind Swaminathan"}
              </span>
              <span className="font-caption text-[11px] text-on-surface-variant">
                Director of Academic Affairs
              </span>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 pt-6 mt-6 border-t border-surface-container text-xs text-on-surface-variant font-mono">
            <span>Credential ID: {cert ? cert.credentialId : "BST-2025-8849-01B"}</span>
            <span>Verification Key: {cert ? cert.verificationKey : "0x4F91A82C3D77E4"}</span>
            <span>bstorm.studio/verify</span>
          </div>
        </div>
      </div>
    </AppShell>
    </AuthGuard>
  );
}
