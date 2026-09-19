import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  Layers,
  Video,
  UserCheck,
  DollarSign,
  Tag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Loader2,
  RotateCw,
  Ticket,
  Copy,
  CheckCheck,
  ToggleLeft,
  ToggleRight,
  Percent,
  HelpCircle,
  Award,
  CheckSquare,
  Square,
  CheckCircle2,
  Code2,
  FileQuestion,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { courseService, adminService, categoryService, couponService } from "@/services/apiClient";
import { Course, CategoryItem, CouponItem, CouponDiscountType, CourseTest, TestQuestion, CourseModule } from "@/types";

interface LessonDraft {
  lessonNumber: string;
  title: string;
  duration: string;
  videoUrl: string;
  overviewText: string;
  takeawayTitle: string;
  takeawayDesc: string;
}

export interface QuestionDraft {
  question: string;
  codeSnippet: string;
  type: "mcq" | "msq";
  options: string[];
  correctIndex: number;
  correctIndices: number[];
  explanation: string;
}

export interface ModuleQuizDraft {
  hasQuiz: boolean;
  title: string;
  timeLimitMinutes: number;
  passingScore: number;
  isOptional: boolean;
  questions: QuestionDraft[];
}

interface ModuleDraft {
  moduleNumber: string;
  title: string;
  lessons: LessonDraft[];
  quiz?: ModuleQuizDraft;
}

function computeTotalDurationFromModules(modules: ModuleDraft[]) {
  let totalMinutes = 0;
  for (const m of modules) {
    for (const l of m.lessons) {
      if (l.duration) {
        const str = l.duration.trim().toLowerCase();
        const hms = str.match(/^(\d+):(\d{2}):(\d{2})$/);
        if (hms) {
          totalMinutes += parseInt(hms[1], 10) * 60 + parseInt(hms[2], 10) + Math.ceil(parseInt(hms[3], 10) / 60);
          continue;
        }
        const ms = str.match(/^(\d+):(\d{2})$/);
        if (ms) {
          totalMinutes += parseInt(ms[1], 10) + Math.ceil(parseInt(ms[2], 10) / 60);
          continue;
        }
        const hrMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)/);
        if (hrMatch) {
          totalMinutes += Math.round(parseFloat(hrMatch[1]) * 60);
        }
        const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minutes?)/);
        if (minMatch) {
          totalMinutes += Math.round(parseFloat(minMatch[1]));
        }
        const secMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds?)/);
        if (secMatch && !hrMatch && !minMatch) {
          totalMinutes += Math.max(1, Math.round(parseFloat(secMatch[1]) / 60));
        }
        if (!hrMatch && !minMatch && !secMatch && /^\d+$/.test(str)) {
          totalMinutes += parseInt(str, 10);
        }
      }
    }
  }
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  let timeStr = "";
  if (hrs > 0 && mins > 0) timeStr = `${hrs} Hrs ${mins} Mins`;
  else if (hrs > 0) timeStr = `${hrs} Hours`;
  else timeStr = `${mins || 0} Mins`;

  return {
    hoursLive: Math.ceil(totalMinutes / 60) || 1,
    formattedDuration: timeStr || "0 Mins",
  };
}

