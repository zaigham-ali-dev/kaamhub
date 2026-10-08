"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Star, MessageSquare, ThumbsUp, Award, Filter, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProviderReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([
    {
      id: "rev-1",
      customerName: "Ahmed Khan",
      customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      serviceTitle: "Split AC Master Servicing & Gas Top-up",
      comment: "Zabardast kaam kiya bhai ne! AC bilkul chill kar raha hai ab aur waqt par aye thay. Highly recommended!",
      date: "2 days ago",
      helpfulCount: 4,
      providerReply: "Shukriya Ahmed bhai! Glad you liked the service.",
    },
    {
      id: "rev-2",
      customerName: "Fatima Noor",
      customerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      serviceTitle: "Deep Home Cleaning & Disinfection",
      comment: "Extremely professional and thorough cleaning team. They cleaned every corner of the apartment perfectly.",
      date: "1 week ago",
      helpfulCount: 7,
      providerReply: null,
    },
    {
      id: "rev-3",
      customerName: "Bilal Tariq",
      customerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      rating: 4,
      serviceTitle: "Circuit Breaker & Wiring Diagnostic",
      comment: "Fixed the short circuit issue quickly. Arrived 15 minutes late due to traffic, but work quality was top notch.",
      date: "2 weeks ago",
      helpfulCount: 2,
      providerReply: "Thank you Bilal for the feedback, we apologize for the slight traffic delay!",
    },
  ]);

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);

  const handleSendReply = (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, providerReply: text.trim() } : r))
    );
    setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    setActiveReplyBox(null);
  };

  const avgRating = 4.9;
  const totalReviews = reviews.length;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="PROVIDER" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Client Ratings & Feedback
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Read verified customer reviews, monitor your rating score, and respond to clients.
            </p>
          </div>
        </div>

        {/* Rating Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{avgRating}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Overall Performance Score</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">98%</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Positive Client Satisfaction</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{totalReviews}</span>
                <span className="text-xs text-slate-400">total</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Verified Customer Reviews</p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 mb-4">Latest Client Feedback</h2>

          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={rev.customerAvatar}
                    alt={rev.customerName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{rev.customerName}</h3>
                    <p className="text-xs text-emerald-600 font-medium">{rev.serviceTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">· {rev.date}</span>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {/* Provider's Reply if any */}
              {rev.providerReply && (
                <div className="ml-4 pl-4 border-l-2 border-emerald-500 bg-emerald-50/40 p-3.5 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-900">Your Response</span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                      Public Reply
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{rev.providerReply}</p>
                </div>
              )}

              {/* Reply trigger / box */}
              {!rev.providerReply && (
                <div>
                  {activeReplyBox === rev.id ? (
                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                      <textarea
                        rows={2}
                        value={replyText[rev.id] || ""}
                        onChange={(e) =>
                          setReplyText({ ...replyText, [rev.id]: e.target.value })
                        }
                        placeholder="Type a polite public reply to this client..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveReplyBox(null)}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(rev.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveReplyBox(rev.id)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5 pt-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reply to Client
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
