import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminService } from "@/services/apiClient";
import { AdminStats } from "@/types";

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.message || "Failed to retrieve administrative analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout
      title="Platform Overview"
      subtitle="Real-time LMS metrics, system activity, and administrative management"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Executive Console Status</h2>
              <p className="text-xs text-stone-500">
                Connected to MongoDB Cluster • Multi-tenant Role Guard Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadStats}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
            <Link
              to="/admin/courses?action=new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D3536] text-white text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Students */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Total Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {isLoading ? "..." : stats?.totalStudents ?? 0}
              </div>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <span>Enrolled & guest accounts</span>
              </p>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Active Courses
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {isLoading ? "..." : stats?.totalCourses ?? 0}
              </div>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <span>Published in catalog</span>
              </p>
            </div>
          </div>

          {/* Active Enrollments */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Course Enrollments
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {isLoading ? "..." : stats?.totalEnrollments ?? 0}
              </div>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <span>Learner active seats</span>
              </p>
            </div>
          </div>

          {/* Total Gross Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Platform Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {isLoading ? "..." : formatCurrency(stats?.totalRevenue ?? 0)}
              </div>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <span>Captured payments</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Management Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Link
            to="/admin/courses"
            className="group bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-stone-400/80 shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-700">
                  Course Catalog
                </h3>
                <p className="text-xs text-stone-500">Create, edit, and organize curriculum</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/users"
            className="group bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-stone-400/80 shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-700">
                  User Accounts
                </h3>
                <p className="text-xs text-stone-500">Inspect accounts and manage privileges</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/enrollments"
            className="group bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-stone-400/80 shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-700">
                  Manual Enrollments
                </h3>
                <p className="text-xs text-stone-500">Assign student seats directly</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Recent Enrollments Audit Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Recent Enrollments</h3>
              <p className="text-xs text-stone-500">Live feed of student admissions and registrations</p>
            </div>
            <Link
              to="/admin/enrollments"
              className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Enrolled Course</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      Loading recent enrollments...
                    </td>
                  </tr>
                ) : stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                  stats.recentEnrollments.map((enr) => (
                    <tr key={enr._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">
                          {enr.userId?.name || "Student User"}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          {enr.userId?.email || "No email available"}
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
                          <div className="w-20 bg-stone-100 rounded-full h-1.5 overflow-hidden">
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
                      <td className="py-3 px-4 text-stone-500">
                        {enr.createdAt
                          ? new Date(enr.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recently"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      No enrollments found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
