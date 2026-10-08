"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Briefcase, Search, Filter, CheckCircle2, XCircle, Eye, Star } from "lucide-react";
import Link from "next/link";
import { ServiceData } from "@/lib/types";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/services?limit=50");
        const json = await res.json();
        if (json.success) {
          setServices(json.data || []);
        }
      } catch (e) {
        console.error("Failed to load services", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = services.filter((s) => {
    const titleMatch = s.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = s.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const provMatch = s.provider?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.provider?.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || catMatch || provMatch;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              All Marketplace Services
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse, monitor, and regulate services published across all categories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm">
              Live Services: <strong>{services.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search service title, category, or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Service Details</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map((s) => {
                  const imgUrl =
                    s.coverImage ||
                    (s.images && s.images[0] ? (typeof s.images[0] === "string" ? s.images[0] : (s.images[0] as any).url) : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&auto=format&fit=crop&q=80");

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={s.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs line-clamp-1">{s.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{s.duration || "60 mins"} · Instant booking</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {s.provider?.user?.name || s.provider?.profession || "Service Pro"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {s.category?.name || "General"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        PKR {s.price?.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{s.provider?.rating || 4.9}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href={`/services/${s.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Live
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
