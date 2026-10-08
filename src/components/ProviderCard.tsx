import React from "react";
import Link from "next/link";
import { Star, ShieldCheck, CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import { ProviderProfileData } from "@/lib/types";

interface ProviderCardProps {
  provider: ProviderProfileData;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const user = provider.user;
  const rating = provider.rating || 4.9;
  const reviews = provider.totalReviews || 0;
  const completed = provider.completedJobs || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-3.5">
          <div className="relative">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "Provider"
                )}&background=059669&color=fff`
              }
              alt={user?.name || "Provider"}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
            />
            {provider.verificationStatus === "VERIFIED" && (
              <span
                title="Verified Professional"
                className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-slate-900 text-base truncate group-hover:text-emerald-600 transition-colors">
                {user?.name}
              </h3>
            </div>
            <p className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
              {provider.profession}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{user?.location || "Karachi"}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {provider.bio && (
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {provider.bio}
          </p>
        )}

        {/* Specialties Tags */}
        {provider.specialties && provider.specialties.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {provider.specialties.slice(0, 2).map((spec, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-100/80"
              >
                ✓ {spec}
              </span>
            ))}
          </div>
        )}

        {/* Verification Strip */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100/60">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            NADRA CNIC Verified
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {provider.cnicNumber ? `${provider.cnicNumber.slice(0, 5)}-***` : "Verified"}
          </span>
        </div>

        {/* Stats Row */}
        <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-900">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{reviews} reviews</div>
          </div>

          <div className="border-x border-slate-200">
            <div className="text-xs font-bold text-slate-900">{completed}+</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Jobs done</div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-900">
              {provider.experience || "5+ yrs"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Experience</div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Starting from
          </span>
          <span className="text-sm font-bold text-slate-900">
            PKR {provider.startingPrice?.toLocaleString() || "1,500"}
          </span>
        </div>

        <Link
          href={`/providers/${provider.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white transition-colors shadow-sm"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
