import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useBstorm } from "@/context/BstormContext";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { CustomSelect } from "@/components/common/CustomSelect";
import { INDIAN_STATES, POPULAR_DISTRICTS, GENDER_OPTIONS } from "@/lib/indiaData";

interface FormErrors {
  userName?: string;
  email?: string;
  collegeName?: string;
  district?: string;
  state?: string;
  gender?: string;
  password?: string;
  confirmPassword?: string;
}

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useBstorm();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // District autocomplete suggestions state
  const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const districtContainerRef = useRef<HTMLDivElement>(null);

  // Custom validation errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close district suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        districtContainerRef.current &&
        !districtContainerRef.current.contains(event.target as Node)
      ) {
        setShowDistrictDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format name helper: capitalize first letter of each word
  const formatName = (val: string) => {
    return val
      .split(" ")
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
      .join(" ");
  };

  // 1. Full Name Change Handler
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Disallow numbers and special characters (allow only letters and spaces)
    if (/[^a-zA-Z\s]/.test(val)) {
      setErrors((prev) => ({
        ...prev,
        userName: "Only letters and spaces are allowed (no numbers or special characters).",
      }));
      return;
    }

    setUserName(val);
    if (errors.userName) {
      setErrors((prev) => ({ ...prev, userName: undefined }));
    }
  };

  const handleNameBlur = () => {
    if (userName.trim()) {
      setUserName(formatName(userName.trim()));
    }
  };

  // 2. College Change Handler
  const handleCollegeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only letters, spaces, dots, and hyphens (no numbers)
    if (/[0-9]/.test(val)) {
      setErrors((prev) => ({
        ...prev,
        collegeName: "Numbers are not allowed in College / Institution name.",
      }));
      return;
    }

    setCollegeName(val);
    if (errors.collegeName) {
      setErrors((prev) => ({ ...prev, collegeName: undefined }));
    }
  };

  // 3. District Change Handler & Autocomplete
  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Disallow numbers
    if (/[0-9]/.test(val)) {
      setErrors((prev) => ({
        ...prev,
        district: "Numbers are not allowed in District name.",
      }));
      return;
    }

    setDistrict(val);
    if (errors.district) {
      setErrors((prev) => ({ ...prev, district: undefined }));
    }

    if (val.trim().length > 0) {
      const query = val.toLowerCase().trim();
      const matches = POPULAR_DISTRICTS.filter((d) =>
        d.toLowerCase().includes(query)
      );
      setDistrictSuggestions(matches.slice(0, 6));
      setShowDistrictDropdown(matches.length > 0);
    } else {
      setShowDistrictDropdown(false);
    }
  };

  const handleSelectDistrict = (selected: string) => {
    setDistrict(selected);
    setShowDistrictDropdown(false);
    if (errors.district) {
      setErrors((prev) => ({ ...prev, district: undefined }));
    }
  };

  const handleDistrictBlur = () => {
    if (district.trim()) {
      const trimmed = district.trim();
      setDistrict(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
    }
  };

  // Custom Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name
    if (!userName.trim()) {
      newErrors.userName = "Full Name is required.";
    } else if (/[^a-zA-Z\s]/.test(userName)) {
      newErrors.userName = "Name must contain letters only (no numbers or special characters).";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. student@gmail.com).";
    }

    // College
    if (!collegeName.trim()) {
      newErrors.collegeName = "College / Institution is required.";
    } else if (/[0-9]/.test(collegeName)) {
      newErrors.collegeName = "College name must contain letters only (no numbers).";
    }

    // District
    if (!district.trim()) {
      newErrors.district = "District is required.";
    } else if (/[0-9]/.test(district)) {
      newErrors.district = "District must contain letters only.";
    }

    // State
    if (!state.trim()) {
      newErrors.state = "Please select your state.";
    }

    // Password
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters in length.";
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match. Please re-enter.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      setGlobalError("Please resolve the highlighted validation errors before continuing.");
      return;
    }

    setIsSubmitting(true);
    setGlobalError("");

    const formattedFullName = formatName(userName.trim());
    const formattedDistrict =
      district.trim().charAt(0).toUpperCase() + district.trim().slice(1);

    const success = await signup({
      name: formattedFullName,
      email: email.trim().toLowerCase(),
      college: collegeName.trim(),
      district: formattedDistrict,
      state: state.trim(),
      gender: gender.trim() || undefined,
      rollNumber: "21" + Math.random().toString().substring(2, 8).toUpperCase(),
      grantName: "Student Academic Grant",
      password,
    });

    if (!success) {
      setGlobalError("Registration failed. An account with this email may already exist.");
      setIsSubmitting(false);
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

  return (
    <GuestGuard>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
        {/* Top Header */}
        <header className="h-20 px-6 sm:px-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              alt="DLABS Logo"
              className="h-9 w-9 rounded-xl object-contain shadow-xs ring-1 ring-slate-900/5 group-hover:scale-105 transition-transform"
              src="/logo.png"
            />
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-slate-900 tracking-tight leading-none">
                DLABS
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
                by Brainstorm Creators
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">Already registered?</span>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all hover:border-slate-300"
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* Main Form Card */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80">
            <div className="flex flex-col gap-1.5 mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Create your learner account
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Join thousands of students mastering practical skills with verified credentials.
              </p>
            </div>

            {globalError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    placeholder="Hari Prasath"
                    className={`w-full h-11 px-3.5 rounded-xl text-sm border font-medium outline-none transition-all placeholder:text-slate-400 ${
                      errors.userName
                        ? "bg-rose-50/50 border-rose-300 text-slate-900 focus:ring-4 focus:ring-rose-500/10"
                        : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  />
                  {errors.userName && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <span>•</span> {errors.userName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="hari@gmail.com"
                    className={`w-full h-11 px-3.5 rounded-xl text-sm border font-medium outline-none transition-all placeholder:text-slate-400 ${
                      errors.email
                        ? "bg-rose-50/50 border-rose-300 text-slate-900 focus:ring-4 focus:ring-rose-500/10"
                        : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <span>•</span> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: College / Institution */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  College / Institution <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={handleCollegeChange}
                  placeholder="PSG College of Technology"
                  className={`w-full h-11 px-3.5 rounded-xl text-sm border font-medium outline-none transition-all placeholder:text-slate-400 ${
                    errors.collegeName
                      ? "bg-rose-50/50 border-rose-300 text-slate-900 focus:ring-4 focus:ring-rose-500/10"
                      : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                  }`}
                />
                {errors.collegeName && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <span>•</span> {errors.collegeName}
                  </p>
                )}
              </div>

              {/* Row 3: District & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* District with Autocomplete Suggestions */}
                <div className="relative" ref={districtContainerRef}>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={handleDistrictChange}
                    onBlur={handleDistrictBlur}
                    placeholder="Coimbatore"
                    autoComplete="off"
                    className={`w-full h-11 px-3.5 rounded-xl text-sm border font-medium outline-none transition-all placeholder:text-slate-400 ${
                      errors.district
                        ? "bg-rose-50/50 border-rose-300 text-slate-900 focus:ring-4 focus:ring-rose-500/10"
                        : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  />

                  {/* Suggestions Dropdown */}
                  {showDistrictDropdown && districtSuggestions.length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-40 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden py-1">
                      <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Suggested Districts
                      </div>
                      {districtSuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelectDistrict(item)}
                          className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  {errors.district && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <span>•</span> {errors.district}
                    </p>
                  )}
                </div>

                {/* State: Searchable Custom Select */}
                <div>
                  <CustomSelect
                    label="State"
                    required
                    options={stateOptions}
                    value={state}
                    onChange={(val) => {
                      setState(val);
                      if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
                    }}
                    placeholder="Select State"
                    searchPlaceholder="Search state or UT..."
                    error={errors.state}
                  />
                </div>
              </div>

              {/* Row 4: Gender */}
              <div>
                <CustomSelect
                  label="Gender (Optional)"
                  options={GENDER_OPTIONS}
                  value={gender}
                  onChange={(val) => setGender(val)}
                  placeholder="Select Gender"
                  searchPlaceholder="Search gender..."
                  clearable
                />
              </div>

              {/* Row 5: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="At least 6 characters"
                      className={`w-full h-11 pl-3.5 pr-11 rounded-xl text-sm border font-medium outline-none transition-all placeholder:text-slate-400 ${
                        errors.password
                          ? "bg-rose-50/50 border-rose-300 text-slate-900 focus:ring-4 focus:ring-rose-500/10"
                          : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <span>•</span> {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }
                      }}
                      placeholder="Re-enter password"
                      className={`w-full h-11 pl-3.5 pr-11 rounded-xl text-sm border font-medium outline-none transition-all placeholder:text-slate-400 ${
                        errors.confirmPassword
                          ? "bg-rose-50/50 border-rose-300 text-slate-900 focus:ring-4 focus:ring-rose-500/10"
                          : "bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <span>•</span> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Your Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 mt-2">
                By registering, you agree to our{" "}
                <Link to="/terms" className="text-emerald-700 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-emerald-700 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="py-6 px-6 sm:px-10 border-t border-slate-200/70 text-center text-xs text-slate-500 bg-white/50 backdrop-blur-sm">
          Provided by Brainstorm Creators • Designed for College Students & Beginners
        </footer>
      </div>
    </GuestGuard>
  );
};
