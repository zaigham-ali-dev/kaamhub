"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Sparkles,
  Zap,
  Scissors,
  GraduationCap,
  Camera,
  Code,
  Car,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { CategoryData } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const iconsMap: Record<string, any> = {
    "home-repair": Wrench,
    cleaning: Sparkles,
    electrical: Zap,
    photography: Camera,
    tutoring: GraduationCap,
    beauty: Scissors,
    technology: Code,
    automotive: Car,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Service Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          All Service Categories
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Discover verified local specialists across Pakistan organized by industry and skill set.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = iconsMap[cat.slug] || Wrench;
            return (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className="group p-6 rounded-3xl border border-slate-200/90 bg-white hover:border-emerald-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                      {cat.serviceCount || 0} services
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {cat.description ||
                      "Certified professional services delivered by vetted local specialists."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>Browse services</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
