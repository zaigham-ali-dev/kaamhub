"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Star, MessageSquare, ThumbsUp, Calendar, CheckCircle2 } from "lucide-react";

export default function CustomerReviewsPage() {
  const [reviews] = useState([
    {
      id: "rev_1",
      serviceTitle: "Master Split / Inverter AC General Chemical Service",
      providerName: "Tariq Mehmood",
      rating: 5,
      date: "Oct 01, 2026",
      comment: "Tariq bhai arrived right on time in Clifton. Very polite, thorough chemical pressure wash, and our AC is cooling like brand new!",
    },
    {
      id: "rev_2",
      serviceTitle: "Full 3-Bed Apartment Complete Deep Cleaning",
      providerName: "Zainab Bibi",
      rating: 5,
      date: "Sep 24, 2026",
      comment: "Incredible attention to detail. Kitchen grease and bathroom grout are completely sparkling. Highly recommended.",
    },
  ]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="CUSTOMER" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reviews Given</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ratings and feedback you have shared for local service specialists.
          </p>
        </div>

        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{r.serviceTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provider: <span className="font-semibold text-slate-800">{r.providerName}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">({r.date})</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-2xl">
                &ldquo;{r.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
