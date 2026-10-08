"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, MapPin, Heart, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { ServiceData } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface ServiceCardProps {
  service: ServiceData;
  onBookClick?: (service: ServiceData) => void;
}

export default function ServiceCard({ service, onBookClick }: ServiceCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(service.isFavorited || false);
  const [favLoading, setFavLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setFavLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorited(data.isFavorited);
      }
    } catch {
    } finally {
      setFavLoading(false);
    }
  };

  const providerUser = service.provider?.user;
  const rating = service.provider?.rating || 4.9;
  const totalReviews = service.provider?.totalReviews || 12;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={
            service.coverImage ||
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
          }
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          disabled={favLoading}
          aria-label="Save to favorites"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow flex items-center justify-center text-slate-600 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? "fill-rose-500 text-rose-500" : "text-slate-600"
            }`}
          />
        </button>

        {/* Category badge */}
        {service.category && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
            {service.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Provider row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <Link
              href={`/providers/${service.providerId}`}
              className="flex items-center gap-2 group/p"
            >
              <img
                src={
                  providerUser?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    providerUser?.name || "Provider"
                  )}&background=059669&color=fff`
                }
                alt={providerUser?.name || "Provider"}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-medium text-slate-700 group-hover/p:text-emerald-600 truncate max-w-[120px]">
                {providerUser?.name}
              </span>
              {service.provider?.verificationStatus === "VERIFIED" && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              )}
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({totalReviews})</span>
            </div>
          </div>

          {/* Service Title */}
          <Link href={`/services/${service.slug || service.id}`}>
            <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
              {service.title}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Location & Duration */}
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {service.location}
            </span>
            {service.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {service.duration}
              </span>
            )}
          </div>
        </div>

        {/* Footer with Price and CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              {service.priceType === "HOURLY"
                ? "Per Hour"
                : service.priceType === "STARTING_FROM"
                ? "Starting at"
                : "Fixed Rate"}
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              PKR {service.price.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/services/${service.slug || service.id}`}
              className="text-xs font-semibold px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
            >
              Details
            </Link>
            {onBookClick ? (
              <button
                type="button"
                onClick={() => onBookClick(service)}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1"
              >
                <span>Book</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <Link
                href={`/services/${service.slug || service.id}`}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1"
              >
                <span>Book</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
