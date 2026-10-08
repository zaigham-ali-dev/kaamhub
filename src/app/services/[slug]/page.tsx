"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Heart,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
} from "lucide-react";
import BookingModal from "@/components/BookingModal";
import ServiceCard from "@/components/ServiceCard";
import { ServiceData } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    async function loadService() {
      try {
        const res = await fetch(`/api/services/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setService(json.data);
          setIsFavorited(json.data.isFavorited || false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadService();
  }, [slug]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push(`/login?redirect=/services/${slug}`);
      return;
    }
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
    } catch {}
  };

  const handleStartChat = async () => {
    if (!user) {
      router.push(`/login?redirect=/services/${slug}`);
      return;
    }
    const targetUrl = user.role === "PROVIDER" ? "/provider/messages" : "/dashboard/messages";
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: service.providerId,
          serviceId: service.id,
        }),
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
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Service Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">
          This service may have been unpublished or removed.
        </p>
        <Link
          href="/services"
          className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Services
        </Link>
      </div>
    );
  }

  const providerUser = service.provider?.user;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/services" className="hover:text-slate-700">Services</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{service.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Cover Image */}
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-md">
            <img
              src={
                service.coverImage ||
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80"
              }
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow flex items-center justify-center text-slate-600 hover:text-rose-500 transition-all hover:scale-105"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorited ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
            </button>
            {service.category && (
              <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                {service.category.name}
              </span>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {service.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {service.provider?.rating?.toFixed(1) || "5.0"}
                <span className="text-slate-400 font-normal">
                  ({service.provider?.totalReviews || 0} reviews)
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {service.location}
              </span>
              {service.duration && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {service.duration}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">About this Service</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {service.description}
            </p>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Background checked technician</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>30-Day post-service guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Transparent pricing, no surprises</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Pro diagnostic equipment included</span>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Client Reviews</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified feedback from completed appointments
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{service.provider?.rating?.toFixed(1) || "5.0"}</span>
              </div>
            </div>

            {service.reviews?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No reviews yet. Be the first to review after booking!
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {service.reviews?.map((r: any) => (
                  <div key={r.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            r.customer?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              r.customer?.name || "Client"
                            )}&background=059669&color=fff`
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {r.customer?.name}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3 h-3 ${
                                  idx < r.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-10">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Booking Card & Provider Box */}
        <div className="space-y-6">
          {/* Booking Action Card */}
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-5">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Standard Pricing
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  PKR {service.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">
                  ({service.priceType === "HOURLY" ? "per hour" : "flat fee"})
                </span>
              </div>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleStartChat}
              className="w-full py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Chat with Provider</span>
            </button>

            {/* Provider Mini Card */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Service Provider
              </span>

              <div className="flex items-start gap-3">
                <img
                  src={
                    providerUser?.avatar ||
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                  }
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {providerUser?.name}
                    </h4>
                    {service.provider?.verificationStatus === "VERIFIED" && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {service.provider?.profession}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {service.provider?.completedJobs || 0} jobs completed
                  </p>
                </div>
              </div>

              <Link
                href={`/providers/${service.providerId}`}
                className="mt-3 block text-center text-xs font-semibold text-emerald-600 hover:underline"
              >
                View full profile & portfolio →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        service={service}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
}
