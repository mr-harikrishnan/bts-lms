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
  ExternalLink,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { courseService, adminService } from "@/services/apiClient";
import { Course } from "@/types";

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "Web Development" as Course["category"],
    level: "Beginner-Friendly" as Course["level"],
    price: 0,
    originalPrice: 0,
    duration: "8 Weeks",
    description: "",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
    capstoneTitle: "Final Portfolio Project",
    capstoneDesc: "Deploy a production-ready application to prove mastery.",
  });

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const list = await courseService.getAll();
      setCourses(list);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
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
    setFormData({
      title: "",
      category: "Web Development",
      level: "Beginner-Friendly",
      price: 1999,
      originalPrice: 3999,
      duration: "8 Weeks",
      description: "",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
      capstoneTitle: "Final Portfolio Project",
      capstoneDesc: "Deploy a production-ready application to prove mastery.",
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      title: c.title,
      category: c.category,
      level: c.level,
      price: c.price,
      originalPrice: c.originalPrice,
      duration: c.duration,
      description: c.description,
      thumbnail: c.thumbnail,
      capstoneTitle: c.capstoneTitle || "Final Portfolio Project",
      capstoneDesc: c.capstoneDesc || "Deploy a production-ready project to prove mastery.",
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg("Course title is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse._id, formData);
      } else {
        await adminService.createCourse({
          ...formData,
          instructor: {
            name: "DLABS Lead Instructor",
            title: "Senior Curriculum Specialist",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
          },
          modules: [],
        });
      }
      setModalOpen(false);
      await loadCourses();
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
      await loadCourses();
    } catch (err: any) {
      alert(err?.message || "Failed to delete course.");
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

  return (
    <AdminLayout
      title="Course Catalog Management"
      subtitle="Publish, modify, and manage courses across all skill disciplines"
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
              <option value="Web Development">Web Development</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Content Creation">Content Creation</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadCourses}
              disabled={isLoading}
              className="p-2 rounded-xl text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              title="Refresh Courses"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
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

        {/* Courses Table / Cards */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Course Info</th>
                  <th className="py-3 px-4">Category & Level</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Modules</th>
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
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((c) => (
                    <tr key={c._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail}
                            alt={c.title}
                            className="w-12 h-9 object-cover rounded-lg bg-stone-100 border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-stone-900">{c.title}</div>
                            <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                              {c.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-stone-800">{c.category}</span>
                          <span className="text-[10px] text-stone-500">{c.level}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-700">{c.duration}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 font-mono">
                          {c.price === 0 ? "FREE" : `₹${c.price}`}
                        </div>
                        {c.originalPrice > c.price && (
                          <div className="text-[10px] text-stone-400 line-through font-mono">
                            ₹{c.originalPrice}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600">
                        {c.modules?.length || 0} modules
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            title="Edit Course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCourse(c)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No courses match your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {editingCourse ? "Edit Course" : "Create New Course"}
                </h3>
                <p className="text-xs text-stone-500">Provide details for the LMS course catalog</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modern Full-Stack Web Development"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Course["category"] })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Content Creation">Content Creation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value as Course["level"] })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Beginner-Friendly">Beginner-Friendly</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 12 Weeks"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide an overview of the curriculum and objectives..."
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-medium bg-[#2D3536] text-white hover:bg-stone-800 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCourse && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Delete Course?</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-stone-800">"{deletingCourse.title}"</span>? This
              action cannot be undone and will remove it from the catalog.
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
                {isSubmitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
