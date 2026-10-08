"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import ServiceCard from "@/components/ServiceCard";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { ServiceData } from "@/lib/types";

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      const json = await res.json();
      if (json.success) {
        setFavorites(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <DashboardSidebar role="CUSTOMER" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Favorites</h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of top-rated service listings and vetted specialists for future projects.
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading saved items...</div>
        ) : favorites.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <Heart className="w-12 h-12 text-rose-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No saved favorites yet</h3>
            <p className="text-xs text-slate-500">Click the heart icon on any service to save it here.</p>
            <Link
              href="/services"
              className="inline-block mt-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
