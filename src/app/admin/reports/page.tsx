"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Award, MapPin } from "lucide-react";

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const topCategories = [
    { name: "Home Repair & AC", bookings: 142, share: "36%", revenue: 639000 },
    { name: "Deep Cleaning & Maid", bookings: 98, share: "25%", revenue: 392000 },
    { name: "Electrical & UPS Wiring", bookings: 75, share: "19%", revenue: 165000 },
    { name: "Photography & Studio", bookings: 44, share: "11%", revenue: 528000 },
    { name: "Beauty & Salon", bookings: 36, share: "9%", revenue: 108000 },
  ];

  const cityDemand = [
    { city: "Karachi", share: "52%", volume: "PKR 950,000" },
    { city: "Lahore", share: "33%", volume: "PKR 610,000" },
    { city: "Islamabad / Rawalpindi", share: "15%", volume: "PKR 272,000" },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Reports & Analytics Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Marketplace growth, top requested categories, regional demand, and conversion metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-semibold px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter (90 Days)</option>
              <option value="1y">All Time (1 Year)</option>
            </select>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Gross Merchandise Volume</p>
            <p className="text-2xl font-black text-slate-900 mt-2">PKR 1.83M</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">↑ +24.5% vs last period</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Completed Jobs</p>
            <p className="text-2xl font-black text-slate-900 mt-2">395</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">94.8% completion rate</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Active Verified Pros</p>
            <p className="text-2xl font-black text-slate-900 mt-2">128</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">+14 onboarded this month</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Avg Customer Rating</p>
            <p className="text-2xl font-black text-amber-500 mt-2">4.89 ★</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">From 520+ verified reviews</p>
          </div>
        </div>

        {/* Categories and Cities Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Demand */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Category Booking & Revenue Share
            </h2>

            <div className="space-y-4">
              {topCategories.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{cat.name}</span>
                    <span className="text-slate-500 font-medium">
                      {cat.bookings} jobs · PKR {cat.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: cat.share }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Demand */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Regional Marketplace Volume
            </h2>

            <div className="space-y-5">
              {cityDemand.map((cd) => (
                <div key={cd.city} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {cd.city}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {cd.share}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Total Volume Processed</span>
                    <span className="font-bold text-slate-800">{cd.volume}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
