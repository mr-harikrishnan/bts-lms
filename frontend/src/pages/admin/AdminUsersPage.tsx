import React, { useEffect, useState } from "react";
import {
  Search,
  Shield,
  User as UserIcon,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminService } from "@/services/apiClient";
import { AdminUserItem } from "@/types";
import { useBstorm } from "@/context/BstormContext";

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useBstorm();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  const [confirmRoleUser, setConfirmRoleUser] = useState<AdminUserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        limit: 20,
        search,
        role: roleFilter || undefined,
      });
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Failed to load users." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleRoleChange = async () => {
    if (!confirmRoleUser) return;
    const newRole = confirmRoleUser.role === "admin" ? "student" : "admin";

    // Client-side self-demotion check
    if (confirmRoleUser.email.toLowerCase() === currentAdmin.email.toLowerCase()) {
      setAlertMsg({
        type: "error",
        text: "Security Restriction: You cannot revoke your own administrator role.",
      });
      setConfirmRoleUser(null);
      return;
    }

    setIsProcessing(true);
    try {
      await adminService.updateUserRole(confirmRoleUser._id, newRole);
      setAlertMsg({
        type: "success",
        text: `Successfully updated ${confirmRoleUser.name}'s role to ${newRole}.`,
      });
      setConfirmRoleUser(null);
      await loadUsers();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Role change failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    // Client-side self-deletion check
    if (deletingUser.email.toLowerCase() === currentAdmin.email.toLowerCase()) {
      setAlertMsg({
        type: "error",
        text: "Security Restriction: You cannot delete your own administrator account.",
      });
      setDeletingUser(null);
      return;
    }

    setIsProcessing(true);
    try {
      await adminService.deleteUser(deletingUser._id);
      setAlertMsg({
        type: "success",
        text: `Account for ${deletingUser.name} and associated enrollments removed.`,
      });
      setDeletingUser(null);
      await loadUsers();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Failed to delete user." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout
      title="User & Access Control"
      subtitle="Inspect learner registrations, manage permissions, and assign administrative roles"
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or institution..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-[#2D3536] text-white text-xs font-medium rounded-xl hover:bg-stone-800 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2.5">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-hidden"
            >
              <option value="">All Roles</option>
              <option value="student">Learners Only</option>
              <option value="admin">Administrators Only</option>
            </select>

            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="p-2 rounded-xl text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              title="Refresh Users"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
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

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Role & Status</th>
                  <th className="py-3 px-4">College / District</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      Loading user records...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((u) => {
                    const isSelf = u.email.toLowerCase() === currentAdmin.email.toLowerCase();
                    return (
                      <tr key={u._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 shrink-0">
                              {u.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-mono uppercase font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-400 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] font-semibold">
                              <Shield className="w-3 h-3 text-amber-600" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-700 text-[11px] font-medium">
                              <UserIcon className="w-3 h-3 text-sky-600" />
                              <span>Student</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-700">
                          <div>{u.college || "—"}</div>
                          <div className="text-[10px] text-stone-400">
                            {[u.district, u.state].filter(Boolean).join(", ") || "—"}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600">{u.rollNumber || "—"}</td>
                        <td className="py-3 px-4 text-stone-500">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isSelf && (
                              <>
                                <button
                                  onClick={() => setConfirmRoleUser(u)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 hover:bg-stone-100 transition-colors text-stone-700"
                                >
                                  {u.role === "admin" ? "Demote" : "Promote"}
                                </button>
                                <button
                                  onClick={() => setDeletingUser(u)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No user accounts found.
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
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
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

      {/* Role Confirmation Dialog */}
      {confirmRoleUser && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">
              {confirmRoleUser.role === "admin"
                ? "Demote to Student?"
                : "Promote to Administrator?"}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              You are about to change the permissions for{" "}
              <span className="font-semibold text-stone-800">{confirmRoleUser.name}</span> (
              <span className="font-mono text-stone-700">{confirmRoleUser.email}</span>) to{" "}
              <span className="font-bold text-stone-900">
                {confirmRoleUser.role === "admin" ? "student" : "admin"}
              </span>
              .
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmRoleUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#2D3536] text-white hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Updating..." : "Confirm Role Change"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Dialog */}
      {deletingUser && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Delete User Account?</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-stone-800">{deletingUser.name}</span>? All
              course enrollments and progress for this user will be revoked immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
