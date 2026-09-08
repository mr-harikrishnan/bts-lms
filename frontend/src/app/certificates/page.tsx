"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CertificatesPage() {
  const { certificates, user, isLoading } = useBstorm();

  if (isLoading) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-20 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 bg-surface-container-lowest rounded-2xl border border-[#E5E7EB]"
                />
              ))}
            </div>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }


  return (
    <AuthGuard>
      <AppShell>
        <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <div className="mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Credentials
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Earned Certificates
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Course completion credentials issued to {user.name || "Hari"}.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl border border-surface-container text-secondary text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Cryptographically Signed</span>
          </div>
        </div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between gap-5 group hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/30 rounded-bl-full pointer-events-none -z-0" />

                <div className="flex flex-col gap-4 relative z-10">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
                      <span className="material-symbols-outlined text-[24px]">
                        workspace_premium
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold">
                      {cert.grade}
                    </span>
                  </div>

                  <div>
                    <span className="font-caption text-caption text-secondary font-semibold uppercase tracking-wider">
                      {cert.category}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold mt-1 group-hover:text-secondary transition-colors">
                      {cert.courseTitle}
                    </h3>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col gap-1 text-xs">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Credential ID:</span>
                      <span className="font-mono font-bold text-primary">
                        {cert.credentialId}
                      </span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Final Score:</span>
                      <span className="font-bold text-secondary">
                        {cert.score}%
                      </span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Issued:</span>
                      <span className="text-primary">{cert.issueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between relative z-10">
                  <span className="font-caption text-caption text-on-surface-variant">
                    Recipient: {cert.studentName}
                  </span>
                  <Link
                    href={`/certificates/${cert._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary/90 transition-all shadow-sm"
                  >
                    <span>View & Verify</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-[#E5E7EB] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline">
              workspace_premium
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              No Certificates Earned Yet
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Complete any course and pass the final test with 70% or higher to receive your official certificate.
            </p>
            <Link
              href="/courses"
              className="mt-2 px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
            >
              Start a Course
            </Link>
          </div>
        )}
      </div>
    </AppShell>
    </AuthGuard>
  );
}
