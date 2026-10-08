"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Award, HeartHandshake, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Our Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Connecting Pakistani homes with trusted professionals
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          KaamHub was built to solve the frustration of unreliable handymen, unpredictable pricing, and zero accountability in the local service sector.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Vetted & Background Checked</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Every provider submits government identification, portfolio proofs, and undergoes skills verification before earning our badge.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Transparent Pricing</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Clear upfront rates in PKR. No haggling or hidden charges when the technician arrives at your doorstep.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Guaranteed Satisfaction</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            30-day post-service warranty on repair jobs. If something is amiss, we ensure your provider returns to make it right.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Built for Karachi, Lahore & Islamabad
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            From electrical phase balancing in DHA Lahore to master chemical AC washes in Clifton Karachi and wedding photography in Islamabad, KaamHub empowers local artisans with technology while giving customers complete peace of mind.
          </p>
        </div>
        <Link
          href={
            user
              ? user.role === "PROVIDER"
                ? "/provider"
                : user.role === "ADMIN"
                ? "/admin"
                : "/dashboard"
              : "/register?role=PROVIDER"
          }
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-sm text-white transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap"
        >
          <span>{user ? "Go to Dashboard" : "Join as a Professional"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
