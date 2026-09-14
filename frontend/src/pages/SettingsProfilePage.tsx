import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CustomSelect } from "@/components/common/CustomSelect";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { INDIAN_STATES } from "@/lib/indiaData";
import { Upload, Trash2, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useBstorm();

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [college, setCollege] = useState(user.college || "");
  const [district, setDistrict] = useState(user.district || "");
  const [state, setState] = useState(user.state || "Tamil Nadu");
  const [avatar, setAvatar] = useState(user.avatar || "");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert selected image file to Base64 data URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB maximum
    if (file.size > 5 * 1024 * 1024) {
      setError("Please select an image smaller than 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files (JPEG, PNG, WEBP) are supported.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };
    reader.onerror = () => {
      setError("Failed to process the selected image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCollege = college.trim();
    const trimmedDistrict = district.trim();
    const trimmedState = state.trim();

    if (!trimmedName || !trimmedEmail || !trimmedCollege || !trimmedDistrict || !trimmedState) {
      setError("Please fill in all required profile fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await updateProfile({
        name: trimmedName,
        college: trimmedCollege,
        district: trimmedDistrict,
        state: trimmedState,
        avatar: avatar,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        navigate("/settings");
      }, 700);
    } catch (err: any) {
      console.error("Profile save error:", err);
      setError(err?.message || "Unable to save profile updates. Please try again.");
      setIsSubmitting(false);
    }
  };

  const customBreadcrumb = (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 font-medium">
      <Link to="/settings" className="hover:text-stone-900 transition-colors flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Settings</span>
      </Link>
      <span>/</span>
      <span className="text-slate-900 font-semibold">Edit Profile</span>
    </div>
  );

  const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

  return (
    <AuthGuard>
      <AppShell customBreadcrumb={customBreadcrumb}>
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Edit Student Profile
                </h1>
                <VerificationBadge size="md" color="blue" tooltip="Verified Learner" />
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Update personal details, institution information, and upload your profile picture.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-xs animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Profile successfully updated! Keeping session active...</span>
            </div>
          )}

          <form onSubmit={handleSave} noValidate className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            {/* Base64 Avatar Upload Section */}
            <div className="flex flex-col gap-3 pb-6 border-b border-stone-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Profile Photo
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Avatar Display / Default Avatar */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-stone-200 bg-stone-100 flex items-center justify-center shadow-xs shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-stone-600">
                      {(name || user.name || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Upload & Remove Controls */}
                <div className="flex flex-col gap-2 flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/70 text-slate-800 text-xs font-semibold border border-stone-200 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Image</span>
                    </button>

                    {avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Use Default</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400">
                    PNG, JPG or WEBP up to 5MB. Converted to secure Base64 format.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hari Prasath"
                  className="w-full h-11 px-3.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm font-medium cursor-not-allowed"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Primary identifier (cannot be modified)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                College / Institution <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="PSG College of Technology"
                className="w-full h-11 px-3.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm font-medium outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  District <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Coimbatore"
                  className="w-full h-11 px-3.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div>
                <CustomSelect
                  label="State"
                  required
                  options={stateOptions}
                  value={state}
                  onChange={(val) => setState(val)}
                  placeholder="Select State"
                  searchPlaceholder="Search state..."
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
              <Link
                to="/settings"
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile Updates</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
