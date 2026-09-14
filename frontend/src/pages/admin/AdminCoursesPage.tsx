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
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { courseService, adminService, categoryService } from "@/services/apiClient";
import { Course, CategoryItem } from "@/types";

interface LessonDraft {
  lessonNumber: string;
  title: string;
  duration: string;
  videoUrl: string;
  overviewText: string;
  takeawayTitle: string;
  takeawayDesc: string;
}

interface ModuleDraft {
  moduleNumber: string;
  title: string;
  lessons: LessonDraft[];
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

        await adminService.createCourseWithCurriculum({
          ...payload,
          modules: formattedModules,
        });
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
