"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

const AVAILABLE_AVATARS = [
  "https://lh3.googleusercontent.com/aida/AEtjO1U9TCa559VGVPXEorXaOd4-4F3-_yxTRkDiN4yL_rHscfc61Dv4oR6rF-Q5Q4SMHc2OiVKW4ppUavOEPI0k5rbfijrF1pDp1QYAUDcOnaN9BVLxBtRq47v7eMcqWE7eGAv5AK-_2-vhabqlwssRcL7ZzhHYRFQg21fjuWJbAUwIiCuxxGKHOITP3QvhqfDi6cdJfeH5tDbP6RoKeD5zNznQitsO7Rh6xF-n0IR0V8a4IS3RYSu34w6dLQQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDoYMvgjeOYO4bHgfQbyZfsji0Z3mcaomZZVJtYmw89_iUM1SVK2qtd5boBI2yOQ1qqJkVEQxlh7Ipj94uGNzq7FByc9KaX50Szlh2kFTNBRsLYy_7VtqpWO0DzRT95Zv3l0JVejmgsF125GO4xxpd-oGHDdtOsRzBNK9PhDsvWw9zxUpmn-xfPepSSbO7O3wQV-L9-CVc7plOKe4HgKclm9OajTCXcvwV2p6vugw4qL7-du4ay4ibF",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA2ad_e9BhVNbU6J6JNT9eOCqYRYC-sNDJa8VVnxyeAkxgDdT2eW91YxvFabYsMoR8CrIW8WEq5yHZgKxzRMX2xrn1cr5bmEcqYh1VwX1pVE0KcMCJeWkFWe-g3GgKxBFAsLZXioa8bUC9y8ddajZ_5Mhu7JuoVW5t1bfzlYJH5nY9Y_Kd7RWHvE91zzpDTBalnu7mU6Xey5M7hbti1WJ9yUwmgCjMrLr88IRldu2numv0tDPHPxVgi",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDWvRzPv4umPBs-EZvIRGoiO7_2N1t_15NqxOWD5wWrI_IceYxRho3H7p8vfVQBOOXT5SHMWSq15FnnqPukqePIasecXudzsvlHBSixC7yeiLg1QOYRYQV3Il61fsUeK1OPoLA8rAusN5DHf3I_zm90PgiHC7zTNsRM1GMSeoNaBQtSOkCTmtY2g7ux2xDKUIYUZ4yEmrQIovxdUporwkIFkiBN7N7e67Lm96rfI8Hr0e4WoEOklEII",
];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useBstorm();

  const [name, setName] = useState(user.name || "Hari");
  const [email, setEmail] = useState(user.email || "hari.prasath@example.com");
  const [college, setCollege] = useState(user.college || "PSG College of Technology");
  const [district, setDistrict] = useState(user.district || "Coimbatore");
  const [state, setState] = useState(user.state || "Tamil Nadu");
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || AVAILABLE_AVATARS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCollege = college.trim();
    const trimmedDistrict = district.trim();
    const trimmedState = state.trim();

    if (!trimmedName || !trimmedEmail || !trimmedCollege || !trimmedDistrict || !trimmedState) {
      setError("All profile fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    updateProfile({
      name: trimmedName,
      email: trimmedEmail,
      college: trimmedCollege,
      district: trimmedDistrict,
      state: trimmedState,
      avatar: selectedAvatar,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      router.replace("/settings");
    }, 600);
  };

  const customBreadcrumb = (
    <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
      <Link href="/settings" className="hover:text-primary transition-colors flex items-center gap-1">
        <span className="material-symbols-outlined text-[18px]">settings</span>
        <span>Settings</span>
      </Link>
      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
      <span className="text-primary font-semibold">Edit Profile</span>
    </div>
  );

  return (
    <AuthGuard>
      <AppShell customBreadcrumb={customBreadcrumb}>
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Edit Student Profile
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Update personal information, institution registration, and display avatar.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 shadow-xs">
            <span className="material-symbols-outlined text-[18px] text-rose-600">
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-secondary-container text-on-secondary-fixed text-sm font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Profile successfully updated! Redirecting to settings...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {/* Avatar Selector */}
          <div className="flex flex-col gap-3">
            <label className="font-label-md text-label-md text-primary font-semibold">
              Select Profile Photo
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              {AVAILABLE_AVATARS.map((avatarUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`w-14 h-14 rounded-2xl overflow-hidden ring-2 transition-all ${
                    selectedAvatar === avatarUrl
                      ? "ring-secondary scale-105 shadow-md"
                      : "ring-[#E5E7EB] hover:ring-secondary/50 opacity-75 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt={`Avatar option ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-surface-container" />

          {/* Form inputs */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5 font-medium">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[42px] px-4 rounded-xl bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5 font-medium">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[42px] px-4 rounded-xl bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5 font-medium">
                College / University Name
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full h-[42px] px-4 rounded-xl bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5 font-medium">
                  District
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-[42px] px-4 rounded-xl bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary focus:bg-surface-container-lowest transition-all"
                />
              </div>

              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5 font-medium">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-[42px] px-4 rounded-xl bg-surface-container-low text-primary font-body-md text-body-md focus:outline-none border border-[#E5E7EB] focus:border-secondary focus:bg-surface-container-lowest transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
            <Link
              href="/settings"
              className="px-5 py-2.5 rounded-xl bg-surface-container-low text-primary font-label-md text-label-md border border-[#E5E7EB] hover:bg-surface-container transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    sync
                  </span>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
    </AuthGuard>
  );
}
