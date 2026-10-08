"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BookingData, ServiceData } from "@/lib/types";

export default function ProviderDashboardPage() {
  const { user, providerProfile } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ])
      .then(([bData, sData]) => {
        if (bData.success) setBookings(bData.data || []);
        if (sData.success) setServices(sData.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalEarnings = bookings
    .filter((b) => b.paymentStatus === "PAID" || b.status === "COMPLETED")
    .reduce((acc, curr) => acc + curr.price, 0);

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const activeBookings = bookings.filter((b) => ["ACCEPTED", "IN_PROGRESS"].includes(b.status));

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50 w-full max-w-full overflow-x-hidden">
      <DashboardSidebar role="PROVIDER" />

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl">
        {/* Verification Alert if Pending */}
        {providerProfile?.verificationStatus === "PENDING" && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold text-amber-900">Account Verification in Progress</p>
              <p>
                Our trust & safety team is verifying your CNIC and credentials. You can still set up your services and view incoming booking inquiries.
              </p>
            </div>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full uppercase tracking-wider">
                {providerProfile?.profession || "Service Pro"}
              </span>
              {providerProfile?.verificationStatus === "VERIFIED" && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pro Dashboard — {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage incoming work, update your rates, and accept local bookings in {user?.location || "Pakistan"}.
            </p>
          </div>

          <Link
            href="/provider/services"
            className="self-start md:self-center px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-xs text-white shadow-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Manage My Services</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Estimated Revenue</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                PKR {totalEarnings.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">New Inquiries</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{pendingBookings.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Jobs</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{activeBookings.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Rating & Reviews</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-xl font-black text-slate-900">
                  {providerProfile?.rating ? providerProfile.rating.toFixed(1) : "5.0"}
                </span>
                <span className="text-xs text-slate-400">({providerProfile?.totalReviews || 0})</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Incoming Client Bookings */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Incoming Client Requests</h2>
              <p className="text-xs text-slate-500">Accept or schedule new service bookings</p>
            </div>
            <Link
              href="/provider/bookings"
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300" />
              <p>No bookings received yet. Ensure your services are listed and active.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.service?.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: <strong className="text-slate-800">{b.customer?.name || "Customer"}</strong> ({b.customer?.phone || "N/A"})
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      📅 {b.date} at {b.startTime} • 📍 {b.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-700">
                      PKR {b.price.toLocaleString()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        b.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : b.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {b.status}
                    </span>
                    <Link
                      href="/provider/bookings"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
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
