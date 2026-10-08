"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MapPin,
  Briefcase,
  Star,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ProviderProfileData } from "@/lib/types";

export default function AdminVerifyProvidersPage() {
  const [providers, setProviders] = useState<ProviderProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/providers");
      const json = await res.json();
      if (json.success) {
        setProviders(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleVerify = async (id: string, status: "VERIFIED" | "REJECTED") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/providers/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchProviders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProviders = providers.filter((p) => {
    if (statusFilter === "ALL") return true;
    return p.verificationStatus === statusFilter;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Provider Verification</h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify local artisans, background checks, and license approvals across Pakistan.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {["ALL", "PENDING", "VERIFIED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading providers...</div>
        ) : filteredProviders.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No providers match this filter</h3>
            <p className="text-xs text-slate-500">All provider applications are up to date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProviders.map((p) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      p.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        p.user?.name || "Pro"
                      )}&background=059669&color=fff`
                    }
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{p.user?.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          p.verificationStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.verificationStatus === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.verificationStatus}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-700">{p.profession}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.user?.location || "Karachi"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {p.experience || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        {p.rating?.toFixed(1) || "5.0"} ({p.totalReviews || 0} reviews)
                      </span>
                    </div>

                    {p.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-xl pt-1">
                        {p.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    disabled={actionLoading === p.id}
                    onClick={() => handleVerify(p.id, "REJECTED")}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === p.id}
                    onClick={() => handleVerify(p.id, "VERIFIED")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
