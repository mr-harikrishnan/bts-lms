import React, { useEffect, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminService } from "@/services/apiClient";
import { AdminPaymentItem } from "@/types";

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPayments({ page, limit: 20 });
      setPayments(res.payments);
      setPagination(res.pagination);
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Failed to load payments." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page]);

  const handleRefund = async () => {
    if (!refundingId) return;
    setIsProcessing(true);
    try {
      await adminService.processRefund(refundingId);
      setAlertMsg({
        type: "success",
        text: "Payment marked refunded and learner course enrollment revoked.",
      });
      setRefundingId(null);
      await loadPayments();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err?.message || "Refund processing failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: AdminPaymentItem["status"]) => {
    switch (status) {
      case "captured":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Captured</span>
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-700 text-[11px] font-semibold">
            <RotateCcw className="w-3 h-3 text-purple-600" />
            <span>Refunded</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-700 text-[11px] font-semibold">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] font-semibold">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Authorized</span>
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Payment & Financial Transactions"
      subtitle="Review payment logs, audit captured orders, and manage customer refunds"
    >
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-stone-900">Transaction History</h2>
            <p className="text-xs text-stone-500">
              {pagination.total} transactions logged through payment gateway
            </p>
          </div>

          <button
            onClick={loadPayments}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
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

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Transaction Details</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Refund Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-stone-900 text-[11px]">
                          {p.razorpayPaymentId || p._id}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          Order: {p.orderId || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">
                          {p.userId?.name || "Customer"}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          {p.userId?.email || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-800">
                        {p.courseId?.title || "Course Enrollment"}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 font-mono">
                        ₹{p.amount?.toLocaleString("en-IN") || 0}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(p.status)}</td>
                      <td className="py-3 px-4 text-stone-500">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recently"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.status === "captured" && (
                          <button
                            onClick={() => setRefundingId(p._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 text-stone-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Refund</span>
                          </button>
                        )}
                        {p.status === "refunded" && (
                          <span className="text-[11px] text-stone-400 italic">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No payment records found.
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
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
                transactions)
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

      {/* Refund Confirmation Dialog */}
      {refundingId && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">Process Refund & Revoke?</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              Are you sure you want to refund this transaction? The payment will be flagged as
              refunded and the student's access to the course will be immediately revoked.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRefundingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
