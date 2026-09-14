import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useBstorm } from "@/context/BstormContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ticketService } from "@/services/apiClient";
import { TicketItem, TicketStatus } from "@/types";
import {
  LifeBuoy,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  X,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  RotateCw,
} from "lucide-react";

export default function HelpTicketsPage() {
  const { user } = useBstorm();

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Ticket Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Reply State
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Load tickets on mount
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await ticketService.getMyTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      } else if (selectedTicket) {
        // Keep selected updated
        const updated = data.find((t) => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;

    if (!subject.trim() || !description.trim()) {
      setCreateError("Please provide both a ticket subject and description.");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      const newTicket = await ticketService.create({
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });

      setTickets((prev) => [newTicket, ...prev]);
      setSelectedTicket(newTicket);
      setSubject("");
      setDescription("");
      setPriority("medium");
      setIsNewModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create ticket:", err);
      setCreateError(err?.message || "Unable to raise support ticket. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || isReplying || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const updated = await ticketService.reply(selectedTicket.ticketId, replyText.trim());
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setReplyText("");
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Clock className="w-3 h-3" />
            <span>Open</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            <span>In Progress</span>
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
            <CheckCircle2 className="w-3 h-3" />
            <span>Closed</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
            <div>
              <div className="mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Learner Helpdesk
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Support Tickets
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Raise queries regarding course lessons, assessments, certificates, or platform billing.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => loadTickets()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                title="Refresh Tickets"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Raise New Ticket</span>
              </button>
            </div>
          </div>

          {/* Main Content: Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Tickets List */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 px-5 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Your Tickets ({tickets.length})
                </span>
              </div>

              <div className="max-h-[600px] overflow-y-auto divide-y divide-stone-100">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span>Loading tickets...</span>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-10 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
                    <LifeBuoy className="w-8 h-8 text-stone-300" />
                    <p className="font-semibold text-slate-800">No support tickets found</p>
                    <p className="text-stone-400">
                      Need help? Click "Raise New Ticket" to message our support team.
                    </p>
                  </div>
                ) : (
                  tickets.map((t) => {
                    const isSelected = selectedTicket?._id === t._id;
                    return (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 hover:bg-stone-50 transition-colors cursor-pointer flex flex-col gap-2 ${
                          isSelected ? "bg-emerald-50/40 border-l-4 border-emerald-600" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-stone-400 uppercase">
                            {t.ticketId}
                          </span>
                          {getStatusBadge(t.status)}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {t.subject}
                        </h3>

                        <p className="text-xs text-stone-500 line-clamp-2">
                          {t.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                          <span>
                            {new Date(t.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-stone-600">
                            <MessageSquare className="w-3 h-3" />
                            <span>{t.replies.length} replies</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Ticket Conversation View */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
              {selectedTicket ? (
                <div className="flex flex-col h-full justify-between">
                  {/* Ticket Details Header */}
                  <div className="p-5 border-b border-stone-100 bg-stone-50/70 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                          {selectedTicket.ticketId}
                        </span>
                        {getStatusBadge(selectedTicket.status)}
                      </div>
                      <span className="text-xs text-stone-400">
                        Created {new Date(selectedTicket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {selectedTicket.subject}
                    </h2>

                    <div className="text-xs text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200/70 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* Conversation Replies Thread */}
                  <div className="p-5 overflow-y-auto max-h-[380px] flex flex-col gap-4 flex-1">
                    {selectedTicket.replies.length === 0 ? (
                      <div className="py-8 text-center text-xs text-stone-400 flex flex-col items-center gap-1">
                        <MessageSquare className="w-6 h-6 text-stone-300" />
                        <span>No replies yet. An administrator will respond shortly.</span>
                      </div>
                    ) : (
                      selectedTicket.replies.map((r, idx) => {
                        const isAdmin = r.senderRole === "admin";
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col gap-1 max-w-[85%] ${
                              isAdmin ? "self-start" : "self-end items-end"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                              {isAdmin ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-semibold text-emerald-800">
                                    {r.senderName} (Support Admin)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                                  <span className="font-semibold text-stone-700">You</span>
                                </>
                              )}
                              <span>•</span>
                              <span>
                                {new Date(r.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <div
                              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isAdmin
                                  ? "bg-stone-100 text-slate-900 rounded-tl-xs"
                                  : "bg-slate-900 text-white rounded-tr-xs"
                              }`}
                            >
                              {r.message}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Reply Input Box (Allowed even if closed, to reopen) */}
                  <div className="p-4 border-t border-stone-100 bg-stone-50/70">
                    <form onSubmit={handleSendReply} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a message or response to support..."
                        className="flex-1 h-11 px-4 rounded-xl bg-white border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isReplying || !replyText.trim()}
                        className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isReplying ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Send</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-xs text-stone-400 flex flex-col items-center justify-center h-full gap-2">
                  <MessageSquare className="w-8 h-8 text-stone-300" />
                  <span>Select a ticket from the left panel to inspect the conversation.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raise New Ticket Modal */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
              <div className="p-5 px-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Raise Support Ticket
                    </h2>
                    <p className="text-xs text-stone-500">
                      Describe your issue or query clearly
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createError && (
                <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Issue accessing lesson video in Module 02"
                    className="w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-stone-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                          priority === p
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the issue, course name, or step where you need help..."
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-stone-400 focus:bg-white focus:border-emerald-600 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Ticket</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
