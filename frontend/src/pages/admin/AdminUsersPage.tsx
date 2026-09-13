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
  UserPlus,
  X,
  Eye,
  EyeOff,
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

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "admin",
    college: "",
    district: "",
    state: "",
    rollNumber: "",
  });

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
        text: `Role for ${confirmRoleUser.name} changed to ${newRole.toUpperCase()}.`,
      });
      setConfirmRoleUser(null);
      await loadUsers();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Failed to update role." });
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      setAlertMsg({ type: "error", text: "Name, email, and password are required." });
      return;
    }

    if (createForm.password.length < 6) {
      setAlertMsg({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setIsProcessing(true);
    try {
      await adminService.createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
        college: createForm.college.trim(),
        district: createForm.district.trim(),
        state: createForm.state.trim(),
        rollNumber: createForm.rollNumber.trim(),
      });

      setAlertMsg({
        type: "success",
        text: `User ${createForm.name} successfully created as ${createForm.role.toUpperCase()}.`,
      });
      setCreateModalOpen(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        college: "",
        district: "",
        state: "",
        rollNumber: "",
      });
      await loadUsers();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Failed to create user." });
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

            <button
              onClick={() => {
                setAlertMsg(null);
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D3536] text-white text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
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
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-stone-400" />
                        <span>Loading user accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = u.email.toLowerCase() === currentAdmin.email.toLowerCase();
                    return (
                      <tr key={u._id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 font-semibold text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-bold tracking-wider">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              u.role === "admin"
                                ? "bg-amber-50 text-amber-800 border border-amber-200/60"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                            }`}
                          >
                            <Shield className="w-2.5 h-2.5" />
                            <span className="capitalize">{u.role}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-stone-800">{u.college || "—"}</div>
                          <div className="text-[10px] text-stone-400">
                            {[u.district, u.state].filter(Boolean).join(", ") || "—"}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                          {u.rollNumber || "—"}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-stone-500">
                          {new Date(u.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setConfirmRoleUser(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isSelf
                                  ? "opacity-30 cursor-not-allowed text-stone-300 border-stone-200"
                                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-100 border-stone-200"
                              }`}
                              title={
                                isSelf
                                  ? "Cannot change your own role"
                                  : u.role === "admin"
                                  ? "Demote to Student"
                                  : "Promote to Admin"
                              }
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingUser(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isSelf
                                  ? "opacity-30 cursor-not-allowed text-stone-300 border-stone-200"
                                  : "text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                              }`}
                              title={
                                isSelf
                                  ? "Cannot delete your own admin account"
                                  : "Delete User Account"
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <div>
              Showing {users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} registered users
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-semibold text-stone-700">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Add New User Account</h3>
                  <p className="text-xs text-stone-500">Create a student learner or platform administrator</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. Karthik Raja"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="e.g. learner@example.com"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Password * (min 6 chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 pr-9 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Account Role *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as "student" | "admin" })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                  >
                    <option value="student">Learner / Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  College / Institution (Optional)
                </label>
                <input
                  type="text"
                  value={createForm.college}
                  onChange={(e) => setCreateForm({ ...createForm, college: e.target.value })}
                  placeholder="e.g. PSG College of Technology"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    District
                  </label>
                  <input
                    type="text"
                    value={createForm.district}
                    onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                    placeholder="e.g. Coimbatore"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={createForm.state}
                    onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={createForm.rollNumber}
                    onChange={(e) => setCreateForm({ ...createForm, rollNumber: e.target.value })}
                    placeholder="e.g. 23CS101"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#2D3536] text-white hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Creating Account..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
