"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  CreditCard,
  Loader2,
  Trash2,
} from "lucide-react";
import { BookingData } from "@/lib/types";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = () => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
    );

    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Remove this cancelled booking from your dashboard?")) return;
    setActionLoading(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
      fetchBookings();
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const activeCount = bookings.filter((b) => ["ACCEPTED", "IN_PROGRESS"].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50 w-full max-w-full overflow-x-hidden">
      <DashboardSidebar role="CUSTOMER" />

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-white/20 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || "Client"}!
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm">
              Track your service bookings, manage appointments with local specialists, or book a new verified professional today.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/bookings"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending Requests</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Bookings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{activeCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Completed Jobs</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{completedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* Recent Bookings Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Service Bookings</h2>
              <p className="text-xs text-slate-500">Your upcoming and previous requests</p>
            </div>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>View All ({bookings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">No bookings yet</h3>
                <p className="text-xs text-slate-500">
                  Ready to fix an AC, wire your solar system, or deep clean your home?
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                <span>Browse Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={b.service?.coverImage || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80"}
                      alt={b.service?.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{b.service?.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {b.date} • {b.startTime}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {b.address}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 mt-1">
                        PKR {b.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
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

                    {/* Quick Cancel button if pending */}
                    {["PENDING", "ACCEPTED"].includes(b.status) && (
                      <button
                        type="button"
                        disabled={actionLoading === b.id}
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Quick Dismiss / Remove button if cancelled */}
                    {["CANCELLED", "REJECTED"].includes(b.status) && (
                      <button
                        type="button"
                        disabled={actionLoading === b.id}
                        onClick={() => handleDeleteBooking(b.id)}
                        className="text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                        title="Remove cancelled booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}

                    <Link
                      href="/dashboard/bookings"
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

