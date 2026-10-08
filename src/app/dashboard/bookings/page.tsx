"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import ReviewModal from "@/components/ReviewModal";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Star,
  CreditCard,
  AlertCircle,
  Loader2,
  Filter,
  Check,
  Trash2,
} from "lucide-react";
import { BookingData } from "@/lib/types";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<BookingData | null>(null);
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

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this service booking?")) return;
    setActionLoading(id);

    // Optimistic UI update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
    );

    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showNotification("Booking has been cancelled.");
        fetchBookings();
      } else {
        showNotification(json.message || "Failed to cancel booking", "error");
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
      showNotification("Error cancelling booking. Please try again.", "error");
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Permanently remove this cancelled booking from your records?")) return;
    setActionLoading(id);

    // Optimistic removal
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

  const handlePayBooking = async (b: BookingData) => {
    setActionLoading(b.id);
    try {
      const res = await fetch(`/api/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: b.id,
          amount: b.price,
          providerId: b.providerId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((item) => (item.id === b.id ? { ...item, paymentStatus: "PAID" } : item))
        );
        showNotification("Payment successful! Status updated to PAID.");
        fetchBookings();
      } else {
        showNotification(data.message || "Payment simulation failed.", "error");
      }
    } catch (err) {
      showNotification("Payment processing failed.", "error");
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
      <DashboardSidebar role="CUSTOMER" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${
              notification.type === "success"
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Bookings</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your service appointments, track real-time status and leave reviews.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
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
            Loading your bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No bookings match &ldquo;{statusFilter}&rdquo;</h3>
            <p className="text-xs text-slate-500">Book your service with verified professionals today.</p>
            <div className="pt-2 flex items-center justify-center gap-2">
              {statusFilter !== "ALL" && (
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Clear Filter
                </button>
              )}
              <Link
                href="/services"
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              >
                Browse Services
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <img
                      src={b.service?.coverImage || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80"}
                      alt={b.service?.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        {b.service?.location || "Karachi"}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{b.service?.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Provider:{" "}
                        <span className="font-semibold text-slate-800">
                          {b.provider?.user?.name || "Verified Professional"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        b.status === "COMPLETED"
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
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        b.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Payment: {b.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>
                      <strong className="text-slate-800">Date:</strong> {b.date} ({b.startTime})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="truncate">
                      <strong className="text-slate-800">Location:</strong> {b.address}
                    </span>
                  </div>
                </div>

                {b.notes && (
                  <p className="text-xs text-slate-600 italic">
                    <strong className="text-slate-800 not-italic">Notes:</strong> {b.notes}
                  </p>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm font-bold text-slate-900">
                    Total Amount: <span className="text-emerald-700 font-extrabold">PKR {b.price.toLocaleString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* If Pending or Accepted, allow cancel */}
                    {["PENDING", "ACCEPTED"].includes(b.status) && (
                      <button
                        type="button"
                        disabled={actionLoading === b.id}
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {actionLoading === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Cancel Booking</span>
                      </button>
                    )}

                    {/* If Cancelled or Rejected, allow permanently deleting from view */}
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

                    {/* Pay button if pending payment and not cancelled */}
                    {b.paymentStatus === "PENDING" && b.status !== "CANCELLED" && (
                      <button
                        type="button"
                        disabled={actionLoading === b.id}
                        onClick={() => handlePayBooking(b)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                      >
                        {actionLoading === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        <span>Pay Online (Simulate)</span>
                      </button>
                    )}

                    {/* If completed, leave review */}
                    {b.status === "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForReview(b)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{b.review ? "View / Edit Review" : "Leave a Review"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal Trigger */}
        {selectedBookingForReview && (
          <ReviewModal
            isOpen={!!selectedBookingForReview}
            booking={selectedBookingForReview}
            onClose={() => setSelectedBookingForReview(null)}
            onSuccess={() => {
              setSelectedBookingForReview(null);
              showNotification("Review submitted successfully! Thank you.");
              fetchBookings();
            }}
          />
        )}
      </main>
    </div>
  );
}

