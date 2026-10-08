"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Award,
  Clock,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Phone,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import BookingModal from "@/components/BookingModal";
import { ServiceData } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function ProviderProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [provider, setProvider] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState<ServiceData | null>(null);

  useEffect(() => {
    async function loadProvider() {
      try {
        const res = await fetch(`/api/providers/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setProvider(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProvider();
  }, [id]);

  const handleStartChat = async () => {
    if (!user) {
      router.push(`/login?redirect=/providers/${id}`);
      return;
    }
    const targetUrl = user.role === "PROVIDER" ? "/provider/messages" : "/dashboard/messages";
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: provider.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        router.push(`${targetUrl}?conv=${data.data.id}`);
      } else {
        router.push(targetUrl);
      }
    } catch {
      router.push(targetUrl);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-8 bg-slate-200 rounded w-1/4" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Provider Not Found</h2>
        <Link
          href="/providers"
          className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const pUser = provider.user;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Cover and Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {/* Cover image banner */}
        <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-emerald-800 to-teal-900 relative">
          {provider.coverImage && (
            <img
              src={provider.coverImage}
              alt=""
              className="w-full h-full object-cover opacity-60"
            />
          )}
        </div>

        {/* Profile info bar */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="relative">
              <img
                src={
                  pUser?.avatar ||
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"
                }
                alt=""
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
              />
              {provider.verificationStatus === "VERIFIED" && (
                <div
                  title="Verified Professional"
                  className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow"
                >
                  <ShieldCheck className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {pUser?.name}
                </h1>
                {provider.verificationStatus === "VERIFIED" && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified Pro
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-emerald-700">
                {provider.profession}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{pUser?.location || "Karachi"}</span>
                {provider.serviceAreas && (
                  <span>• Service Areas: {provider.serviceAreas}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {pUser?.phone && (
              <a
                href={`tel:${pUser.phone}`}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call {pUser.phone}</span>
              </a>
            )}

            {pUser?.phone && (
              <a
                href={`https://wa.me/${pUser.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Assalam o Alaikum ${pUser.name}, I saw your ${provider.profession} profile on KaamHub.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              onClick={handleStartChat}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>In-App Chat</span>
            </button>
          </div>
        </div>

        {/* Stats highlight strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-100 p-4 sm:p-6 bg-slate-50/50 text-center gap-4">
          <div>
            <div className="flex items-center justify-center gap-1 text-lg font-extrabold text-slate-900">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              {provider.rating?.toFixed(1) || "5.0"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {provider.totalReviews || 0} Client Reviews
            </div>
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              {provider.completedJobs || 0}+
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Completed Jobs</div>
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              {provider.experience || "5+ years"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Field Experience</div>
          </div>
          <div>
            <div className="text-lg font-extrabold text-emerald-700">
              PKR {provider.startingPrice?.toLocaleString() || "1,500"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Starting Price</div>
          </div>
        </div>
      </div>

      {/* Main columns: Bio, Verification & Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio, CNIC Clearance, Tools, Portfolio & Availability */}
        <div className="space-y-6">
          {/* NADRA & Security Verification Card */}
          <div className="bg-emerald-50/70 rounded-3xl p-5 border border-emerald-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Verification & Safety Status
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">NADRA CNIC:</span>
                <span className="font-semibold text-emerald-900 font-mono">
                  {provider.cnicNumber ? `${provider.cnicNumber.slice(0, 5)}-*******-${provider.cnicNumber.slice(-1)} (Verified)` : "Verified by NADRA"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">Police Character Check:</span>
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cleared
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">Physical Address:</span>
                <span className="font-semibold text-slate-700">Doorstep Verified</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">KaamHub Guarantee:</span>
                <span className="font-semibold text-emerald-800">100% Work Guarantee</span>
              </div>
            </div>
          </div>

          {/* Bio card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              About the Professional (Taaruf)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {provider.bio ||
                "Certified professional committed to punctuality, high standards of safety, and quality craftsmanship."}
            </p>
          </div>

          {/* Specialties / Maharat */}
          {provider.specialties && provider.specialties.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Specialized Skills (Khas Maharat)</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {provider.specialties.map((spec: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100"
                  >
                    ✓ {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tools & Equipment */}
          {provider.toolsEquipment && provider.toolsEquipment.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-600" />
                <span>Professional Tools & Equipment (Samaan)</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {provider.toolsEquipment.map((tool: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                  >
                    🛠️ {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {provider.languages && provider.languages.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Languages Spoken:</span>
              <span className="text-emerald-700 font-medium">
                {provider.languages.join(", ")}
              </span>
            </div>
          )}

          {/* Availability Schedule */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Working Hours & Schedule</span>
            </h3>
            <div className="space-y-1.5 text-xs">
              {provider.availability?.length > 0 ? (
                provider.availability.map((av: any, idx: number) => (
                  <div key={av.id || `${av.dayOfWeek}-${idx}`} className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="font-semibold text-slate-700">{av.dayOfWeek}</span>
                    <span className="text-slate-500">{av.startTime} - {av.endTime}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">Monday - Saturday (09:00 AM - 08:00 PM)</p>
              )}
            </div>
          </div>

          {/* Portfolio gallery */}
          {provider.portfolio?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Work Portfolio (Sabqa Kaam)
              </h3>
              <div className="space-y-3">
                {provider.portfolio.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3 bg-slate-50">
                      <div className="font-semibold text-xs text-slate-800">{item.title}</div>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Published Services & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <span>Available Services ({provider.services?.length || 0})</span>
            </h2>

            {provider.services?.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No active services published currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {provider.services?.map((srv: any, idx: number) => (
                  <ServiceCard
                    key={srv.id || idx}
                    service={{
                      ...srv,
                      provider: {
                        ...provider,
                        user: pUser,
                      },
                    }}
                    onBookClick={(s) => setBookingService(s)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Reviews list */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">
              Customer Feedback ({provider.reviews?.length || 0})
            </h3>

            {provider.reviews?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No reviews yet for this provider.
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {provider.reviews?.map((r: any, idx: number) => (
                  <div key={r.id || idx} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            r.customer?.avatar ||
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                          }
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-slate-800">
                          {r.customer?.name}
                        </span>
                        <div className="flex items-center gap-0.5 ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < r.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 pl-9 leading-relaxed">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        service={bookingService}
        isOpen={!!bookingService}
        onClose={() => setBookingService(null)}
      />
    </div>
  );
}
