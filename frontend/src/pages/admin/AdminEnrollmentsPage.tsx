import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminService, courseService } from "@/services/apiClient";
import { AdminEnrollmentItem, Course } from "@/types";

export const AdminEnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<AdminEnrollmentItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  const [modalOpen, setModalOpen] = useState(false);
  const [grantEmail, setGrantEmail] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [enrRes, courseList] = await Promise.all([
        adminService.getEnrollments({ page, limit: 20 }),
        courseService.getAll(),
      ]);
      setEnrollments(enrRes.enrollments);
      setPagination(enrRes.pagination);
      setCourses(courseList);
      if (courseList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courseList[0]._id);
      }
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Failed to load enrollments." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleGrantEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim() || !selectedCourseId) {
      setAlertMsg({ type: "error", text: "Student email and course selection are required." });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.grantEnrollment({
        userEmail: grantEmail.trim().toLowerCase(),
        courseId: selectedCourseId,
      });
      setAlertMsg({
        type: "success",
        text: `Course access granted to ${grantEmail} successfully.`,
      });
      setModalOpen(false);
      setGrantEmail("");
      await loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Failed to grant enrollment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokingId) return;
    setIsSubmitting(true);
    try {
      await adminService.revokeEnrollment(revokingId);
      setAlertMsg({ type: "success", text: "Enrollment access revoked successfully." });
      setRevokingId(null);
      await loadData();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Failed to revoke enrollment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Enrollment Management"
      subtitle="Track active student seats, monitor modular completion, and grant direct course access"
    >
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-stone-900">Active Course Registrations</h2>
            <p className="text-xs text-stone-500">
              {pagination.total} active admissions across all published disciplines
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              title="Refresh Enrollments"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D3536] text-white text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Grant Manual Enrollment</span>
            </button>
          </div>
        </div>

        {alertMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
              alertMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>{alertMsg.text}</span>
            <button onClick={() => setAlertMsg(null)} className="text-stone-400 hover:text-stone-700">
              ✕
            </button>
          </div>
        )}

        {/* Enrollments Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Progress Meter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Enrolled At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      Loading enrollment data...
                    </td>
                  </tr>
                ) : enrollments.length > 0 ? (
                  enrollments.map((enr) => (
                    <tr key={enr._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">
                          {enr.userId?.name || "Student User"}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          {enr.userId?.email || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-800">
                        {enr.courseId?.title || "Untitled Course"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium">
                          {enr.courseId?.category || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${enr.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-stone-500">
                            {enr.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {enr.isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-700">In Progress</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {enr.createdAt
                          ? new Date(enr.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recently"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setRevokingId(enr._id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Revoke Enrollment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No active enrollments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grant Manual Enrollment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <div>
                <h3 className="text-base font-bold text-stone-900">Grant Manual Enrollment</h3>
                <p className="text-xs text-stone-500">Assign course access directly by student email</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantEnrollment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Registered Student Email *
                </label>
                <input
                  type="email"
                  required
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Select Course *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.price === 0 ? "FREE" : `₹${c.price}`})
                    </option>
                  ))}
                </select>
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
                  {isSubmitting ? "Granting..." : "Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Dialog */}
      {revokingId && (
        <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Revoke Enrollment Access?</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              This will remove the learner's seat and reset their ongoing course progression. They
              will lose streaming access immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRevokingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Revoking..." : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
