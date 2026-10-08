"use client";
import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  PlayCircle,
  CheckCircle2,
  Phone,
  User,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { BookingData } from "@/lib/types";

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (json.success) {
        setBookings(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: any) => {
    setActionLoading(id);

    // Optimistic UI update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showNotification(`Booking status successfully updated to ${newStatus.replace("_", " ")}`);
        fetchBookings();
      } else {
        showNotification(json.message || "Failed to update booking status", "error");
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
      showNotification("Error updating status. Please try again.", "error");
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Permanently remove this cancelled/declined order from your records?")) return;
    setActionLoading(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showNotification("Booking permanently removed.");
        fetchBookings();
      } else {
        showNotification(json.message || "Failed to remove booking", "error");
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
      showNotification("Error removing booking.", "error");
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "ALL") return true;
    return b.status === statusFilter;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="PROVIDER" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${notification.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
              }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-200" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-white/80 hover:text-white text-xs underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Client Bookings</h1>
            <p className="text-xs text-slate-500 mt-1">
              Review incoming service orders, accept schedules, and mark jobs completed.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === st
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading client bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No client bookings found</h3>
            <p className="text-xs text-slate-500">
              When clients book your services, their inquiries will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={
                        b.customer?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          b.customer?.name || "Client"
                        )}&background=059669&color=fff`
                      }
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {b.customer?.name || "Client"}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{b.customer?.phone || "No phone provided"}</span>
                      </p>
                      <p className="text-xs font-semibold text-emerald-700 mt-1">
                        Service: {b.service?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${b.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : b.status === "ACCEPTED" || b.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "CANCELLED" || b.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl">
                  <div>
                    <strong className="text-slate-800 block">Date & Time:</strong>
                    <span>
                      {b.date} ({b.startTime})
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <strong className="text-slate-800 block">Service Address:</strong>
                    <span>{b.address}</span>
                  </div>
                </div>

                {b.notes && (
                  <div className="text-xs text-slate-600 bg-amber-50/60 border border-amber-100 p-3 rounded-xl">
                    <strong className="text-amber-900">Client Instructions:</strong> {b.notes}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm font-bold text-slate-900">
                    Booking Payout: <span className="text-emerald-700 font-extrabold">PKR {b.price.toLocaleString()}</span>
                  </div>

                  {/* Provider Action Buttons based on status */}
                  <div className="flex flex-wrap items-center gap-2">
                    {b.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading === b.id}
                          onClick={() => handleUpdateStatus(b.id, "REJECTED")}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === b.id}
                          onClick={() => handleUpdateStatus(b.id, "ACCEPTED")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 disabled:opacity-50"
                        >
                          {actionLoading === b.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Accept Booking</span>
                        </button>
                      </>
                    )}

                    {/* If Cancelled or Rejected, allow permanently deleting */}
                    {["CANCELLED", "REJECTED"].includes(b.status) && (
                      <button
                        type="button"
                        disabled={actionLoading === b.id}
                        onClick={() => handleDeleteBooking(b.id)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                        title="Remove from history"
                      >
                        {actionLoading === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Remove</span>
                      </button>
                    )}

                    {b.status === "ACCEPTED" && (
                      <button
                        type="button"
                        disabled={actionLoading === b.id}
                        onClick={() => handleUpdateStatus(b.id, "IN_PROGRESS")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {actionLoading === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <PlayCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Start Service (In Progress)</span>
                      </button>
                    )}

                    {b.status === "IN_PROGRESS" && (
                      <button
                        type="button"
                        disabled={actionLoading === b.id}
                        onClick={() => handleUpdateStatus(b.id, "COMPLETED")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {actionLoading === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Mark Job Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

