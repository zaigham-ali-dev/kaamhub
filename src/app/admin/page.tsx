"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Users,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReports(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50 w-full max-w-full overflow-x-hidden">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl">
        {/* Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full uppercase tracking-wider">
              Control Panel
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              KaamHub Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Oversee marketplace operations across Karachi, Lahore, and Islamabad.
            </p>
          </div>

          <Link
            href="/admin/providers"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-xs text-white shadow-lg transition-colors flex items-center gap-2 whitespace-nowrap self-start md:self-center"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Providers</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Registered Users</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {reports?.totalUsers ?? (loading ? "..." : 12)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Service Providers</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {reports?.totalProviders ?? (loading ? "..." : 6)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Bookings</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {reports?.totalBookings ?? (loading ? "..." : 8)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Platform Volume</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                PKR {reports?.totalRevenue ? reports.totalRevenue.toLocaleString() : "45,000"}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Provider Verification Queue</h3>
                <p className="text-xs text-slate-500">Review pending CNIC & skill badges</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify technician profiles to ensure only qualified and background-checked artisans serve households.
            </p>
            <Link
              href="/admin/providers"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Open Verification Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Marketplace Listings</h3>
                <p className="text-xs text-slate-500">Manage categories & live service offerings</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse all customer reviews, service prices in PKR, and manage service catalog listings.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
