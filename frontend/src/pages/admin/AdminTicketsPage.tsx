import React, { useEffect, useState } from "react";
import {
  LifeBuoy,
  Search,
  Filter,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  Loader2,
  User,
  ShieldCheck,
  Calendar,
  Mail,
  Hash,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ticketService } from "@/services/apiClient";
import { TicketItem, TicketStatus } from "@/types";

export const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Admin Reply State
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusActionMsg, setStatusActionMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchTickets = async (status = statusFilter) => {
    setIsLoading(true);
    try {
      const data = await ticketService.getAllAdmin(status);
      setTickets(data);
      // Keep selected ticket updated if open
      if (selectedTicket) {
        const updated = data.find(
          (t) => t._id === selectedTicket._id || t.ticketId === selectedTicket.ticketId
        );
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error("Failed to load admin tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(statusFilter);
  }, [statusFilter]);

  const handleSelectTicket = async (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setStatusActionMsg(null);
    try {
      const fresh = await ticketService.getById(ticket._id || ticket.ticketId);
      setSelectedTicket(fresh);
    } catch (e) {
      console.error("Error fetching detailed ticket:", e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    setStatusActionMsg(null);
    try {
      const updated = await ticketService.replyAdmin(
        selectedTicket._id || selectedTicket.ticketId,
        replyText.trim()
      );
      setReplyText("");
      setSelectedTicket(updated);
      // Update in master list
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id || t.ticketId === updated.ticketId ? updated : t))
      );
      setStatusActionMsg({ type: "success", text: "Reply sent to learner and notification generated." });
    } catch (err: any) {
      setStatusActionMsg({
        type: "error",
        text: err?.message || "Failed to dispatch reply. Please try again.",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!selectedTicket || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    setStatusActionMsg(null);
    try {
      const updated = await ticketService.updateStatus(
        selectedTicket._id || selectedTicket.ticketId,
        newStatus
      );
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id || t.ticketId === updated.ticketId ? updated : t))
      );
      setStatusActionMsg({
        type: "success",
        text: `Ticket status successfully changed to ${newStatus.replace("_", " ")}.`,
      });
    } catch (err: any) {
      setStatusActionMsg({
        type: "error",
        text: err?.message || "Failed to update ticket status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.ticketId.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      (t.userName && t.userName.toLowerCase().includes(query)) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Clock className="w-3.5 h-3.5" />
            Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-500/10 text-stone-600 border border-stone-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      title="Support Tickets Console"
      subtitle="Manage learner questions, technical issues, and resolve tickets"
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">Support Tickets</h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              Review learner support requests, update status, and respond in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTickets()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Tickets" },
              { id: "open", label: "Open" },
              { id: "in_progress", label: "In Progress" },
              { id: "resolved", label: "Resolved" },
              { id: "closed", label: "Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? "bg-stone-900 text-white font-semibold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, subject, learner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Master-Detail Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Ticket List Column (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Tickets ({filteredTickets.length})
              </span>
              <span className="text-[11px] text-stone-400">Click to view details & reply</span>
            </div>

            <div className="divide-y divide-stone-100 max-h-[680px] overflow-y-auto">
              {isLoading ? (
                <div className="py-16 text-center text-stone-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  <p className="text-xs">Loading support tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-16 text-center text-stone-400 flex flex-col items-center justify-center gap-2 px-6">
                  <LifeBuoy className="w-10 h-10 text-stone-300 stroke-1" />
                  <p className="text-xs font-semibold text-stone-600">No tickets found</p>
                  <p className="text-[11px] text-stone-400">
                    No support tickets match the current filter or search criteria.
                  </p>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.ticketId === t.ticketId;
                  return (
                    <div
                      key={t.ticketId}
                      onClick={() => handleSelectTicket(t)}
                      className={`p-4 cursor-pointer transition-all hover:bg-stone-50 ${
                        isSelected
                          ? "bg-amber-50/40 border-l-4 border-amber-500"
                          : "border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                            {t.ticketId}
                          </span>
                          {t.priority === "high" && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase">
                              Urgent
                            </span>
                          )}
                        </div>
                        {getStatusBadge(t.status)}
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-1 mb-1">
                        {t.subject}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                        <div className="flex items-center gap-1.5 text-stone-600 truncate max-w-[200px]">
                          <User className="w-3 h-3 text-stone-400 flex-shrink-0" />
                          <span className="truncate">{t.userName || "Learner"}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <MessageSquare className="w-3 h-3" />
                          <span>{t.replies ? t.replies.length : 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Ticket Details & Reply Column (7 cols on lg) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col min-h-[680px]">
            {selectedTicket ? (
              <div className="flex flex-col h-full">
                {/* Header & Status Controller */}
                <div className="p-5 border-b border-stone-100 bg-stone-50/50">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100/60 px-2.5 py-0.5 rounded-md">
                          {selectedTicket.ticketId}
                        </span>
                        {getStatusBadge(selectedTicket.status)}
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-stone-900">
                        {selectedTicket.subject}
                      </h2>
                    </div>

                    {/* Status Dropdown Controller */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-stone-500">Status:</label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                        disabled={isUpdatingStatus}
                        className="text-xs font-semibold bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Learner Info Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-white border border-stone-200/60 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-mono">Learner</div>
                        <div className="font-medium text-stone-800 truncate">
                          {selectedTicket.userName || "Student"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-mono">Email</div>
                        <div className="font-medium text-stone-800 truncate">
                          {selectedTicket.userEmail || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-mono">Created</div>
                        <div className="font-medium text-stone-800">
                          {new Date(selectedTicket.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Action Message Toast */}
                  {statusActionMsg && (
                    <div
                      className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        statusActionMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {statusActionMsg.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span>{statusActionMsg.text}</span>
                    </div>
                  )}
                </div>

                {/* Conversation Body */}
                <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[440px]">
                  {/* Initial User Inquiry */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 bg-stone-50 border border-stone-200/70 rounded-2xl rounded-tl-none p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-stone-800">
                          {selectedTicket.userName || "Learner"}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {new Date(selectedTicket.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* Replies Thread */}
                  {selectedTicket.replies &&
                    selectedTicket.replies.map((reply, idx) => {
                      const isAdmin = reply.senderRole === "admin";
                      return (
                        <div
                          key={idx}
                          className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
                              isAdmin
                                ? "bg-amber-500 text-white"
                                : "bg-stone-100 border border-stone-200 text-stone-600"
                            }`}
                          >
                            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div
                            className={`flex-1 rounded-2xl p-4 shadow-xs max-w-[85%] ${
                              isAdmin
                                ? "bg-amber-50/70 border border-amber-200/70 rounded-tr-none text-stone-900"
                                : "bg-stone-50 border border-stone-200/70 rounded-tl-none text-stone-800"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5 gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  isAdmin ? "text-amber-900" : "text-stone-800"
                                }`}
                              >
                                {reply.senderName} {isAdmin && "(Staff)"}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                              {reply.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Admin Reply Composer */}
                <div className="p-4 border-t border-stone-100 bg-white">
                  <form onSubmit={handleSendReply} className="space-y-3">
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write an official response to the learner... (learner will be notified immediately)"
                        className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none placeholder:text-stone-400"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-stone-400">
                        Sending a reply sets the ticket to "In Progress" and notifies the learner.
                      </span>
                      <button
                        type="submit"
                        disabled={!replyText.trim() || isSubmittingReply}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingReply ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Dispatching...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Reply to Learner
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="h-full py-32 flex flex-col items-center justify-center text-center p-8 text-stone-400">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <LifeBuoy className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-sm font-bold text-stone-700 mb-1">No Ticket Selected</h3>
                <p className="text-xs text-stone-400 max-w-sm">
                  Select a ticket from the left panel to inspect the full conversation thread, change
                  status, or dispatch an official administrator reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default AdminTicketsPage;
