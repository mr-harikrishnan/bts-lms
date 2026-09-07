"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";

export default function SettingsPage() {
  const { user } = useBstorm();

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Account Settings
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Settings & Profile
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your academic credentials, enrollment details, and account preferences.
            </p>
          </div>

          <Link
            href="/settings/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${user.name} Avatar`}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-md"
              src={user.avatar}
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm">
              <span className="material-symbols-outlined text-[12px]">check</span>
            </span>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {user.name || "Hari"}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold">
                Verified Student
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {user.email || "hari.prasath@example.com"}
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  school
                </span>
                {user.college || "PSG College of Technology"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  location_on
                </span>
                {user.district || "Coimbatore"}, {user.state || "Tamil Nadu"}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Details Information Grid */}
        <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                badge
              </span>
              Academic Registry & Subsidy Verification
            </h3>
            <span className="font-caption text-caption text-secondary font-semibold">
              Active Grant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low border border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant font-medium">
                Full Legal Name
              </span>
              <span className="font-body-md text-body-md font-semibold text-primary">
                {user.name || "Hari"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low border border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant font-medium">
                Registered University Email
              </span>
              <span className="font-body-md text-body-md font-semibold text-primary font-mono text-sm">
                {user.email || "hari.prasath@example.com"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low border border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant font-medium">
                Affiliated Institution
              </span>
              <span className="font-body-md text-body-md font-semibold text-primary">
                {user.college || "PSG College of Technology"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low border border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant font-medium">
                Roll / Student ID
              </span>
              <span className="font-body-md text-body-md font-semibold text-primary font-mono">
                {user.rollNumber || "21BBA048"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low border border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant font-medium">
                District / Region
              </span>
              <span className="font-body-md text-body-md font-semibold text-primary">
                {user.district || "Coimbatore"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low border border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant font-medium">
                State / Territory
              </span>
              <span className="font-body-md text-body-md font-semibold text-primary">
                {user.state || "Tamil Nadu"}
              </span>
            </div>
          </div>
        </div>

        {/* Honor Code & Compliance */}
        <div className="bg-surface-container-low rounded-xl p-5 border border-surface-container flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
            verified_user
          </span>
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-primary">
              BSTORM Student Honor Code & Verification
            </span>
            <span className="text-on-surface-variant text-xs mt-0.5 leading-relaxed">
              Your student profile is linked to your official course completions and certificates. All certificates earned will remain accessible in your account.
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