async function detectVideoDuration(url: string): Promise<string | null> {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  const cleanUrl = url.trim();

  // 1. Direct browser HTML5 video probe for mp4, webm, Cloudinary, S3, direct files
  const probeDirectVideo = (mediaUrl: string): Promise<number | null> => {
    return new Promise((resolve) => {
      try {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.src = mediaUrl;
        v.onloadedmetadata = () => {
          if (v.duration && isFinite(v.duration) && v.duration > 0) {
            resolve(Math.round(v.duration));
          } else {
            resolve(null);
          }
        };
        v.onerror = () => resolve(null);
        setTimeout(() => resolve(null), 3500);
      } catch {
        resolve(null);
      }
    });
  };

  const directSeconds = await probeDirectVideo(cleanUrl);
  if (directSeconds && directSeconds > 0) {
    const hrs = Math.floor(directSeconds / 3600);
    const mins = Math.floor((directSeconds % 3600) / 60);
    const secs = directSeconds % 60;
    if (hrs > 0) return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    if (mins > 0) return `${mins} mins`;
    return `${secs} secs`;
  }

  // 2. YouTube, Vimeo, or backend metadata probe
  try {
    const res = await adminService.probeVideoDuration(cleanUrl);
    if (res && res.formatted) {
      return res.formatted;
    }
  } catch (err) {
    console.warn("External video duration probe returned fallback:", err);
  }

  return null;
}

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Course Coupons Modal State
  const [couponCourse, setCouponCourse] = useState<Course | null>(null);
  const [courseCoupons, setCourseCoupons] = useState<CouponItem[]>([]);
  const [isCouponsLoading, setIsCouponsLoading] = useState(false);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "fixed" as CouponDiscountType,
    discountValue: 0,
    maxUses: "" as string | number,
    expiresAt: "",
  });

  const openCouponModal = async (course: Course) => {
    setCouponCourse(course);
    setCouponFeedback(null);
    setCouponForm({
      code: "",
      discountType: "fixed",
      discountValue: 0,
      maxUses: "",
      expiresAt: "",
    });
    setIsCouponsLoading(true);
    try {
      const data = await couponService.admin.getByCourse(course._id);
      setCourseCoupons(Array.isArray(data) ? data.filter((c) => Boolean(c && c._id)) : []);
    } catch (err: any) {
      setCouponFeedback({ type: "error", message: err?.message || "Failed to load coupons." });
    } finally {
      setIsCouponsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCourse) return;
    setIsCreatingCoupon(true);
    setCouponFeedback(null);

    try {
      const payload = {
        code: couponForm.code.trim() ? couponForm.code.trim().toUpperCase() : undefined,
        courseId: couponCourse._id,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue) || 0,
        maxUses: couponForm.maxUses !== "" ? Number(couponForm.maxUses) : null,
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : null,
      };

      const newCoupon = await couponService.admin.create(payload);
      if (newCoupon && newCoupon._id) {
        setCourseCoupons((prev) => [
          newCoupon,
          ...prev.filter((c) => Boolean(c && c._id && c._id !== newCoupon._id)),
        ]);
        setCouponFeedback({
          type: "success",
          message: `Coupon '${newCoupon.code}' created successfully!`,
        });
      }
      setCouponForm({
        code: "",
        discountType: "fixed",
        discountValue: 0,
        maxUses: "",
        expiresAt: "",
      });
    } catch (err: any) {
      setCouponFeedback({
        type: "error",
        message: err?.message || "Failed to create coupon.",
      });
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (couponId: string) => {
    try {
      const updated = await couponService.admin.toggle(couponId);
      setCourseCoupons((prev) =>
        prev.map((c) => (c._id === couponId ? updated : c))
      );
    } catch (err: any) {
      setCouponFeedback({ type: "error", message: err?.message || "Failed to toggle coupon status." });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await couponService.admin.delete(couponId);
      setCourseCoupons((prev) => prev.filter((c) => c._id !== couponId));
      setCouponFeedback({ type: "success", message: "Coupon deleted successfully." });
    } catch (err: any) {
      setCouponFeedback({ type: "error", message: err?.message || "Failed to delete coupon." });
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    setTimeout(() => setCopiedCouponId(null), 2000);
  };

  // Course & Module Quizzes Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizCourse, setQuizCourse] = useState<Course | null>(null);
  const [quizModules, setQuizModules] = useState<CourseModule[]>([]);
  const [quizTests, setQuizTests] = useState<CourseTest[]>([]);
  const [isQuizzesLoading, setIsQuizzesLoading] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("course_final");
  const [editingQuizDraft, setEditingQuizDraft] = useState<ModuleQuizDraft>({
    hasQuiz: true,
    title: "",
    timeLimitMinutes: 15,
    passingScore: 75,
    isOptional: false,
    questions: [],
  });
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadDraftForTarget = (
    targetId: string,
    modules: CourseModule[],
    tests: CourseTest[],
    courseTitle: string
  ) => {
    setSelectedTargetId(targetId);
    setQuizFeedback(null);

    const existingTest = tests.find((t) => {
      if (targetId === "course_final") {
        return !t.moduleId;
      }
      return t.moduleId === targetId;
    });

    if (existingTest) {
      setEditingQuizDraft({
        hasQuiz: true,
        title: existingTest.title || (targetId === "course_final" ? `${courseTitle} Final Certification Exam` : "Module Quiz"),
        timeLimitMinutes: existingTest.timeLimitMinutes || 15,
        passingScore: existingTest.passingScore || 75,
        isOptional: Boolean((existingTest as any).isOptional),
        questions: (existingTest.questions || []).map((q) => ({
          question: q.question || "",
          codeSnippet: q.codeSnippet || "",
          type: q.type === "msq" ? "msq" : "mcq",
          options: q.options && q.options.length > 0 ? [...q.options] : ["Option 1", "Option 2"],
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
          correctIndices:
            Array.isArray(q.correctIndices) && q.correctIndices.length > 0
              ? [...q.correctIndices]
              : [typeof q.correctIndex === "number" ? q.correctIndex : 0],
          explanation: q.explanation || "",
        })),
      });
    } else {
      let defaultTitle = "";
      if (targetId === "course_final") {
        defaultTitle = `${courseTitle} Final Certification Exam`;
      } else {
        const mod = modules.find((m) => m._id === targetId);
        defaultTitle = `${mod?.moduleNumber || "Module"} Quiz: ${mod?.title || "Assessment"}`;
      }

      setEditingQuizDraft({
        hasQuiz: false,
        title: defaultTitle,
        timeLimitMinutes: targetId === "course_final" ? 30 : 15,
        passingScore: targetId === "course_final" ? 80 : 70,
        isOptional: false,
        questions: [
          {
            question: "What is the primary concept covered in this section?",
            codeSnippet: "",
            type: "mcq",
            options: ["Primary best practice", "Alternative approach A", "Alternative approach B", "None of the above"],
            correctIndex: 0,
            correctIndices: [0],
            explanation: "This option represents the core principle demonstrated in the lessons.",
          },
        ],
      });
    }
  };

  const openQuizModal = async (course: Course) => {
    setQuizCourse(course);
    setQuizFeedback(null);
    setIsQuizzesLoading(true);
    setQuizModalOpen(true);

    try {
      const [fullCourse, existingTests] = await Promise.all([
        courseService.getById(course._id),
        adminService.getCourseTests(course._id),
      ]);

      const modules = Array.isArray(fullCourse.modules) ? fullCourse.modules : [];
      setQuizModules(modules);
      const tests = Array.isArray(existingTests) ? existingTests : [];
      setQuizTests(tests);

      const initialTarget = modules.length > 0 ? (modules[0]._id as string) : "course_final";
      loadDraftForTarget(initialTarget, modules, tests, course.title);
    } catch (err: any) {
      setQuizFeedback({ type: "error", message: err?.message || "Failed to load quizzes." });
    } finally {
      setIsQuizzesLoading(false);
    }
  };

  const handleAddQuestionToModalDraft = () => {
    setEditingQuizDraft((prev) => ({
      ...prev,
      hasQuiz: true,
      questions: [
        ...prev.questions,
        {
          question: "",
          codeSnippet: "",
          type: "mcq",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctIndex: 0,
          correctIndices: [0],
          explanation: "",
        },
      ],
    }));
  };

  const handleRemoveQuestionFromModalDraft = (qIdx: number) => {
    setEditingQuizDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIdx),
    }));
  };

  const handleUpdateQuestionInModalDraft = (qIdx: number, field: keyof QuestionDraft, val: any) => {
    setEditingQuizDraft((prev) => {
      const qs = [...prev.questions];
      qs[qIdx] = { ...qs[qIdx], [field]: val };
      return { ...prev, questions: qs };
    });
  };

  const handleToggleModalOptionCorrectness = (qIdx: number, optIdx: number) => {
    setEditingQuizDraft((prev) => {
      const qs = [...prev.questions];
      const q = { ...qs[qIdx] };
      if (q.type === "mcq") {
        q.correctIndex = optIdx;
        q.correctIndices = [optIdx];
      } else {
        const set = new Set(q.correctIndices || []);
        if (set.has(optIdx)) {
          if (set.size > 1) set.delete(optIdx);
        } else {
          set.add(optIdx);
        }
        q.correctIndices = Array.from(set);
        q.correctIndex = q.correctIndices[0] ?? 0;
      }
      qs[qIdx] = q;
      return { ...prev, questions: qs };
    });
  };

  const handleAddOptionToModalQuestion = (qIdx: number) => {
    setEditingQuizDraft((prev) => {
      const qs = [...prev.questions];
      const q = { ...qs[qIdx] };
      q.options = [...q.options, `Option ${q.options.length + 1}`];
      qs[qIdx] = q;
      return { ...prev, questions: qs };
    });
  };

  const handleRemoveOptionFromModalQuestion = (qIdx: number, optIdx: number) => {
    setEditingQuizDraft((prev) => {
      const qs = [...prev.questions];
      const q = { ...qs[qIdx] };
      if (q.options.length <= 2) return prev;
      q.options = q.options.filter((_, i) => i !== optIdx);
      q.correctIndices = (q.correctIndices || [])
        .filter((i) => i !== optIdx)
        .map((i) => (i > optIdx ? i - 1 : i));
      if (q.correctIndices.length === 0) q.correctIndices = [0];
      q.correctIndex = q.correctIndices[0];
      qs[qIdx] = q;
      return { ...prev, questions: qs };
    });
  };

  const handleSaveModalQuiz = async () => {
    if (!quizCourse) return;
    if (!editingQuizDraft.title.trim()) {
      setQuizFeedback({ type: "error", message: "Please enter an assessment title." });
      return;
    }
    if (editingQuizDraft.questions.length === 0) {
      setQuizFeedback({ type: "error", message: "Please add at least 1 question to the assessment." });
      return;
    }

    for (let i = 0; i < editingQuizDraft.questions.length; i++) {
      const q = editingQuizDraft.questions[i];
      if (!q.question.trim()) {
        setQuizFeedback({ type: "error", message: `Question #${i + 1} text cannot be empty.` });
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        setQuizFeedback({ type: "error", message: `All options in Question #${i + 1} must have text.` });
        return;
      }
    }

    setIsSavingQuiz(true);
    setQuizFeedback(null);
    try {
      const payload: Partial<CourseTest> = {
        title: editingQuizDraft.title.trim(),
        timeLimitMinutes: Number(editingQuizDraft.timeLimitMinutes) || 15,
        passingScore: Number(editingQuizDraft.passingScore) || 75,
        isOptional: Boolean(editingQuizDraft.isOptional),
        questions: editingQuizDraft.questions.map((q) => ({
          question: q.question.trim(),
          codeSnippet: q.codeSnippet?.trim() || "",
          type: q.type,
          options: q.options.map((o) => o.trim()),
          correctIndex: q.type === "mcq" ? q.correctIndex : (q.correctIndices[0] ?? 0),
          correctIndices: q.type === "msq" ? q.correctIndices : [q.correctIndex],
          explanation: q.explanation?.trim() || "",
        })),
      };

      let saved: CourseTest;
      if (selectedTargetId === "course_final") {
        saved = await adminService.saveCourseTest(quizCourse._id, payload);
      } else {
        saved = await adminService.saveModuleTest(quizCourse._id, selectedTargetId, payload);
      }

      setQuizTests((prev) => {
        const withoutOld = prev.filter((t) => {
          if (selectedTargetId === "course_final") return Boolean(t.moduleId);
          return t.moduleId !== selectedTargetId;
        });
        return [...withoutOld, saved];
      });

      setEditingQuizDraft((prev) => ({ ...prev, hasQuiz: true }));
      setQuizFeedback({
        type: "success",
        message: `${selectedTargetId === "course_final" ? "Course Final Exam" : "Module Quiz"} saved successfully!`,
      });
    } catch (err: any) {
      setQuizFeedback({ type: "error", message: err?.message || "Failed to save assessment." });
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleDeleteModalQuiz = async () => {
    if (!confirm("Are you sure you want to delete this test? Learners won't be required to take it.")) return;
    const existingTest = quizTests.find((t) =>
      selectedTargetId === "course_final" ? !t.moduleId : t.moduleId === selectedTargetId
    );
    if (!existingTest || !existingTest._id) {
      setEditingQuizDraft((prev) => ({ ...prev, hasQuiz: false }));
      return;
    }

    setIsSavingQuiz(true);
    try {
      await adminService.deleteTest(existingTest._id);
      setQuizTests((prev) => prev.filter((t) => t._id !== existingTest._id));
      setEditingQuizDraft((prev) => ({ ...prev, hasQuiz: false }));
      setQuizFeedback({ type: "success", message: "Assessment removed successfully." });
    } catch (err: any) {
      setQuizFeedback({ type: "error", message: err?.message || "Failed to delete test." });
    } finally {
      setIsSavingQuiz(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Web Development",
    level: "Beginner-Friendly" as Course["level"],
    price: 1999,
    originalPrice: 3999,
    duration: "0 Hours",
    durationWeeks: 0,
    hoursLive: 0,
    description: "",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
    previewVideoUrl: "",
    skillsText: "HTML, CSS, JavaScript, React",
    featured: false,
    isUpcoming: false,
    instructorName: "Karthik Raja",
    instructorTitle: "Senior Architect & Lead Instructor",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    capstoneTitle: "Full-Stack Production Capstone Project",
    capstoneDesc: "Architect, build, and deploy a complete real-world application to production.",
  });

  const [probingVideoKeys, setProbingVideoKeys] = useState<Record<string, boolean>>({});

  const handleVideoUrlChange = async (mIdx: number, lIdx: number, url: string) => {
    updateLessonField(mIdx, lIdx, "videoUrl", url);
    if (!url.trim()) {
      updateLessonField(mIdx, lIdx, "duration", "");
      return;
    }
    const key = `${mIdx}-${lIdx}`;
    setProbingVideoKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const detected = await detectVideoDuration(url);
      if (detected) {
        updateLessonField(mIdx, lIdx, "duration", detected);
      }
    } finally {
      setProbingVideoKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleRecheckDuration = async (mIdx: number, lIdx: number, url: string) => {
    if (!url.trim()) return;
    const key = `${mIdx}-${lIdx}`;
    setProbingVideoKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const detected = await detectVideoDuration(url);
      if (detected) {
        updateLessonField(mIdx, lIdx, "duration", detected);
      }
    } finally {
      setProbingVideoKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Curriculum State for Step 3
  const [modulesDraft, setModulesDraft] = useState<ModuleDraft[]>([
    {
      moduleNumber: "Module 01",
      title: "Core Foundations & Setup",
      lessons: [
        {
          lessonNumber: "1.1",
          title: "Introduction & Architecture Overview",
          duration: "15 mins",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          overviewText: "Platform tour, environment setup, essential tooling",
          takeawayTitle: "Core Foundations",
          takeawayDesc: "Understand fundamental project workflow and standards",
        },
      ],
    },
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [courseList, catList] = await Promise.all([
        courseService.getAll(),
        categoryService.getAll(),
      ]);
      setCourses(courseList);
      setCategories(catList);
      if (catList.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: catList[0].name }));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load courses or categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openCreateModal();
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setCurrentStep(1);
    setFormData({
      title: "",
      category: categories.length > 0 ? categories[0].name : "Web Development",
      level: "Beginner-Friendly",
      price: 1999,
      originalPrice: 3999,
      duration: "0 Hours",
      durationWeeks: 0,
      hoursLive: 0,
      description: "",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
      previewVideoUrl: "",
      skillsText: "HTML, CSS, JavaScript, React",
      featured: false,
      isUpcoming: false,
      instructorName: "Karthik Raja",
      instructorTitle: "Senior Architect & Lead Instructor",
      instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
      capstoneTitle: "Full-Stack Production Capstone Project",
      capstoneDesc: "Architect, build, and deploy a complete real-world application to production.",
    });
    setModulesDraft([
      {
        moduleNumber: "Module 01",
        title: "Core Foundations & Setup",
        lessons: [
          {
            lessonNumber: "1.1",
            title: "Introduction & Architecture Overview",
            duration: "",
            videoUrl: "",
            overviewText: "Platform tour, environment setup, essential tooling",
            takeawayTitle: "Core Foundations",
            takeawayDesc: "Understand fundamental project workflow and standards",
          },
        ],
      },
    ]);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setCurrentStep(1);
    setFormData({
      title: c.title,
      category: c.category,
      level: c.level,
      price: c.price,
      originalPrice: c.originalPrice,
      duration: c.duration || "0 Hours",
      durationWeeks: 0,
      hoursLive: c.hoursLive || 0,
      description: c.description,
      thumbnail: c.thumbnail,
      previewVideoUrl: c.previewVideoUrl || "",
      skillsText: Array.isArray(c.skills) ? c.skills.join(", ") : "",
      featured: Boolean(c.featured),
      isUpcoming: Boolean(c.isUpcoming),
      instructorName: c.instructor?.name || "Karthik Raja",
      instructorTitle: c.instructor?.title || "Senior Instructor",
      instructorAvatar: c.instructor?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
      capstoneTitle: c.capstoneTitle || "Final Portfolio Project",
      capstoneDesc: c.capstoneDesc || "Deploy a production-ready project to prove mastery.",
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreatingCat(true);
    try {
      const created = await categoryService.create({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
      });
      setCategories((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, category: created.name }));
      setNewCatName("");
      setNewCatDesc("");
      setCatModalOpen(false);
    } catch (err: any) {
      alert(err?.message || "Failed to create category");
    } finally {
      setIsCreatingCat(false);
    }
  };

  // Module & Lesson Draft Helpers
  const addModule = () => {
    const nextNum = modulesDraft.length + 1;
    setModulesDraft([
      ...modulesDraft,
      {
        moduleNumber: `Module 0${nextNum}`,
        title: `Module ${nextNum} Curriculum`,
        lessons: [
          {
            lessonNumber: `${nextNum}.1`,
            title: "Lesson Introduction",
            duration: "",
            videoUrl: "",
            overviewText: "Key concepts and practical implementation",
            takeawayTitle: "Lesson Takeaway",
            takeawayDesc: "Core technical skill mastered",
          },
        ],
      },
    ]);
  };

  const removeModule = (index: number) => {
    setModulesDraft(modulesDraft.filter((_, i) => i !== index));
  };

  const addLessonToModule = (mIdx: number) => {
    const updated = [...modulesDraft];
    const nextLessonNum = updated[mIdx].lessons.length + 1;
    updated[mIdx].lessons.push({
      lessonNumber: `${mIdx + 1}.${nextLessonNum}`,
      title: `Lesson ${nextLessonNum}`,
      duration: "",
      videoUrl: "",
      overviewText: "Overview points",
      takeawayTitle: "Key Concept",
      takeawayDesc: "Practical technique applied",
    });
    setModulesDraft(updated);
  };

  const removeLessonFromModule = (mIdx: number, lIdx: number) => {
    const updated = [...modulesDraft];
    updated[mIdx].lessons = updated[mIdx].lessons.filter((_, i) => i !== lIdx);
    setModulesDraft(updated);
  };

  const updateLessonField = (mIdx: number, lIdx: number, field: keyof LessonDraft, value: string) => {
    const updated = [...modulesDraft];
    updated[mIdx].lessons[lIdx][field] = value;
    setModulesDraft(updated);
  };

  const updateModuleField = (mIdx: number, field: "moduleNumber" | "title", value: string) => {
    const updated = [...modulesDraft];
    updated[mIdx][field] = value;
    setModulesDraft(updated);
  };

  const toggleModuleQuiz = (mIdx: number) => {
    const updated = [...modulesDraft];
    const mod = updated[mIdx];
    if (mod.quiz?.hasQuiz) {
      mod.quiz.hasQuiz = false;
    } else {
      mod.quiz = {
        hasQuiz: true,
        title: `${mod.title || "Module"} Quiz`,
        timeLimitMinutes: 10,
        passingScore: 75,
        isOptional: false,
        questions: [
          {
            question: "Which of the following describes this module's core concept?",
            codeSnippet: "",
            type: "mcq",
            options: ["Primary core concept", "Alternative interpretation A", "Alternative interpretation B", "None of the above"],
            correctIndex: 0,
            correctIndices: [0],
            explanation: "This option represents the key takeaway taught across the lessons.",
          },
        ],
      };
    }
    setModulesDraft(updated);
  };

  const updateQuizField = (mIdx: number, field: "title" | "timeLimitMinutes" | "passingScore" | "isOptional", value: any) => {
    const updated = [...modulesDraft];
    if (updated[mIdx].quiz) {
      (updated[mIdx].quiz as any)[field] = value;
      setModulesDraft(updated);
    }
  };

  const addQuestionToQuiz = (mIdx: number) => {
    const updated = [...modulesDraft];
    if (!updated[mIdx].quiz) return;
    updated[mIdx].quiz!.questions.push({
      question: "",
      codeSnippet: "",
      type: "mcq",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctIndex: 0,
      correctIndices: [0],
      explanation: "",
    });
    setModulesDraft(updated);
  };

  const removeQuestionFromQuiz = (mIdx: number, qIdx: number) => {
    const updated = [...modulesDraft];
    if (!updated[mIdx].quiz) return;
    updated[mIdx].quiz!.questions = updated[mIdx].quiz!.questions.filter((_, i) => i !== qIdx);
    setModulesDraft(updated);
  };

  const updateQuestionField = (mIdx: number, qIdx: number, field: keyof QuestionDraft, value: any) => {
    const updated = [...modulesDraft];
    if (!updated[mIdx].quiz) return;
    (updated[mIdx].quiz!.questions[qIdx] as any)[field] = value;
    setModulesDraft(updated);
  };

  const toggleOptionCorrectness = (mIdx: number, qIdx: number, optIdx: number) => {
    const updated = [...modulesDraft];
    const q = updated[mIdx].quiz?.questions[qIdx];
    if (!q) return;
    if (q.type === "mcq") {
      q.correctIndex = optIdx;
      q.correctIndices = [optIdx];
    } else {
      const set = new Set(q.correctIndices || []);
      if (set.has(optIdx)) {
        if (set.size > 1) set.delete(optIdx);
      } else {
        set.add(optIdx);
      }
      q.correctIndices = Array.from(set);
      q.correctIndex = q.correctIndices[0] ?? 0;
    }
    setModulesDraft(updated);
  };

  const addOptionToQuestion = (mIdx: number, qIdx: number) => {
    const updated = [...modulesDraft];
    const q = updated[mIdx].quiz?.questions[qIdx];
    if (!q) return;
    q.options.push(`Option ${q.options.length + 1}`);
    setModulesDraft(updated);
  };

  const removeOptionFromQuestion = (mIdx: number, qIdx: number, optIdx: number) => {
    const updated = [...modulesDraft];
    const q = updated[mIdx].quiz?.questions[qIdx];
    if (!q || q.options.length <= 2) return;
    q.options = q.options.filter((_, i) => i !== optIdx);
    q.correctIndices = (q.correctIndices || [])
      .filter((i) => i !== optIdx)
      .map((i) => (i > optIdx ? i - 1 : i));
    if (q.correctIndices.length === 0) q.correctIndices = [0];
    q.correctIndex = q.correctIndices[0];
    setModulesDraft(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg("Course title is required.");
      setCurrentStep(1);
      return;
    }
    if (!formData.category.trim()) {
      setErrorMsg("Course category is required.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const skillsArray = formData.skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const discountPercent =
      formData.originalPrice > formData.price
        ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
        : 0;

    const sanitizedModules = modulesDraft.map((m, mIdx) => ({
      ...m,
      lessons: m.lessons.map((l, lIdx) => ({
        ...l,
        duration: l.duration?.trim() || "10 mins",
      })),
    }));

    const { hoursLive: autoHours, formattedDuration: autoDuration } = computeTotalDurationFromModules(
      sanitizedModules
    );

    const payload: any = {
      title: formData.title.trim(),
      category: formData.category.trim(),
      level: formData.level,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || Number(formData.price),
      duration: autoDuration || formData.duration || "Self-Paced",
      durationWeeks: 0,
      hoursLive: autoHours || formData.hoursLive || 1,
      description: formData.description.trim(),
      thumbnail: formData.thumbnail.trim(),
      previewVideoUrl: formData.previewVideoUrl.trim(),
      skills: skillsArray,
      discountPercent,
      featured: Boolean(formData.featured),
      isUpcoming: Boolean(formData.isUpcoming),
      instructor: {
        name: formData.instructorName.trim(),
        title: formData.instructorTitle.trim(),
        avatar: formData.instructorAvatar.trim(),
      },
      capstoneTitle: formData.capstoneTitle.trim(),
      capstoneDesc: formData.capstoneDesc.trim(),
    };

    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse._id, payload);
      } else {
        // Multi-Step Curriculum formatting
        const formattedModules = modulesDraft.map((m, mIndex) => ({
          moduleNumber: m.moduleNumber.trim() || `Module 0${mIndex + 1}`,
          title: m.title.trim() || `Module ${mIndex + 1}`,
          order: mIndex,
          lessons: m.lessons.map((l, lIndex) => ({
            lessonNumber: l.lessonNumber.trim() || `${mIndex + 1}.${lIndex + 1}`,
            title: l.title.trim() || `Lesson ${lIndex + 1}`,
            duration: l.duration.trim() || "10 mins",
            videoUrl: l.videoUrl.trim(),
            overview: l.overviewText.split(",").map((o) => o.trim()).filter(Boolean),
            takeaways: l.takeawayTitle
              ? [{ title: l.takeawayTitle.trim(), desc: l.takeawayDesc.trim() || l.takeawayTitle.trim() }]
              : [],
            order: lIndex,
          })),
        }));

        const created: any = await adminService.createCourseWithCurriculum({
          ...payload,
          modules: formattedModules,
        });

        // Auto-save any module quizzes defined during course creation
        if (created?.course?._id && Array.isArray(created?.modules)) {
          for (let i = 0; i < modulesDraft.length; i++) {
            const modDraft = modulesDraft[i];
            const createdMod = created.modules[i];
            if (modDraft.quiz?.hasQuiz && modDraft.quiz.questions.length > 0 && createdMod?._id) {
              try {
                await adminService.saveModuleTest(created.course._id, createdMod._id, {
                  title: modDraft.quiz.title || `${modDraft.title} Quiz`,
                  timeLimitMinutes: Number(modDraft.quiz.timeLimitMinutes) || 10,
                  passingScore: Number(modDraft.quiz.passingScore) || 75,
                  isOptional: Boolean(modDraft.quiz.isOptional),
                  questions: modDraft.quiz.questions.map((q) => ({
                    question: q.question.trim(),
                    codeSnippet: q.codeSnippet?.trim() || "",
                    type: q.type,
                    options: q.options.map((o) => o.trim()),
                    correctIndex: q.type === "mcq" ? q.correctIndex : (q.correctIndices[0] ?? 0),
                    correctIndices: q.type === "msq" ? q.correctIndices : [q.correctIndex],
                    explanation: q.explanation?.trim() || "",
                  })),
                });
              } catch (quizErr) {
                console.warn("Could not auto-save module quiz:", quizErr);
              }
            }
          }
        }
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    setIsSubmitting(true);
    try {
      await adminService.deleteCourse(deletingCourse._id);
      setDeletingCourse(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "All" || c.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalDraftLessons = modulesDraft.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <AdminLayout
      title="Course Catalog & Curriculum Management"
      subtitle="Publish, modify, and build order-by-order curriculum with dynamic DB categories"
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-md">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              title="Refresh Courses"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setCatModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-stone-500" />
              <span>+ Add Category</span>
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D3536] text-white text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl border bg-red-50 border-red-200 text-red-800 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Courses Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Course Info</th>
                  <th className="py-3 px-4">Category & Level</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Curriculum</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      Loading courses...
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No courses found. Click "Create New Course" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=120"}
                            alt={c.title}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 line-clamp-1">{c.title}</div>
                            <div className="text-[11px] text-stone-400 line-clamp-1">{c.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700 mr-1.5 border border-stone-200">
                          {c.category}
                        </span>
                        <span className="text-[10px] text-stone-400">{c.level}</span>
                      </td>
                      <td className="py-3 px-4 text-stone-700">{c.duration}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">₹{c.price}</div>
                        {c.originalPrice > c.price && (
                          <div className="text-[10px] text-stone-400 line-through">₹{c.originalPrice}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-stone-700 font-medium">
                          {c.lessonCount || 0} lessons
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openQuizModal(c)}
                            className="p-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 hover:text-purple-900 rounded-lg border border-purple-200 transition-colors flex items-center gap-1"
                            title="Manage Course & Module Quizzes / Assessments"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-[10px] font-semibold hidden sm:inline">Quizzes</span>
                          </button>
                          <button
                            onClick={() => openCouponModal(c)}
                            className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
                            title="Manage Course Coupons & Discounts"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold hidden sm:inline">Coupons</span>
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg border border-stone-200"
                            title="Edit Course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCourse(c)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Add Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Create New Category</span>
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="e.g. Generative AI, LLMs, and prompt engineering"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCat}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#2D3536] text-white hover:bg-stone-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isCreatingCat ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Step Course Creation / Edit Wizard Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/50">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{editingCourse ? "Edit Course Details" : "Order-by-Order Course Creator"}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  {editingCourse
                    ? "Update existing course parameters"
                    : "Step-by-step curriculum and collection generator"}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Wizard Bar (for Create mode) */}
            {!editingCourse && (
              <div className="grid grid-cols-4 border-b border-stone-200 bg-stone-50/80 text-xs text-stone-600 font-medium">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`py-2.5 px-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    currentStep === 1
                      ? "border-emerald-600 text-emerald-700 font-bold bg-white"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1. General</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={`py-2.5 px-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    currentStep === 2
                      ? "border-emerald-600 text-emerald-700 font-bold bg-white"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>2. Pricing & Lead</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={`py-2.5 px-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    currentStep === 3
                      ? "border-emerald-600 text-emerald-700 font-bold bg-white"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>3. Curriculum ({totalDraftLessons})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className={`py-2.5 px-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    currentStep === 4
                      ? "border-emerald-600 text-emerald-700 font-bold bg-white"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>4. Review</span>
                </button>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* ================= STEP 1: GENERAL INFO ================= */}
              {(currentStep === 1 || editingCourse) && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-stone-800 flex items-center gap-2 pb-2 border-b border-stone-100">
                    <BookOpen className="w-4 h-4 text-stone-500" />
                    <span>Basic Course Information & Category</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Advanced Performance Marketing & Growth Systems"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                          Course Category (From DB) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setCatModalOpen(true)}
                          className="text-[10px] text-emerald-600 font-semibold hover:underline"
                        >
                          + New
                        </button>
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Proficiency Level *
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as Course["level"] })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      >
                        <option value="Beginner-Friendly">Beginner-Friendly</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Course Description * (min 10 chars)
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Comprehensive synopsis of what the learner will achieve..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Course Thumbnail Image URL
                      </label>
                      <input
                        type="text"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Preview Video URL (Demo / Trailer)
                      </label>
                      <input
                        type="text"
                        value={formData.previewVideoUrl}
                        onChange={(e) => setFormData({ ...formData, previewVideoUrl: e.target.value })}
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Skills Mastered (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.skillsText}
                      onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
                      placeholder="e.g. Google Ads, Meta Ads Manager, GA4, Conversion Funnels"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                    />
                  </div>
                </div>
              )}

              {/* ================= STEP 2: PRICING & INSTRUCTOR ================= */}
              {(currentStep === 2 || editingCourse) && (
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-semibold text-stone-800 flex items-center gap-2 pb-2 border-b border-stone-100">
                    <DollarSign className="w-4 h-4 text-stone-500" />
                    <span>Pricing, Instructor, and Capstone Project</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Offer Price (₹) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Original Price (₹) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Instructor Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.instructorName}
                        onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Instructor Title
                      </label>
                      <input
                        type="text"
                        value={formData.instructorTitle}
                        onChange={(e) => setFormData({ ...formData, instructorTitle: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Instructor Avatar URL
                      </label>
                      <input
                        type="text"
                        value={formData.instructorAvatar}
                        onChange={(e) => setFormData({ ...formData, instructorAvatar: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Capstone Project Title
                    </label>
                    <input
                      type="text"
                      value={formData.capstoneTitle}
                      onChange={(e) => setFormData({ ...formData, capstoneTitle: e.target.value })}
                      placeholder="e.g. End-to-End Analytics Pipeline Deployment"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Capstone Project Description
                    </label>
                    <input
                      type="text"
                      value={formData.capstoneDesc}
                      onChange={(e) => setFormData({ ...formData, capstoneDesc: e.target.value })}
                      placeholder="e.g. Build and deploy a portfolio-ready project showcasing complete mastery"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded-sm border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Featured on Landing Page</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isUpcoming}
                        onChange={(e) => setFormData({ ...formData, isUpcoming: e.target.checked })}
                        className="rounded-sm border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Upcoming Batch / Pre-launch</span>
                    </label>
                  </div>
                </div>
              )}

              {/* ================= STEP 3: CURRICULUM BUILDER ================= */}
              {currentStep === 3 && !editingCourse && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-stone-500" />
                      <span>Modules & Lessons Builder ({modulesDraft.length} Modules, {totalDraftLessons} Lessons)</span>
                    </div>
                    <button
                      type="button"
                      onClick={addModule}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Module</span>
                    </button>
                  </div>

                  {modulesDraft.map((mod, mIdx) => (
                    <div key={mIdx} className="bg-stone-50 border border-stone-200/90 rounded-xl p-4 space-y-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={mod.moduleNumber}
                            onChange={(e) => updateModuleField(mIdx, "moduleNumber", e.target.value)}
                            placeholder="e.g. Module 01"
                            className="w-28 px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-200 rounded-lg text-stone-800"
                          />
                          <input
                            type="text"
                            value={mod.title}
                            onChange={(e) => updateModuleField(mIdx, "title", e.target.value)}
                            placeholder="Module Title..."
                            className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-stone-200 rounded-lg text-stone-900"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => addLessonToModule(mIdx)}
                            className="px-2.5 py-1 text-[11px] bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 rounded-lg font-medium"
                          >
                            + Add Lesson
                          </button>
                          {modulesDraft.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeModule(mIdx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Delete Module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lessons List in Module */}
                      <div className="pl-3 border-l-2 border-stone-200 space-y-2.5">
                        {mod.lessons.map((lesson, lIdx) => (
                          <div
                            key={lIdx}
                            className="bg-white border border-stone-200 rounded-lg p-3 space-y-2 shadow-2xs"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] text-stone-400 font-semibold uppercase">No.</label>
                                <input
                                  type="text"
                                  value={lesson.lessonNumber}
                                  onChange={(e) => updateLessonField(mIdx, lIdx, "lessonNumber", e.target.value)}
                                  className="w-full px-2 py-1 text-xs bg-stone-50 border border-stone-200 rounded-md"
                                />
                              </div>
                              <div className="sm:col-span-9">
                                <label className="block text-[10px] text-stone-400 font-semibold uppercase">Title</label>
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => updateLessonField(mIdx, lIdx, "title", e.target.value)}
                                  placeholder="Lesson Title..."
                                  className="w-full px-2 py-1 text-xs bg-stone-50 border border-stone-200 rounded-md font-medium text-stone-900"
                                />
                              </div>
                              <div className="sm:col-span-1 flex items-end justify-end">
                                {mod.lessons.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeLessonFromModule(mIdx, lIdx)}
                                    className="p-1 text-stone-400 hover:text-red-600 rounded-md"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] text-stone-400 font-semibold uppercase">Video URL (YouTube/Vimeo/MP4)</label>
                                  {probingVideoKeys[`${mIdx}-${lIdx}`] ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Detecting duration...
                                    </span>
                                  ) : lesson.duration ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                      <Clock className="w-3 h-3" />
                                      Auto Duration: {lesson.duration}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="relative flex items-center">
                                  <input
                                    type="text"
                                    value={lesson.videoUrl}
                                    onChange={(e) => handleVideoUrlChange(mIdx, lIdx, e.target.value)}
                                    onBlur={() => {
                                      if (lesson.videoUrl && !lesson.duration) {
                                        handleRecheckDuration(mIdx, lIdx, lesson.videoUrl);
                                      }
                                    }}
                                    placeholder="Paste video URL to auto-detect duration..."
                                    className="w-full px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md font-mono pr-7"
                                  />
                                  {lesson.videoUrl && !probingVideoKeys[`${mIdx}-${lIdx}`] && (
                                    <button
                                      type="button"
                                      onClick={() => handleRecheckDuration(mIdx, lIdx, lesson.videoUrl)}
                                      title="Re-check video duration"
                                      className="absolute right-1.5 p-1 text-stone-400 hover:text-stone-700 rounded-md"
                                    >
                                      <RotateCw className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] text-stone-400 font-semibold uppercase">Overview Points (Comma-separated)</label>
                                <input
                                  type="text"
                                  value={lesson.overviewText}
                                  onChange={(e) => updateLessonField(mIdx, lIdx, "overviewText", e.target.value)}
                                  placeholder="Point 1, Point 2, Point 3"
                                  className="w-full px-2 py-1 text-xs bg-stone-50 border border-stone-200 rounded-md"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Module Quiz / Assessment Section */}
                      <div className="pt-2 border-t border-stone-200/60">
                        {!mod.quiz?.hasQuiz ? (
                          <div className="flex items-center justify-between bg-purple-50/60 border border-purple-200/80 rounded-xl p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                                <HelpCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-stone-900">Module Assessment (MCQ & MSQ)</div>
                                <div className="text-[11px] text-stone-500">Test learners on this module before advancing to the next.</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleModuleQuiz(mIdx)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Module Quiz</span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white border border-purple-200 rounded-xl p-3.5 space-y-3.5 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded-md bg-purple-100 text-purple-700">
                                  <Award className="w-3.5 h-3.5" />
                                </span>
                                <span className="text-xs font-bold text-stone-900">
                                  Module Quiz Settings ({mod.quiz.questions.length} Questions)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleModuleQuiz(mIdx)}
                                className="text-[11px] text-red-500 hover:text-red-700 hover:underline"
                              >
                                Remove Quiz
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div className="sm:col-span-1">
                                <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-1">Quiz Title</label>
                                <input
                                  type="text"
                                  value={mod.quiz.title}
                                  onChange={(e) => updateQuizField(mIdx, "title", e.target.value)}
                                  placeholder="e.g. Module 1 Knowledge Check"
                                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg font-medium"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-1">Time Limit (Mins)</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={mod.quiz.timeLimitMinutes}
                                  onChange={(e) => updateQuizField(mIdx, "timeLimitMinutes", Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg font-medium"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-1">Passing Score (%)</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={mod.quiz.passingScore}
                                  onChange={(e) => updateQuizField(mIdx, "passingScore", Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg font-medium"
                                />
                              </div>
                            </div>
                            {/* Optional toggle */}
                            <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
                              <input
                                type="checkbox"
                                checked={Boolean(mod.quiz.isOptional)}
                                onChange={(e) => updateQuizField(mIdx, "isOptional", e.target.checked)}
                                className="w-3.5 h-3.5 rounded accent-purple-600"
                              />
                              <span className="text-[10px] font-semibold text-stone-600">
                                Optional — students can skip this quiz to proceed
                              </span>
                            </label>

                            {/* Questions list */}
                            <div className="space-y-3 pt-1">
                              {mod.quiz.questions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-stone-50/70 border border-stone-200 rounded-xl p-3 space-y-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-stone-700 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                                        Q{qIdx + 1}
                                      </span>
                                      {/* MCQ / MSQ toggle */}
                                      <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-white text-[11px]">
                                        <button
                                          type="button"
                                          onClick={() => updateQuestionField(mIdx, qIdx, "type", "mcq")}
                                          className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                                            q.type === "mcq"
                                              ? "bg-purple-600 text-white"
                                              : "text-stone-600 hover:text-stone-900"
                                          }`}
                                        >
                                          Single Choice (MCQ)
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => updateQuestionField(mIdx, qIdx, "type", "msq")}
                                          className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                                            q.type === "msq"
                                              ? "bg-purple-600 text-white"
                                              : "text-stone-600 hover:text-stone-900"
                                          }`}
                                        >
                                          Multi-Selection (MSQ)
                                        </button>
                                      </div>
                                    </div>

                                    {mod.quiz!.questions.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeQuestionFromQuiz(mIdx, qIdx)}
                                        className="p-1 text-stone-400 hover:text-red-600 rounded-md"
                                        title="Delete Question"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  <div>
                                    <input
                                      type="text"
                                      value={q.question}
                                      onChange={(e) => updateQuestionField(mIdx, qIdx, "question", e.target.value)}
                                      placeholder="Question prompt..."
                                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-medium text-stone-900"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-0.5">Code Snippet (Optional)</label>
                                    <textarea
                                      rows={2}
                                      value={q.codeSnippet}
                                      onChange={(e) => updateQuestionField(mIdx, qIdx, "codeSnippet", e.target.value)}
                                      placeholder="e.g. const [state, setState] = useState(null);"
                                      className="w-full px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-lg font-mono text-stone-800"
                                    />
                                  </div>

                                  {/* Options */}
                                  <div className="space-y-1.5">
                                    <div className="text-[10px] text-stone-500 font-semibold uppercase">
                                      Answer Options (Click {q.type === "mcq" ? "radio" : "checkbox"} to select correct answer{q.type === "msq" ? "s" : ""})
                                    </div>
                                    {q.options.map((opt, optIdx) => {
                                      const isCorrect = q.type === "mcq" ? q.correctIndex === optIdx : (q.correctIndices || []).includes(optIdx);
                                      return (
                                        <div
                                          key={optIdx}
                                          className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${
                                            isCorrect ? "bg-emerald-50/70 border-emerald-300" : "bg-white border-stone-200"
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => toggleOptionCorrectness(mIdx, qIdx, optIdx)}
                                            className="p-1 rounded-md text-stone-500 hover:text-emerald-600 transition-colors"
                                          >
                                            {q.type === "mcq" ? (
                                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                isCorrect ? "border-emerald-600" : "border-stone-300"
                                              }`}>
                                                {isCorrect && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                                              </div>
                                            ) : isCorrect ? (
                                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                              <Square className="w-4 h-4 text-stone-400" />
                                            )}
                                          </button>
                                          <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                              const updated = [...modulesDraft];
                                              updated[mIdx].quiz!.questions[qIdx].options[optIdx] = e.target.value;
                                              setModulesDraft(updated);
                                            }}
                                            placeholder={`Option ${optIdx + 1}...`}
                                            className="flex-1 px-2 py-1 text-xs bg-transparent border-0 focus:outline-hidden text-stone-900 font-medium"
                                          />
                                          {isCorrect && (
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                              Correct
                                            </span>
                                          )}
                                          {q.options.length > 2 && (
                                            <button
                                              type="button"
                                              onClick={() => removeOptionFromQuestion(mIdx, qIdx, optIdx)}
                                              className="p-1 text-stone-300 hover:text-red-500"
                                            >
                                              ✕
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                    <div className="pt-1 flex items-center justify-between">
                                      <button
                                        type="button"
                                        onClick={() => addOptionToQuestion(mIdx, qIdx)}
                                        className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Option</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-0.5">Explanation for Learners</label>
                                    <input
                                      type="text"
                                      value={q.explanation}
                                      onChange={(e) => updateQuestionField(mIdx, qIdx, "explanation", e.target.value)}
                                      placeholder="Shown when students review the quiz..."
                                      className="w-full px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
                                    />
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => addQuestionToQuiz(mIdx)}
                                className="w-full py-2 border-2 border-dashed border-purple-200 hover:border-purple-300 text-purple-700 text-xs font-semibold rounded-xl bg-purple-50/40 hover:bg-purple-50 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Another Question to Module {mIdx + 1} Quiz</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= STEP 4: REVIEW & PUBLISH ================= */}
              {currentStep === 4 && !editingCourse && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-stone-800 flex items-center gap-2 pb-2 border-b border-stone-100">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Review Course & Curriculum Summary Before Publishing</span>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=200"}
                        alt={formData.title}
                        className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 mr-2">
                          {formData.category}
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">{formData.level}</span>
                        <h4 className="text-sm font-bold text-stone-900 mt-1">{formData.title || "Untitled Course"}</h4>
                        <div className="text-xs font-semibold text-emerald-700 mt-1">
                          ₹{formData.price}{" "}
                          {formData.originalPrice > formData.price && (
                            <span className="text-[10px] text-stone-400 line-through">₹{formData.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200 text-xs">
                      <div>
                        <span className="text-stone-400 text-[10px] block uppercase font-semibold">Duration</span>
                        <span className="font-semibold text-stone-800">
                          {computeTotalDurationFromModules(modulesDraft).formattedDuration || "Self-Paced"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block uppercase font-semibold">Instructor</span>
                        <span className="font-semibold text-stone-800">{formData.instructorName}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block uppercase font-semibold">Modules</span>
                        <span className="font-semibold text-stone-800">{modulesDraft.length} Modules</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block uppercase font-semibold">Total Lessons</span>
                        <span className="font-semibold text-stone-800">{totalDraftLessons} Lessons</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed">
                    Clicking <strong>"Publish Course & Curriculum"</strong> will create the <strong>Course</strong> record, generate all child <strong>Module</strong> documents, and save all <strong>Lesson</strong> documents directly into their respective MongoDB collections.
                  </div>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                {!editingCourse ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep > 1) setCurrentStep((s) => (s - 1) as any);
                        else setModalOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{currentStep === 1 ? "Cancel" : "Previous Step"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {currentStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep((s) => (s + 1) as any)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#2D3536] text-white hover:bg-stone-800 rounded-xl transition-colors shadow-xs"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isSubmitting ? "Publishing to DB..." : "Publish Course & Curriculum"}</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-end gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 text-xs font-bold bg-[#2D3536] text-white hover:bg-stone-800 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Update Course"}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Coupons Modal (Peria Modal) */}
      {couponCourse && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Course Coupons &amp; Discounts
                  </h3>
                  <p className="text-xs text-stone-500">
                    {couponCourse.title} • Current Price:{" "}
                    <span className="font-semibold text-stone-800">₹{couponCourse.price}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCouponCourse(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Feedback Banner */}
            {couponFeedback && (
              <div
                className={`px-5 py-3 text-xs flex items-center justify-between border-b ${
                  couponFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                <span>{couponFeedback.message}</span>
                <button
                  onClick={() => setCouponFeedback(null)}
                  className="text-stone-400 hover:text-stone-700 font-bold ml-3"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Modal Content Split: Create Form (Left) & Existing Coupons (Right) */}
            <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Create Form */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Create New Coupon</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                        let rnd = "";
                        for (let i = 0; i < 6; i++) rnd += chars[Math.floor(Math.random() * chars.length)];
                        setCouponForm((prev) => ({ ...prev, code: rnd }));
                      }}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline"
                    >
                      🎲 Randomize Code
                    </button>
                  </div>

                  <form onSubmit={handleCreateCoupon} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) =>
                          setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                        }
                        placeholder="e.g. DSYHC (Leave blank to auto-generate)"
                        className="w-full px-3 py-2 text-xs font-mono tracking-wider uppercase bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                      />
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        If left blank, a random 6-character code will be generated.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Discount Type
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-stone-200/60 p-1 rounded-xl text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setCouponForm({ ...couponForm, discountType: "fixed" })}
                          className={`py-1.5 rounded-lg transition-all text-center ${
                            couponForm.discountType === "fixed"
                              ? "bg-white text-stone-900 shadow-xs"
                              : "text-stone-600 hover:text-stone-900"
                          }`}
                        >
                          Fixed Price
                        </button>
                        <button
                          type="button"
                          onClick={() => setCouponForm({ ...couponForm, discountType: "amount" })}
                          className={`py-1.5 rounded-lg transition-all text-center ${
                            couponForm.discountType === "amount"
                              ? "bg-white text-stone-900 shadow-xs"
                              : "text-stone-600 hover:text-stone-900"
                          }`}
                        >
                          ₹ Off
                        </button>
                        <button
                          type="button"
                          onClick={() => setCouponForm({ ...couponForm, discountType: "percentage" })}
                          className={`py-1.5 rounded-lg transition-all text-center ${
                            couponForm.discountType === "percentage"
                              ? "bg-white text-stone-900 shadow-xs"
                              : "text-stone-600 hover:text-stone-900"
                          }`}
                        >
                          % Off
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        {couponForm.discountType === "fixed"
                          ? "Final Price (₹) *"
                          : couponForm.discountType === "amount"
                          ? "Discount Amount (₹) *"
                          : "Discount Percentage (%) *"}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={couponForm.discountType === "percentage" ? 100 : undefined}
                        required
                        value={couponForm.discountValue}
                        onChange={(e) =>
                          setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })
                        }
                        placeholder={couponForm.discountType === "fixed" ? "Enter 0 for free enrollment" : "Value"}
                        className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400 font-semibold"
                      />
                    </div>

                    {/* Zero Cost Free Notice */}
                    {couponForm.discountType === "fixed" && Number(couponForm.discountValue) === 0 && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>100% Free Enrollment:</strong> Setting ₹0 lets learners bypass Razorpay and enroll instantly without entering payment details.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                          Max Uses
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={couponForm.maxUses}
                          onChange={(e) =>
                            setCouponForm({ ...couponForm, maxUses: e.target.value })
                          }
                          placeholder="Unlimited"
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={couponForm.expiresAt}
                          onChange={(e) =>
                            setCouponForm({ ...couponForm, expiresAt: e.target.value })
                          }
                          className="w-full px-2 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                        />
                      </div>
                    </div>

                    {/* Live Price Preview */}
                    <div className="p-3 bg-white rounded-xl border border-stone-200/80 text-xs flex items-center justify-between">
                      <span className="text-stone-500 text-[11px]">Learner Final Price:</span>
                      <span className="font-bold text-sm text-stone-900">
                        {(() => {
                          const val = Number(couponForm.discountValue) || 0;
                          let final = 0;
                          if (couponForm.discountType === "fixed") final = val;
                          else if (couponForm.discountType === "amount") final = Math.max(0, couponCourse.price - val);
                          else if (couponForm.discountType === "percentage")
                            final = Math.max(0, Math.round(couponCourse.price * (1 - val / 100)));

                          return final === 0 ? (
                            <span className="text-emerald-700 font-bold">₹0 (FREE ENROLLMENT)</span>
                          ) : (
                            `₹${final}`
                          );
                        })()}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingCoupon}
                      className="w-full py-2.5 px-4 bg-[#2D3536] hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isCreatingCoupon ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating Coupon...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Coupon</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Existing Coupons List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                    <span>Active Coupons</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-semibold">
                      {courseCoupons.length}
                    </span>
                  </h4>
                  <button
                    onClick={() => openCouponModal(couponCourse)}
                    disabled={isCouponsLoading}
                    className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Refresh coupons"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCouponsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {isCouponsLoading ? (
                  <div className="py-12 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                    <span>Loading course coupons...</span>
                  </div>
                ) : courseCoupons.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center gap-2 text-stone-400">
                    <Ticket className="w-8 h-8 text-stone-300" />
                    <span className="text-xs font-medium text-stone-600">No coupons found for this course</span>
                    <span className="text-[11px] text-stone-400 max-w-xs">
                      Generate a code using the form to offer discounts or 100% free enrollment to learners.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {courseCoupons
                      .filter((coupon): coupon is CouponItem => Boolean(coupon && coupon._id))
                      .map((coupon) => (
                      <div
                        key={coupon._id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 ${
                          coupon.isActive
                            ? "bg-white border-stone-200 shadow-xs"
                            : "bg-stone-50/70 border-stone-200/60 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-stone-900 tracking-wider bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(coupon.code, coupon._id)}
                              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                              title="Copy code"
                            >
                              {copiedCouponId === coupon._id ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCoupon(coupon._id)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                                coupon.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                              }`}
                              title={coupon.isActive ? "Click to deactivate" : "Click to activate"}
                            >
                              {coupon.isActive ? "Active" : "Inactive"}
                            </button>

                            <button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
                          <div>
                            {coupon.discountType === "fixed" ? (
                              coupon.discountValue === 0 ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  FREE ENROLLMENT (₹0)
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                                  Fixed Price: ₹{coupon.discountValue}
                                </span>
                              )
                            ) : coupon.discountType === "amount" ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                                ₹{coupon.discountValue} OFF
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                                {coupon.discountValue}% OFF
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-stone-400">
                            Used: <strong className="text-stone-700">{coupon.usedCount}</strong> /{" "}
                            {coupon.maxUses ? coupon.maxUses : "∞"}
                            {coupon.expiresAt && (
                              <span className="ml-2">
                                • Exp: {new Date(coupon.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course & Module Quizzes Studio Modal */}
      {quizModalOpen && quizCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-5xl bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 line-clamp-1">
                      Assessment & Quiz Studio
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 hidden sm:inline-block">
                      Udemy Standard
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    {quizCourse.title} • Module-by-Module Tests & Final Certification Exam
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuizModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-0">
              {/* Left Column: Modules & Final Exam Selector */}
              <div className="md:col-span-4 border-r border-stone-200 bg-stone-50/60 p-4 overflow-y-auto space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Certification Exam
                  </div>
                  {(() => {
                    const finalTest = quizTests.find((t) => !t.moduleId);
                    const isSelected = selectedTargetId === "course_final";
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          loadDraftForTarget("course_final", quizModules, quizTests, quizCourse.title)
                        }
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-white border-purple-400 shadow-xs ring-1 ring-purple-300"
                            : "bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Award className={`w-4 h-4 ${isSelected ? "text-purple-600" : "text-stone-400"}`} />
                          <div>
                            <div className="text-xs font-bold text-stone-900">Course Final Exam</div>
                            <div className="text-[10px] text-stone-400">Awards Verified Certificate</div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            finalTest
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-stone-100 text-stone-500 border-stone-200"
                          }`}
                        >
                          {finalTest ? `${finalTest.questions?.length || 0} Qs` : "Not Added"}
                        </span>
                      </button>
                    );
                  })()}
                </div>

                <div>
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Module Assessments ({quizModules.length} Modules)
                  </div>
                  {isQuizzesLoading ? (
                    <div className="py-6 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Loading curriculum...</span>
                    </div>
                  ) : quizModules.length === 0 ? (
                    <div className="p-3 text-center text-xs text-stone-400 bg-white rounded-xl border border-stone-200">
                      No modules found in this course.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quizModules.map((mod, idx) => {
                        const existingTest = quizTests.find((t) => t.moduleId === mod._id);
                        const isSelected = selectedTargetId === mod._id;
                        return (
                          <button
                            key={mod._id}
                            type="button"
                            onClick={() =>
                              loadDraftForTarget(mod._id, quizModules, quizTests, quizCourse.title)
                            }
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? "bg-white border-purple-400 shadow-xs ring-1 ring-purple-300"
                                : "bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold text-stone-400 uppercase">
                                {mod.moduleNumber || `Module 0${idx + 1}`}
                              </div>
                              <div className="text-xs font-semibold text-stone-900 truncate">
                                {mod.title}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                                existingTest
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-stone-100 text-stone-500 border-stone-200"
                              }`}
                            >
                              {existingTest ? `${existingTest.questions?.length || 0} Qs` : "No Quiz"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Quiz Editor */}
              <div className="md:col-span-8 p-5 overflow-y-auto space-y-4 bg-white flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Target Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {selectedTargetId === "course_final" ? "Final Certification Test" : "Module Assessment"}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 mt-1">
                        {selectedTargetId === "course_final"
                          ? `${quizCourse.title} Final Exam`
                          : quizModules.find((m) => m._id === selectedTargetId)?.title || "Module Quiz"}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingQuizDraft.hasQuiz}
                          onChange={(e) =>
                            setEditingQuizDraft((prev) => ({ ...prev, hasQuiz: e.target.checked }))
                          }
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-stone-300"
                        />
                        <span>Enable Quiz</span>
                      </label>
                    </div>
                  </div>

                  {/* Feedback Message Banner */}
                  {quizFeedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        quizFeedback.type === "success"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {quizFeedback.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span>{quizFeedback.message}</span>
                      </div>
                      <button
                        onClick={() => setQuizFeedback(null)}
                        className="text-stone-400 hover:text-stone-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {!editingQuizDraft.hasQuiz ? (
                    <div className="py-12 text-center bg-stone-50/70 rounded-2xl border border-dashed border-stone-200 p-6 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <h5 className="text-xs font-bold text-stone-800">No Assessment Active</h5>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Learners can progress past this section without a test. Enable quiz to add MCQ & MSQ questions.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingQuizDraft((prev) => ({ ...prev, hasQuiz: true }))}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Enable & Build Quiz</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Quiz Settings Bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/80">
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-1">
                            Assessment Title *
                          </label>
                          <input
                            type="text"
                            value={editingQuizDraft.title}
                            onChange={(e) =>
                              setEditingQuizDraft((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="e.g. Core Concepts & Practical MCQ Test"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-medium text-stone-900"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-1">
                            Time Limit (Minutes)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={editingQuizDraft.timeLimitMinutes}
                            onChange={(e) =>
                              setEditingQuizDraft((prev) => ({
                                ...prev,
                                timeLimitMinutes: Number(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-medium text-stone-900"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-1">
                            Passing Score (%)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={editingQuizDraft.passingScore}
                            onChange={(e) =>
                              setEditingQuizDraft((prev) => ({
                                ...prev,
                                passingScore: Number(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-medium text-stone-900"
                          />
                        </div>
                        {/* Optional toggle — only shown for module tests, not final exam */}
                        {selectedTargetId !== "course_final" && (
                          <div className="sm:col-span-12">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(editingQuizDraft.isOptional)}
                                onChange={(e) =>
                                  setEditingQuizDraft((prev) => ({ ...prev, isOptional: e.target.checked }))
                                }
                                className="w-4 h-4 rounded accent-purple-600"
                                id="quizOptionalToggle"
                              />
                              <div>
                                <span className="text-xs font-semibold text-stone-800">Optional Assessment</span>
                                <p className="text-[10px] text-stone-500 mt-0.5">
                                  If checked, students can skip this quiz and proceed to the next module without completing it.
                                </p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Questions List */}
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <FileQuestion className="w-4 h-4 text-purple-600" />
                            <span>Questions ({editingQuizDraft.questions.length})</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleAddQuestionToModalDraft}
                            className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Question</span>
                          </button>
                        </div>

                        {editingQuizDraft.questions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3 shadow-2xs"
                          >
                            {/* Question Header & Type Switcher */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-stone-800 bg-white px-2.5 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                                  Q{qIdx + 1}
                                </span>

                                {/* MCQ vs MSQ Switcher */}
                                <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQuestionInModalDraft(qIdx, "type", "mcq")}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                                      q.type === "mcq"
                                        ? "bg-purple-600 text-white shadow-2xs"
                                        : "text-stone-600 hover:text-stone-900"
                                    }`}
                                  >
                                    <span>Single Choice (MCQ)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQuestionInModalDraft(qIdx, "type", "msq")}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                                      q.type === "msq"
                                        ? "bg-purple-600 text-white shadow-2xs"
                                        : "text-stone-600 hover:text-stone-900"
                                    }`}
                                  >
                                    <span>Multi-Selection (MSQ)</span>
                                  </button>
                                </div>
                              </div>

                              {editingQuizDraft.questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestionFromModalDraft(qIdx)}
                                  className="p-1 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Question Text */}
                            <div>
                              <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-1">
                                Question Prompt *
                              </label>
                              <textarea
                                rows={2}
                                value={q.question}
                                onChange={(e) =>
                                  handleUpdateQuestionInModalDraft(qIdx, "question", e.target.value)
                                }
                                placeholder="Write the question prompt here..."
                                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 font-medium"
                              />
                            </div>

                            {/* Optional Code Snippet */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] text-stone-400 font-semibold uppercase">
                                  Code Snippet (Optional)
                                </label>
                                <span className="text-[10px] text-stone-400 font-mono">Syntax block</span>
                              </div>
                              <textarea
                                rows={2}
                                value={q.codeSnippet}
                                onChange={(e) =>
                                  handleUpdateQuestionInModalDraft(qIdx, "codeSnippet", e.target.value)
                                }
                                placeholder="e.g. function calculateProgress(completed, total) { return (completed / total) * 100; }"
                                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-mono text-stone-800"
                              />
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-2">
                              <div className="text-[10px] text-stone-500 font-semibold uppercase flex items-center justify-between">
                                <span>
                                  Answer Options (Click {q.type === "mcq" ? "radio circle" : "checkbox"} to mark correct answer{q.type === "msq" ? "s" : ""})
                                </span>
                                <span className="text-stone-400 font-normal">Min 2 options</span>
                              </div>

                              <div className="space-y-1.5">
                                {q.options.map((opt, optIdx) => {
                                  const isCorrect =
                                    q.type === "mcq"
                                      ? q.correctIndex === optIdx
                                      : (q.correctIndices || []).includes(optIdx);

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
                                        isCorrect
                                          ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200"
                                          : "bg-white border-stone-200"
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => handleToggleModalOptionCorrectness(qIdx, optIdx)}
                                        className="p-1 rounded-md text-stone-500 hover:text-emerald-600 transition-colors"
                                        title={
                                          isCorrect
                                            ? "Marked as correct answer"
                                            : "Click to mark as correct answer"
                                        }
                                      >
                                        {q.type === "mcq" ? (
                                          <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                              isCorrect ? "border-emerald-600" : "border-stone-300"
                                            }`}
                                          >
                                            {isCorrect && (
                                              <div className="w-2 h-2 rounded-full bg-emerald-600" />
                                            )}
                                          </div>
                                        ) : isCorrect ? (
                                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                          <Square className="w-4 h-4 text-stone-400" />
                                        )}
                                      </button>

                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const opts = [...q.options];
                                          opts[optIdx] = e.target.value;
                                          handleUpdateQuestionInModalDraft(qIdx, "options", opts);
                                        }}
                                        placeholder={`Option ${optIdx + 1} text...`}
                                        className="flex-1 px-2 py-1 text-xs bg-transparent border-0 focus:outline-hidden text-stone-900 font-medium"
                                      />

                                      {isCorrect && (
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                          Correct
                                        </span>
                                      )}

                                      {q.options.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveOptionFromModalQuestion(qIdx, optIdx)}
                                          className="p-1 text-stone-300 hover:text-red-500 rounded-md"
                                          title="Remove this option"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddOptionToModalQuestion(qIdx)}
                                className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 pt-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Another Option</span>
                              </button>
                            </div>

                            {/* Explanation */}
                            <div>
                              <label className="block text-[10px] text-stone-400 font-semibold uppercase mb-1">
                                Explanation for Learners (Shown upon submission)
                              </label>
                              <input
                                type="text"
                                value={q.explanation}
                                onChange={(e) =>
                                  handleUpdateQuestionInModalDraft(qIdx, "explanation", e.target.value)
                                }
                                placeholder="Explain why the marked answer is correct..."
                                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddQuestionToModalDraft}
                          className="w-full py-2.5 border-2 border-dashed border-purple-200 hover:border-purple-300 text-purple-700 text-xs font-semibold rounded-xl bg-purple-50/40 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Another Question to this Assessment</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Save / Delete Bar */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3 mt-4">
                  {quizTests.some((t) =>
                    selectedTargetId === "course_final"
                      ? !t.moduleId
                      : t.moduleId === selectedTargetId
                  ) ? (
                    <button
                      type="button"
                      onClick={handleDeleteModalQuiz}
                      disabled={isSavingQuiz}
                      className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                    >
                      Delete Test
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setQuizModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                    {editingQuizDraft.hasQuiz && (
                      <button
                        type="button"
                        onClick={handleSaveModalQuiz}
                        disabled={isSavingQuiz}
                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs disabled:opacity-50"
                      >
                        {isSavingQuiz ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving Quiz...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Assessment</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Dialog */}
      {deletingCourse && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Delete Course?</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-stone-800">{deletingCourse.title}</span>? All
              associated modules, lessons, and tests will be removed immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
