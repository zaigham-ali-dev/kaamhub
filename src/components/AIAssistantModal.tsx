"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, X, ArrowRight, Search, Clock, MapPin, CheckCircle2, ShieldCheck } from "lucide-react";
import { ServiceData } from "@/lib/types";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService?: (service: ServiceData) => void;
}

export default function AIAssistantModal({ isOpen, onClose, onSelectService }: AIAssistantModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    "My split AC is leaking water and not cooling",
    "Need deep cleaning for 3 bedroom flat tomorrow",
    "Circuit breaker keeps tripping when turning on geyser",
    "Need an O-Level physics and math tutor in Lahore",
    "Looking for wedding and Barat photography in Islamabad",
  ];

  const handleAsk = async (textToAsk?: string) => {
    const text = textToAsk || prompt;
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // Run AI Assistant
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                KaamHub AI Assistant
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                  Smart Match
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Explain your problem or request in plain language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Input Box */}
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g. 'I need an electrician to check my solar inverter in DHA Lahore tomorrow morning' or 'My AC is blowing warm air'..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 pr-12 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={loading || !prompt.trim()}
              className="absolute right-3 bottom-3 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick example chips */}
          {!result && (
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Try asking:</div>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp}
                    type="button"
                    onClick={() => {
                      setPrompt(qp);
                      handleAsk(qp);
                    }}
                    className="text-xs text-left px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors"
                  >
                    "{qp}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                Analyzing your request, identifying parameters, and matching certified professionals...
              </p>
            </div>
          )}

          {/* AI Result */}
          {result && !loading && (
            <div className="space-y-4 animate-in fade-in">
              {/* Extracted Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs space-y-2.5">
                <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Request Understood:</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{result.message}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.extracted?.serviceType && (
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 font-medium text-emerald-800">
                      Service: {result.extracted.serviceType}
                    </span>
                  )}
                  {result.extracted?.date && (
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 font-medium text-emerald-800">
                      Target Date: {result.extracted.date}
                    </span>
                  )}
                  {result.extracted?.time && (
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 font-medium text-emerald-800">
                      Slot: {result.extracted.time}
                    </span>
                  )}
                  {result.extracted?.location && (
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 font-medium text-emerald-800">
                      City: {result.extracted.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Matched Services list */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Recommended Certified Options
                </h4>

                <div className="space-y-3">
                  {result.services?.map((srv: ServiceData) => (
                    <div
                      key={srv.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            srv.coverImage ||
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100"
                          }
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                            {srv.title}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-700 font-medium">
                              {srv.provider?.user?.name}
                            </span>
                            <span>•</span>
                            <span>PKR {srv.price.toLocaleString()}</span>
                            <span>•</span>
                            <span>{srv.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Link
                          href={`/services/${srv.slug || srv.id}`}
                          onClick={onClose}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          View
                        </Link>
                        {onSelectService ? (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectService(srv);
                            }}
                            className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            Book Now
                          </button>
                        ) : (
                          <Link
                            href={`/services/${srv.slug || srv.id}`}
                            onClick={onClose}
                            className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            Book Now
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
